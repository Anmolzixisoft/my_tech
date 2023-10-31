var express = require('express')
const loginRouter = express.Router();
const passport = require('passport');
const { singleUpload } = require('../middleware/multer')
const { login, verifyByOtp, setPass, sentOtp, adminLogin, activeDiactiveUser } = require('../controllers/login.controller');
loginRouter.post('/login', singleUpload, login);
loginRouter.post('/verifybyotp', singleUpload, verifyByOtp)
loginRouter.post('/sentOtp', singleUpload, sentOtp)
loginRouter.post('/setPass', singleUpload, setPass)
loginRouter.post('/admin-login', adminLogin)
loginRouter.post('/activeDiactiveUser', activeDiactiveUser)


module.exports = loginRouter;