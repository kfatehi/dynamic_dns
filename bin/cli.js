#!/usr/bin/env node
var argv = require('yargs')
.usage('Create a dynamic dns endpoint\nUsage: $0')
.demand(['key', 'cert', 'cfemail', 'cftoken'])
.describe('secret', 'Secret for authorizing incoming HTTP POST')
.describe('port', 'Port to listen on')
.alias('k', 'key')
.alias('c', 'cert')
.alias('e', 'cfemail')
.alias('t', 'cftoken')
.argv;

var fs = require('fs');
var config = {
  port: argv.port || process.env.PORT || 3000,
  secret: argv.secret || Math.random().toString(36).substring(2),
  cloudflare: {
    email: argv.cfemail,
    token: argv.cftoken
  }
};

console.log("dynamic_dns starting up with config:\n", config);

config.ssl = {
  key: fs.readFileSync(argv.key),
  cert: fs.readFileSync(argv.cert)
}

var https = require('https');
var express = require('express');
var app = express();
var cloudflare = require('cloudflare');
var cf = cloudflare.createClient(config.cloudflare);
var app = require('../src/app.js')(config, cf);


https.createServer(config.ssl, app).listen(config.port, function(){
  console.log("HTTPS server listening on port "+config.port);
  console.log('Send HTTP GET requests to /example.com with required query string secret='+config.secret);
  console.log('Optionally include query string for subdomains like this: name=subdomain.example.com');
});
