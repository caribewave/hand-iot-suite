import protobuf from "protobufjs";
import winston from 'winston';

export default class ProtobufController {
    constructor(protoFilePath) {
        this.protoFilePath = protoFilePath;
        this.root;
    }
    async LoadProtoFile() {
        return new Promise((resolve, reject) => {
            protobuf.load(this.protoFilePath)
                .then((root) => {
                    this.root = root;
                    return resolve(root);
                })
                .catch((err) => {
                    winston.error('Load .proto failed!!!', { error: err });
                    reject(err);
                })
        });
    }
    GetBuffer(data, lookupType) {
        // Obtain a message type
        let AwesomeMessage = root.lookupType(lookupType);

        //convert to float types
        let payload = this._transformToFloat(data);
        //console.log(payload);

        // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
        var errMsg = AwesomeMessage.verify(payload);
        if (errMsg) {
            throw Error(errMsg);
        }
        // Create a new message
        var message = AwesomeMessage.create(payload);

        // Encode a message to an Uint8Array (browser) or Buffer (node)
        var buffer = AwesomeMessage.encode(message).finish();
        //console.log("bufferul este: "+buffer.toString());
        return buffer;
    }

    DecodeBuffer(buffer, lookupType) {
        let AwesomeMessage = this.root.lookupType(lookupType);
        // Decode an Uint8Array (browser) or Buffer (node) to a message
        let message = AwesomeMessage.decode(buffer);
        //show all properties of future encoded data
        // for (var key in message) {
        //     if (message.hasOwnProperty(key)) {
        //         console.log(`${key} has value -> ${message[key]}`);
        //     }
        // }        
        return message;
    }

    _transformToFloat(collection) {
        let data = collection;
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                if (key != 'Timestamp') {
                    data[key] = parseFloat(data[key]);
                }
            }
        }
        return data;
    }
}