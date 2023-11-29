var express = require('express')
const purchaseRouter = express.Router();
const { purchaseQr, getMobileNo,getOrder,getpurchaseinfo,getpurchaseinfoPatycular } = require('../controllers/qr_purchase.controller')
const {singleUpload}= require('../middleware/multer')
purchaseRouter.post('/purchaseQr',singleUpload, purchaseQr);
purchaseRouter.post('/getMobileno', getMobileNo)
purchaseRouter.get('/getpurchaseinfo',getpurchaseinfo)
purchaseRouter.get('/getoder',getOrder)
purchaseRouter.post('/getpurchaseinfoPatycular', getpurchaseinfoPatycular)

module.exports = purchaseRouter;