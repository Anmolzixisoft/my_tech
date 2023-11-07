var express = require('express')
const apiRouter = express.Router();

const signUpRouter = require('./singUp.route')
const loginRouter = require('./login.route')
const productRouter = require('./product.route')
const vehicleRouter = require('./vehicle.route')
const purchaseRouter = require('./qr_purchase.route')

apiRouter.use('/api', signUpRouter);
apiRouter.use('/api', loginRouter);
apiRouter.use('/api', productRouter);
apiRouter.use('/api', vehicleRouter);
apiRouter.use('/api', purchaseRouter);

module.exports = apiRouter;