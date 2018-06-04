// config.js
const serverHost = process.env.MOSQUITTO_ENV || 'localhost';
module.exports = {
    deviceId: 'Device_Simulator',
    sendingAlarmInterval: 1000 * 30,//every 30 seconds
    csvDataSendingInterval: 1000 * 5,//every 5 seconds
    paths: {
        csvDataPath: '../static_data/data.csv',
        protoFilePath: '../static_data/data.proto'
    },
    csvConfig: {
        csvDataLookupType: "Simulator.SimulatorData",
        csvAlertLookupType: "Simulator.WeatherStationAlarmPacket"
    },
    MQTTOptions: {
        serverHost: process.env.MOSQUITTO_ENV || 'localhost',
        serverPath: 'mqtt://' + serverHost,
        sendMessageTopics: {
            csvDataTopic: 'weatherData',
            alertTopic: 'alert'
        },
        receiveMessageTopics: {
            receivedPackageTopic: 'packageReceivedTopic',
            alertReceivedTopic: 'alertReceivedTopic'
        },
        mqttConnectionOptions :{
            port: 1883,            
            username: 'hand',
            password: 'h@nd-t3ch!',
            keepalive: 60,
            reconnectPeriod: 1000,
            protocolId: 'MQIsdp',
            protocolVersion: 3,
            clean: true,
            encoding: 'utf32'
        }
    }
};