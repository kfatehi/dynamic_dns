var https = require('https'),
fs = require('fs');

var config = require('./etc/config.js');

var express = require('express');

var app = express();

var secureServer = https.createServer(sslOptions,app).listen(config.port, function(){
  console.log("Secure Express server listening on port "+config.port);
});
