const express = require('express'); //Import the express dependency
require("dotenv").config();
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const routes = require('./routes/index');
require("./config/database").connect();
const app = express();              //Instantiate an express app, the main work horse of this server
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());
app.use(express.json());

app.use('/',routes);
app.get('/', (req, res) => {
	res.json({ message: 'Welcome to OTP SIGNUP lOGIN SYSTEM.' });
});

const port = 5000;                  //Save the port number where your server will be listening
app.listen(port, () => {            //server starts listening for any attempts from a client to connect at port: {port}
    console.log(`Now listening on port ${port}`); 
});