import { connect } from "mqtt";
import winston from 'winston';

export default class MqttClientController {
    constructor(url, options) {
        this.mqtServerPath = url;
        this.options = options;
    }
    ConnectAndSubscribe(subscribeTopics, ProcessMessageHandler) {
        this.client = connect(this.mqtServerPath, this.options);

        this.client.on('connect', (connack) => {
            // When connected
            winston.info('MQTT connected');
            if (connack.sessionPresent) {
                winston.info('Already subbed, no subbing necessary');
            } else {
                winston.info('first connection, subscribing to topics!');
                for (let key in subscribeTopics) {
                    if (subscribeTopics.hasOwnProperty(key)) {
                        this.SubscribeToTopic(subscribeTopics[key]);
                    }
                }
            }
        });
        // when a message arrives, do something with it
        this.client.on('message', function (topic, message, packet) {
            ProcessMessageHandler(topic, message, packet);
        });
        this.client.on('error', (err) => {
            winston.error(`Cannot connect to ${this.mqtServerPath}`, { error: err });
            throw (err);
        });
    }
    SubscribeToTopic(topic) {
        // subscribe to a topic
        if (!this.client.connected)
            winston.info('Please connect before subscribing to topics!!!');

        this.client.subscribe(topic, function () {
            winston.info('subscribed to topic ' + topic);
        });
    }
    PublishMessageToTopic(topic, mqttMessage) {
        // publish a message to a topic
        this.client.publish(topic, mqttMessage, function () {
            winston.info('Publishing --->', { topic: topic, mqttMessage: mqttMessage.toString() });
        });
    }
    CloseClientConnection() {
        this.client.end();
        this.client.on('end', function () {
            winston.info('MQTT Client Connection Closed');
        });
    }
    IsClientConnected() {
        return this.client.connected;
    }
}