import bodyParser from 'body-parser';
import express from 'express'
import * as RoutesController from '../api/RoutesController';
const app = express();
const port = 60000;

export function StartServer(mongoDbController) {
    app.use(bodyParser.urlencoded({ extended: true }));    
    
    RoutesController.StartRoutes(app, mongoDbController);
    
    app.listen(port, () => {
        console.log('We are live on ' + port);
    });
}