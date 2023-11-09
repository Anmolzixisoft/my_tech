var express = require('express')
const singUpRouter = express.Router();
const { checkIfUserExists } = require("../middleware/userexists")
const { multiplepUload ,singleUpload } = require('../middleware/multer')
const { signUp, getuser, AdduserDetails, getuserById,verifyotp } = require('../controllers/singUp.controller');

singUpRouter.post('/signUp', checkIfUserExists, singleUpload,signUp);
singUpRouter.get('/getuser', getuser)
singUpRouter.post('/AdduserDetails', multiplepUload, AdduserDetails)
singUpRouter.post('/getuserById',singleUpload, getuserById)
singUpRouter.post('/verifyotp',singleUpload,verifyotp)

module.exports = singUpRouter;

