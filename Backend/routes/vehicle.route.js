var express = require('express')
const vehicleRouter = express.Router();
const { vehicleAdd, getallvehicle ,updateVehicle ,deleteVehicle,gteByid} = require('../controllers/vehicle.controller')
const { singleUpload } = require('../middleware/multer')
vehicleRouter.post('/vehicleAdd', singleUpload, vehicleAdd);
vehicleRouter.get('/getAllVehicle', getallvehicle)
vehicleRouter.post('/updateVehicle', singleUpload, updateVehicle);
vehicleRouter.post('/deleteVehicle', singleUpload, deleteVehicle);
vehicleRouter.post('/getVehicleById', singleUpload,gteByid)


module.exports = vehicleRouter;