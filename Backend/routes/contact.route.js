var express = require('express')
const contactRouter = express.Router();

const { singleUpload, multiplepUload } = require('../middleware/multer');

const { Addcontact } = require("../controllers/contact.controller")
contactRouter.post('/Addcontact', singleUpload, Addcontact);

module.exports = contactRouter;