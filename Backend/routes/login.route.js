var express = require('express')
const loginRouter = express.Router();
const passport = require('passport');

const { login, verifyByOtp, setPass, sentOtp } = require('../controllers/login.controller');
loginRouter.post('/login', login);
loginRouter.post('/verifybyotp', verifyByOtp)
loginRouter.post('/sentOtp', sentOtp)
loginRouter.post('/setPass', setPass)

module.exports = loginRouter;