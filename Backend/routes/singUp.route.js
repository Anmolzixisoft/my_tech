var express = require('express')
const singUpRouter = express.Router();
const { checkIfUserExists } = require("../middleware/userexists")
const { multiplepUload ,singleUpload } = require('../middleware/multer')
const { signUp, getuser, AdduserDetails, getuserById } = require('../controllers/singUp.controller');

singUpRouter.post('/signUp', checkIfUserExists, singleUpload,signUp);
singUpRouter.get('/getuser', getuser)
singUpRouter.post('/AdduserDetails', multiplepUload, AdduserDetails)
singUpRouter.post('/getuserById',singleUpload, getuserById)

module.exports = singUpRouter;

