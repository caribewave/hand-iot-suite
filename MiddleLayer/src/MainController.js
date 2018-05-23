import config from "./configs/config";
import ProtobufController from './protoModule/ProtobufController';
import MqttClientController from './mqttClient/MqttClientController';
import CumulocityController from './cumulocity/CumulocityController';
import MongoDbController from './dataLayer/MongoDbController';
import winston from 'winston';

winston.level = process.env.LOG_LEVEL || config.loggingLevel;
winston.configure({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: '../Logs/MiddleLayer.log' })
    ]
});
const myProto = new ProtobufController(config.paths.protoFilePath);
const mqttBrokerClient = new MqttClientController(config.MQTTOptions.serverPath,
    config.MQTTOptions.mqttConnectionOptionObject);
const cumulocity = new CumulocityController();
const mongoDbController = new MongoDbController();
let messageQueue = [];
let processing = false;
let decodedData;

async function main() {
    // const collection;
    try {
        await mongoDbController.connect();
    }
    catch (err) {
        winston.error('Connection to MONGO failed ', { error: err });
        process.exit();
    }
    try {
        mqttBrokerClient.ConnectAndSubscribe(config.MQTTOptions.receiveMessageTopics,
            ProcessDataMessageHandler);
    }
    catch (err) {
        winston.error('Connection to MQTT Broker failed with error: ', { error: err });
        process.exit();
    }
    //start the process of the message queue to be sent to Cumulocity
    setInterval(processQueue, config.queueProcessingInterval);
}

function processQueue() {
    var messageIsSentToCumulocity;
    if (processing) return; //we already have a process started for managing the queue
    var isConnectionAvailable = true;//used for parsing the queue only once
    var index = 0;
    while (messageQueue.length > 0 && isConnectionAvailable) {
        winston.info('!!!!!!!!!!!!!!starting queue processing !!!!!!!!!!!!!!', { index: index, queueLength: messageQueue.length });
        processing = true;
        var firstElement = messageQueue[0];
        //send data to cumulocity
        try {
            messageIsSentToCumulocity = cumulocity.ProcessData(firstElement.decodedData, firstElement.topic);
        }
        catch (err) {
            winston.error('Cumulocity Controller is throwing error', { error: err });
            //process.exit(1);
        }
        if (messageIsSentToCumulocity) {
            //remove the processed first element 
            messageQueue.splice(0, 1);
            index++;
        }
        else {
            //exit from loop because connection is down
            isConnectionAvailable = false;
        }
    }
    //we finished sending the queue
    processing = false;
}
async function ProcessDataMessageHandler(topic, message) {
    winston.info('===================================RECEIVED==================================');
    winston.info('RECEIVED buffer on', { topic: topic });

    try {
        //assign the protofile 
        await myProto.LoadProtoFile(config.paths.protoFilePath);
    }
    catch (err) {
        winston.error('proto root file cannot be mapped', { error: err });
    }

    //decode the buffer
    //based on topic (alarm, csvdata etc) use different proto message
    switch (topic) {
        case config.MQTTOptions.receiveMessageTopics.receivedPackageTopic:
            //winston.info('we have weather topic');
            decodedData = myProto.DecodeBuffer(message, config.csvConfig.csvDataLookupType);
            if (decodedData) {
                await SaveToMongo(decodedData, config.MongoDBOptions.weatherDataCollectionName);
                //send confirmation of receiving package
                mqttBrokerClient.PublishMessageToTopic(config.MQTTOptions.sendMessageTopics.csvDataTopic,
                    `Package "${decodedData.packageId}" processed by server`);
                //add the message to the queue
                messageQueue.push({ decodedData, topic });
            }
            break;
        case config.MQTTOptions.receiveMessageTopics.alertTopic:
            //winston.info('we have alarm topic');
            decodedData = myProto.DecodeBuffer(message, config.csvConfig.csvAlertLookupType);
            if (decodedData.packageId) {
                await SaveToMongo(decodedData, config.MongoDBOptions.alertDataCollectionName);
                //send confirmation of receiving package
                mqttBrokerClient.PublishMessageToTopic(config.MQTTOptions.sendMessageTopics.alertReceivedTopic,
                    `Package "${decodedData.packageId}" processed by server`);
                //add the message to the queue
                messageQueue.push({ decodedData, topic });
            }
            break;
        default:
            winston.error('------------>the topic is unknown!!!!<---------------');
    }
}

async function SaveToMongo(decodedData, collectionName) {
    //save to MongoDB
    try {
        await mongoDbController.SaveData(decodedData, collectionName);
    }
    catch (err) {
        winston.error('Collection INSERT MONGO failed ', { error: err });
        process.exit(1);
    }
}

main();
process.once('uncaughtException', (err) => {
    winston.error('Uncaught Exception at main Level', { error: err });
    //do some cleanup
    //exit anyway
    process.exit(1);
});