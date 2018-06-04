import auth from "basic-auth";
import config from "../configs/config";
import winston from 'winston';

export default function (db) {
    return async function (req, res, next) {
        var user = auth(req);
        if (!await valid(user, db)) {            
            res.set('WWW-Authenticate', 'Basic realm="User Visible Realm" charset="UTF-8"');
            return res.status(401).send();
        }
        return next();
    }
}
async function valid(user, db) {
    if (!user || !user.name || !user.pass) {
        winston.info(`User is not set or missing username or password`);
        return false;
    }
    try {
        var query = { user: user.name };
        let userResult = await db.FindOneItem(query, config.MongoDBOptions.apiUsersCollectionName);
        if (!userResult || userResult.pass != user.pass) {
            winston.info(`MONGO user not found OR password did NOT MATCH!`);
            return false;
            //return userResult.pass == user.pass ? true : false;
        }
        return true;
    }
    catch (err) {
        winston.error('retrieve authorization user failed!', { error: err });
        return false;
    }
}