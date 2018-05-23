import config from "../configs/config";
import MqttClientController from '../mqttClient/MqttClientController';
import helper from "../helpers/helper";
import winston from 'winston';

export default class CumulocityController {
    constructor() {
        this.mqttCumulocityClients = [];
    }
    ProcessData(decodedData, topic) {
        let cumulocityConnectionObject = this.RetrieveCumulocityConnection(decodedData.deviceId);
        if (cumulocityConnectionObject === 'undefined') {
            winston.info(`creation of mqtt connection for ${decodedData.deviceId}`);
            let cumulociyConnectionOptions = config.MQTTOptions.mqttConnectionOptionObject;
            cumulociyConnectionOptions.clientId = decodedData.deviceId;
            cumulociyConnectionOptions.username = config.MQTTOptions.cumulocityOptions.username;
            cumulociyConnectionOptions.password = config.MQTTOptions.cumulocityOptions.password;

            let mqttCumulocityClient = new MqttClientController(config.MQTTOptions.cumulocityOptions.serverPath,
                cumulociyConnectionOptions);
            try {
                mqttCumulocityClient.ConnectAndSubscribe(config.MQTTOptions.cumulocityOptions.topics, this.ProcessMessagesFromCumulocity);
            }
            catch (err) {
                winston.error('Connection to Cumulocity MQTT Broker failed!', { error: err });
                throw err;
            }

            cumulocityConnectionObject = {
                deviceId: decodedData.deviceId,
                connectionClient: mqttCumulocityClient
            };

            this.mqttCumulocityClients.push(cumulocityConnectionObject);
        }
        //if there is no connection 
        if (!cumulocityConnectionObject.connectionClient.IsClientConnected())
            return false;

        switch (topic) {
            case config.MQTTOptions.receiveMessageTopics.receivedPackageTopic:
                this.PublishDataToCumulocity(decodedData, cumulocityConnectionObject);
                break;
            case config.MQTTOptions.receiveMessageTopics.alertTopic:
                this.PublishAlarmToCumulocity(decodedData, cumulocityConnectionObject);
                break;
            default:
                winston.error('Didn\'t publish to Cumulocity. Unknown topic', { topic: topic });
                return false;
        }

        return true;
    }

    RetrieveCumulocityConnection(deviceId) {
        for (let i = 0; i < this.mqttCumulocityClients.length; i++) {
            if (this.mqttCumulocityClients[i].deviceId == deviceId) {
                winston.info('---> EXISTING MQTT Connection FOUND <----');
                return this.mqttCumulocityClients[i];
            }
        }
        return 'undefined';
    }

    PublishDataToCumulocity(decodedData, cumulocityConnectionObject) {
        //register device to cumulocity
        var registrationMessage = `100,${decodedData.deviceId},c8y_MQTTDevice`;
        cumulocityConnectionObject.connectionClient.PublishMessageToTopic("s/us", registrationMessage);
        //var cumulocityTimeStamp = helper.convertToUTCTime(decodedData.Timestamp).toISOString();
        //cumulocityTimeStamp = cumulocityTimeStamp.slice(0, -1) + "+00:00";
        for (var key in decodedData) {
            if (decodedData.hasOwnProperty(key)) {
                if (typeof decodedData[key] != "string" && decodedData[key] > 0
                    && key != 'Timestamp' && key != 'deviceId' && key != 'packageId') {
                    var message = `${config.MQTTOptions.cumulocityOptions.customMeasurementTemplateNumber},${key},${key},${decodedData[key]},${key}`;//,${cumulocityTimeStamp}
                    cumulocityConnectionObject.connectionClient.PublishMessageToTopic("s/us", message);
                    //winston.info(`Cumulocity publishing ${message}`);
                } else {
                    //winston.info(`Cumulocity: we don't publish ${key} because value is  ${decodedData[key]}`);
                }
            }
        }
    }
    PublishAlarmToCumulocity(decodedData, cumulocityConnectionObject) {
        var registrationMessage = `100,${decodedData.deviceId},c8y_MQTTDevice`;
        cumulocityConnectionObject.connectionClient.PublishMessageToTopic("s/us", registrationMessage);
        for (var key in decodedData) {
            if (decodedData.hasOwnProperty(key)) {
                if (key != 'Timestamp' && key != 'deviceId' && key != 'packageId' && decodedData[key] != 0) {
                    var message = `${config.MQTTOptions.cumulocityOptions.alarmTemplateNumber}, c8y_${key}, Alarm sent from simulator for ${key}`;
                    cumulocityConnectionObject.connectionClient.PublishMessageToTopic("s/us", message);
                    //winston.info(`Cumulocity publishing ${message}`);
                } else {
                    //winston.info(`Cumulocity: we don't publish ${key} because value is  ${decodedData[key]}`);
                }
            }
        }
    }
    ProcessMessagesFromCumulocity(topic, message, packet) {
        winston.info('Cumulocity sent:====>', { message: message.toString(), topic: topic });
    }
}