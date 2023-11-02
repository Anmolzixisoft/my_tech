var express = require('express')
const purchaseRouter = express.Router();
const { purchaseQr, getMobileNo,getpurchaseinfo } = require('../controllers/qr_purchase.controller')

purchaseRouter.post('/purchaseQr', purchaseQr);
purchaseRouter.post('/getMobileno', getMobileNo)
purchaseRouter.get('/getpurchaseinfo',getpurchaseinfo)


module.exports = purchaseRouter;