import csv from "fast-csv";
import config from "./configs/config";
import ProtobufController from './protoModule/ProtobufController';
import MqttClientController from './mqttClient/MqttClientController';
const csvDataProto = new ProtobufController(config.paths.protoFilePath);
const mqttClient = new MqttClientController(config.MQTTOptions.serverPath, config.deviceId);
var csvData = [];

async function main() {
    try {
        await csvDataProto.LoadProtoFile(config.paths.protoFilePath);
        mqttClient.ConnectAndSubscribe(ProcessMessageHandler);
        //mqttClient.SubscribeToTopic('csvData');
    }
    catch (err) {
        console.log('CSV data proto root file cannot be mapped');
        throw Error(err);
    }

    // create request to read weather data
    csv
        .fromPath(config.paths.csvDataPath, { headers: true })
        .on("data", (data) => {
            data.deviceId = config.deviceId;
            data.packageId = randomIntFromInterval(1, 10000000000).toString();
            csvData.push(data);
        })
        .on("end", async () => {
            console.log("csv file done reading");
            //sending data            
            sendData();
        });

    //send allerts every hour
    //sendAlarms();
    setInterval(sendAlarms, config.sendingAlarmInterval);//1000 * 60 * 60
}

//send every 5 minutes data to the broker
function sendData() {
    var counter = 0,
        timer = setInterval(function () {
            processData(csvData[counter]);
            counter++;
            if (counter === csvData.length) {
                clearInterval(timer);
                mqttClient.CloseClientConnection();
                process.exit(0);
            }
        }, config.csvDataSendingInterval);
}

function processData(csvObject) {
    //get buffer function 
    try {
        let buffer = csvDataProto.GetBuffer(csvObject, config.csvConfig.csvDataLookupType);
        //send to broker        
        mqttClient.PublishToTopicMessage(config.MQTTOptions.sendMessageTopics.csvDataTopic, buffer);
    }
    catch (err) {
        console.log("error getting proto buffer" + err);
        //throw Error(err);
    }
}

function sendAlarms() {
    var WeatherStationAlarmPacket = {
        deviceId: config.deviceId,
        packageId: randomIntFromInterval(1, 10000000000).toString(),
        insideAlarms: randomIntFromInterval(1, 2) - 1,
        rainAlarms: randomIntFromInterval(1, 2) - 1,
        ousideAlarms: randomIntFromInterval(1, 2) - 1,
        humidityAlarms: randomIntFromInterval(1, 2) - 1,
        tempAlarms: randomIntFromInterval(1, 2) - 1,
        soilLeafAlarms: randomIntFromInterval(1, 2) - 1
    };

    try {
        let buffer = csvDataProto.GetBuffer(WeatherStationAlarmPacket, config.csvConfig.csvAlertLookupType);
        mqttClient.PublishToTopicMessage(config.MQTTOptions.sendMessageTopics.alertTopic, buffer);
    }
    catch (err) {
        console.log('UNABLE TO GET BUFFER FOR ALARMS !!!!' + err);
    }
}
function ProcessMessageHandler(topic, message) {
    console.log(`'${message}'`);
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

main();

process.once('uncaughtException', (err) => {
    console.log(err);
    //do some cleanup
    //exit anyway
    process.exit(1);
});