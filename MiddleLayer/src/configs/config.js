// config.js
const serverHost = process.env.MOSQUITTO_ENV || 'localhost';

module.exports = {
    clientId: 'MiddleLayer',
    loggingLevel: 'debug',
    queueProcessingInterval: 1000 * 5,//every 5 seconds
    paths: {
        protoFilePath: '../static_data/data.proto'
    },
    csvConfig: {
        csvDataLookupType: "Simulator.SimulatorData",
        csvAlertLookupType: "Simulator.WeatherStationAlarmPacket"
    },
    MQTTOptions: {
        serverPath: 'mqtt://' + serverHost,
        cumulocityOptions: {
            serverPath: 'mqtt://hand.post-iot.lu',
            username: 'hand/hand',
            password: 'h@nd-t3ch!',
            topics: ['s/e', 's/ds'],
            customMeasurementTemplateNumber: "200",
            alarmTemplateNumber:"301",
        },
        sendMessageTopics: {
            csvDataTopic: 'packageReceivedTopic',
            alertReceivedTopic: 'alertReceivedTopic'
        },
        receiveMessageTopics: {
            receivedPackageTopic: 'weatherData',
            alertTopic: 'alert'
        },
        mqttConnectionOptionObject: {
            port: 1883,
            clientId: 'MiddleLayer',
            keepalive: 60,
            reconnectPeriod: 1000,
            connectTimeout: 3000,
            protocolId: 'MQIsdp',
            protocolVersion: 3,
            clean: true,
            encoding: 'utf32',
            username: 'hand',
            password: 'h@nd-t3ch!',
        }
    },
    MongoDBOptions: {
        hosts: process.env.MONGO_ENV || 'localhost:27017',
        database: 'CSVData',
        options: '',
        weatherDataCollectionName: 'WeatherStation',
        alertDataCollectionName: 'Alerts',
        devicesCollectionName:'Devices',
        apiUsersCollectionName: 'ApiUsers'
    },
    ApiSettings:{
        port : 60000
    }
};