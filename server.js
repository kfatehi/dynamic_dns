var https = require('https');

var config = require('./etc/config.js');

var express = require('express');

var app = express();

app.get('/:secret', function (req, res, next) {
  if (req.params.secret === config.secret) { 
    res.send(req.connection.remoteAddress);
  } else {
    res.send(401);
  }
});

if ( ! config.secret ) throw new Error("No secret configured");
if ( ! config.ssl.key ) throw new Error("No ssl key configured");
if ( ! config.ssl.cert ) throw new Error("No ssl cert configured");

var secureServer = https.createServer(config.ssl, app).listen(config.port, function(){
  console.log("HTTPS server listening on port "+config.port);
  console.log('Send HTTP GET requests to /'+config.secret);
});
