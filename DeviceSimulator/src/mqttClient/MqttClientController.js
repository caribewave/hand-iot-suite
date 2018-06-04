import { connect } from "mqtt";
import config from "../configs/config";

export default class MqttClientController {
    constructor(url, clientId) {
        this.mqtServerPath = url;
        this.clientId = clientId;
    }
    ConnectAndSubscribe(ProcessMessageHandler) {
        const options = config.MQTTOptions.mqttConnectionOptions;
        options.clientId = config.deviceId;
        this.client = connect(this.mqtServerPath, options);

        this.client.on('connect', (connack) => {
            // When connected
            console.log('connected to the server');
            if (connack.sessionPresent) {
                console.log('Already subbed, no subbing necessary');
            } else {
                let subscribeTopics = config.MQTTOptions.receiveMessageTopics;
                console.log('first connection, subscribing to topics!');
                for (var key in subscribeTopics) {
                    if (subscribeTopics.hasOwnProperty(key)) {
                        this.SubscribeToTopic(subscribeTopics[key]+this.clientId);
                    }
                }
            }
        });
        // when a message arrives, do something with it
        this.client.on('message', function (topic, message, packet) {
            ProcessMessageHandler(topic, message, packet);
        });        
        this.client.on("error", function (error) {
            console.log('ERROR connecting to the MQTT server ' + error);
        });
    }
    
    SubscribeToTopic(topic) {
        // subscribe to a topic
        if (!this.client)
            console.log('Please connect before subscribing to topics!!!');
        this.client.subscribe(topic, function () {
            console.log('subscribed to topic ' + topic);
        });
    }
    
    PublishToTopicMessage(topic, message) {
        // publish a message to a topic
        this.client.publish(topic, message, function () {
            console.log(`Message ${message} is published to topic ${topic}`);
        });
    }
    
    CloseClientConnection() {
        this.client.end();
        this.client.on('end', function () {
            console.log('Client Connection Closed');
        });
    }
}