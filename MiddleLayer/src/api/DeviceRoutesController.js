import winston from 'winston';
import config from "../configs/config";

export function DeviceRoutes(app, mongoDbController) {
    app.get('/devices/:id', async (req, res) => {
        let readResult;
        const details = { 'deviceId': req.params.id };
        try {
            readResult = await mongoDbController.FindOneItem(details, config.MongoDBOptions.devicesCollectionName);
        } catch (err) {
            res.send({ error: err });
            winston.error('READ from Collection failed!', { error: err });
        }
        winston.info(`API object requested ${JSON.stringify(readResult)}`);
        res.send(readResult);
    });

    app.post('/devices', async (req, res) => {
        let insertResult;
        let device = {
            deviceId: req.body.deviceId,
            deviceDescription: req.body.description,
            lastUpdated: new Date(Date.now()).toISOString(),
            isDeleted: req.body.isDeleted
        };
        const details = { 'deviceId': req.body.deviceId };
        try {
            let readResult = await mongoDbController.FindOneItem(details, config.MongoDBOptions.devicesCollectionName);
            if (readResult != null) {
                res.send({ error: `device with ID: ${req.body.deviceId} allready exists. Use update to update details or mark as deleted!` });
            }
            else {
                insertResult = await mongoDbController.SaveData(device, config.MongoDBOptions.devicesCollectionName);
                winston.info(`API object INSERTED ${JSON.stringify(insertResult.ops[0])}`);
                res.send(insertResult.ops[0]);
            }
        } catch (err) {
            res.send({ error: err });
            winston.error('INSERT to Collection failed!', { error: err });
        }
    });

    app.put('/devices/:id', async (req, res) => {
        let updateObject = {};
        const query = { 'deviceId': req.params.id };
        try {
            let readResult = await mongoDbController.FindOneItem(query, config.MongoDBOptions.devicesCollectionName);

            updateObject = {
                deviceId: req.params.id,
                deviceDescription: req.body.description || readResult.deviceDescription,
                lastUpdated: new Date(Date.now()).toISOString(),
                isDeleted: req.body.isDeleted || readResult.isDeleted
            };
            await mongoDbController.UpdateItem(query, updateObject, config.MongoDBOptions.devicesCollectionName);
        } catch (err) {
            winston.error('Update failed!', { error: err });
            res.send({ error: err });
        }
        winston.info(`API object UPDATED ${JSON.stringify(updateObject)}`);
        res.send(updateObject);
    });
}