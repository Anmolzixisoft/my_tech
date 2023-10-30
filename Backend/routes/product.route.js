var express = require('express')
const productRouter = express.Router();

const { singleUpload, multiplepUload } = require('../middleware/multer');

const { productAdd,getProduct } = require("../controllers/product.controller")
productRouter.post('/productAdd',singleUpload, productAdd);
productRouter.get('/getProduct',getProduct)

module.exports = productRouter;