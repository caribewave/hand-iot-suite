import config from "../configs/config";
import mongodb from "mongodb";
import helper from "../helpers/helper";
import winston from 'winston';

export default class MongoDbController {

    constructor() {
        // let connectionString = 'mongodb://' + config.MongoDBOptions.username + ':' + config.MongoDBOptions.password + '@'
        //     + config.MongoDBOptions.hosts + '/' + config.MongoDBOptions.database + config.MongoDBOptions.options;
        this.connectionString = 'mongodb://' + config.MongoDBOptions.hosts + '/' + config.MongoDBOptions.database;
        this.db = {};
        return this;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            mongodb.MongoClient.connect(this.connectionString, (err, db) => {
                if (err) reject(err)
                this.db = db
                resolve(this)
            });
        });
    }
    async SaveData(decodedData, collectionName) {
        try {
            let collection = this.db.collection(collectionName);
            //create a new insert object
            var objToInsert = {};
            for (var key in decodedData) {
                if (decodedData.hasOwnProperty(key)) {
                    //console.log(key + " -> " + decodedData[key]);
                    if (key == 'Timestamp') {
                        objToInsert[key] = helper.convertToUTCTime(decodedData[key]);
                    }
                    else objToInsert[key] = decodedData[key];
                }
            }

            return await collection.insert(objToInsert);
        }
        catch (err) {
            winston.error('Collection INSERT in MONGO failed ', { error: err });
            throw err;
        }
    }
    async FindOneItem(details, collectionName) {
        try {
            let collection = this.db.collection(collectionName);
            //create a new insert object
            return await collection.findOne(details);
        }
        catch (err) {
            winston.error('Collection FIND in MONGO failed ', { error: err });
            throw err;
        }
    }
    async UpdateItem(query, updatedObj, collectionName) {
        try {
            let collection = this.db.collection(collectionName);
            //create a new insert object
            return await collection.update(query, updatedObj);
        }
        catch (err) {
            winston.error('Collection UPDATE in MONGO failed ', { error: err });
            throw err;
        }
    }
}