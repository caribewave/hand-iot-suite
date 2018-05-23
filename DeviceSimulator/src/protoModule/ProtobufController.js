import protobuf from "protobufjs";

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
                    console.log('Load .proto failed with: ' + err);
                    reject(err);
                })
        });
    }
    GetBuffer(data, lookupType) {
        // Obtain a message type
        let AwesomeMessage = this.root.lookupType(lookupType);

        //convert to float types
        let payload = this._transformToFloat(data);
        //show all properties of future encoded data
        // for (var key in payload) {
        //     if (payload.hasOwnProperty(key)) {
        //         console.log(`${key} has value -> ${payload[key]}`);
        //     }
        // }

        // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
        var errMsg = AwesomeMessage.verify(payload);
        if (errMsg) {
            throw Error(errMsg);
        }

        // Create a new message
        var message = AwesomeMessage.create(payload);

        // Encode a message to an Uint8Array (browser) or Buffer (node)
        var buffer = AwesomeMessage.encode(message).finish();

        return buffer;
    }

    DecodeBuffer(buffer, lookupType) {
        let AwesomeMessage = this.root.lookupType(lookupType);
        // Decode an Uint8Array (browser) or Buffer (node) to a message
        let message = AwesomeMessage.decode(buffer);
        // ... do something with message
        //for now just display the content decoded
        for (var key in message) {
            if (message.hasOwnProperty(key)) {
                console.log(key + " -> " + message[key]);
            }
        }
    }

    _transformToFloat(collection) {
        let data = collection;
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                //console.log(key + " -> " + p[key]);
                if (key != 'Timestamp' && key != 'deviceId') {
                    data[key] = parseFloat(data[key]);
                }
            }
        }
        return data;
    }
}