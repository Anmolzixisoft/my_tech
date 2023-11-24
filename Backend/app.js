require('./database/mysqldb');
const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');

const app = express();
const route = require('./routes/api.routes');

const fs = require('fs');
const https = require('https');
app.use(express.json());
app.use(cors());
require('dotenv').config({
    path: path.join(__dirname, `.env.${process.env.NODE_ENV || 'development'}`)
});

require('dotenv').config({
    path: path.join(__dirname, `.env.${process.env.NODE_ENV || 'development'}`)
});
const options = {
    key: fs.readFileSync('./ssl/privatekey.key'), // Replace with your private key file path
    cert: fs.readFileSync('./ssl/certificate.crt'), // Replace with your certificate file path
};

app.use(route);
app.get('/', (req, res) => {
    return res.send({ message: "server is run" })
})


const server = https.createServer(options, app);

app.listen(process.env.PORT, () => {
    console.log("Server is up and listening on port : " + process.env.PORT);
});