import * as DeviceRoutesController from '../api/DeviceRoutesController';

export function StartRoutes(app, mongoDbController) {
    DeviceRoutesController.DeviceRoutes(app, mongoDbController);
}

