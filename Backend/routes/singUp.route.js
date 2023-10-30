var express = require('express')
const singUpRouter = express.Router();
const { checkIfUserExists } = require("../middleware/userexists")
const { multiplepUload } = require('../middleware/multer')
const { signUp, getuser, AdduserDetails, getuserById } = require('../controllers/singUp.controller');

singUpRouter.post('/signUp', checkIfUserExists, signUp);
singUpRouter.get('/getuser', getuser)
singUpRouter.post('/AdduserDetails', multiplepUload, AdduserDetails)
singUpRouter.post('/getuserById', getuserById)

module.exports = singUpRouter;