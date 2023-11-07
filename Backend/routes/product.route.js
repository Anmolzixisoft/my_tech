var express = require('express')
const productRouter = express.Router();

const { singleUpload, multiplepUload } = require('../middleware/multer');

const { productAdd, getProduct, deleteProduct, addDetailsproduct, editproduct, getProductbyid, delivered_status_change } = require("../controllers/product.controller")
productRouter.post('/productAdd', singleUpload, productAdd);
productRouter.get('/getProduct', getProduct)
productRouter.post('/deleteProduct', deleteProduct)
productRouter.post('/editproduct', singleUpload, editproduct);
productRouter.post('/getproductbyid', getProductbyid)
productRouter.post('/addDetailsproduct', addDetailsproduct)
productRouter.post('/status_change',delivered_status_change)

module.exports = productRouter;