var express = require('express')
const productRouter = express.Router();

const { singleUpload, multiplepUload } = require('../middleware/multer');

const { productAdd, getProduct, deleteProduct, editproduct, getProductbyid } = require("../controllers/product.controller")
productRouter.post('/productAdd', singleUpload, productAdd);
productRouter.get('/getProduct', getProduct)
productRouter.post('/deleteProduct', deleteProduct)
productRouter.post('/editproduct', singleUpload, editproduct);
productRouter.post('/getproductbyid', getProductbyid)

module.exports = productRouter;