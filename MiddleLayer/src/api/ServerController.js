import bodyParser from 'body-parser';
import express from 'express'
import * as RoutesController from '../api/RoutesController';
import config from "../configs/config";
import Authorize from '../api/AuthorizationController.js'
const app = express();
const port = config.ApiSettings.port;

export function StartServer(mongoDbController) {
    app.use(bodyParser.urlencoded({ extended: true }));
    
    app.use(Authorize(mongoDbController));
    
    RoutesController.StartRoutes(app, mongoDbController);

    app.listen(port, () => {
        console.log('API is live on ' + port);
    });
}