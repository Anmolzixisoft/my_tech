var express = require('express')
const resetRouter = express.Router();
const {resetPass}=require('../controllers/resetPass.controller')
resetRouter.post('/resetPass', resetPass);


module.exports = resetRouter;