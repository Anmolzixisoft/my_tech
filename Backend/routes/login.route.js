var express = require('express')
const loginRouter = express.Router();
const passport = require('passport');
const { singleUpload } = require('../middleware/multer')
const { login, verifyByOtp, setPass, sentOtp, addsuperadmin, adminLogin, getsuperadmin,activeDiactiveUser } = require('../controllers/login.controller');
loginRouter.post('/login', singleUpload, login);
loginRouter.post('/verifybyotp', singleUpload, verifyByOtp)
loginRouter.post('/sentOtp', singleUpload, sentOtp)
loginRouter.post('/setPass', singleUpload, setPass)
loginRouter.post('/admin-login', adminLogin)
loginRouter.post('/add-super-admin', addsuperadmin)
loginRouter.get('/get-super-admin',getsuperadmin)
loginRouter.post('/activeDiactiveUser', activeDiactiveUser)


module.exports = loginRouter;



