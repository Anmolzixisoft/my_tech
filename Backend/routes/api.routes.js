var express = require('express')
const apiRouter = express.Router();

const signUpRouter = require('./singUp.route')
const loginRouter = require('./login.route')
const productRouter = require('./product.route')

apiRouter.use('/api', signUpRouter);
apiRouter.use('/api', loginRouter);
apiRouter.use('/api', productRouter);

module.exports = apiRouter;