var express = require('express')
const vehicleRouter = express.Router();
const { vehicleAdd, activeDiactiveVAhicle,getallvehicle, myorder, updateVehicle, deleteVehicle, gteByid, ProjuctgteByid, getStates, getCity } = require('../controllers/vehicle.controller')
const { singleUpload } = require('../middleware/multer')

vehicleRouter.post('/vehicleAdd', singleUpload, vehicleAdd);
vehicleRouter.get('/getAllVehicle', getallvehicle)
vehicleRouter.post('/activeDiactiveVAhicle',activeDiactiveVAhicle)
vehicleRouter.post('/updateVehicle', singleUpload, updateVehicle);
vehicleRouter.post('/deleteVehicle', singleUpload, deleteVehicle);
vehicleRouter.post('/getVehicleById', singleUpload, gteByid);
vehicleRouter.post('/getVehicleByIdproduct', singleUpload, ProjuctgteByid);
vehicleRouter.get('/get-states', getStates);
vehicleRouter.post('/getcity', singleUpload, getCity)
vehicleRouter.post('/myorder', singleUpload, myorder)

module.exports = vehicleRouter;