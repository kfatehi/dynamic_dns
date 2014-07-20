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
var _ = require('lodash');

var cf = cloudflare.createClient(config.cloudflare);

var cache = {};

app.route('/:zone_name')
.get(function (req, res, next) {
  req.query.secret !== config.secret ? res.send(401) : next();
})
.get(function (req, res, next) {
  var ip = req.ip = req.connection.remoteAddress;
  var name = req.name = req.query.name || req.params.zone_name;
  if (cache[name] === ip) res.send(200, "no change "+req.name+" -> "+req.ip);
  else { cache[name] = ip; next() }
})
.get(function (req, res, next) {
  cf.listDomains(function (err, domains) {
    if (err) throw err;
    var zone = _.find(domains, { zone_name: req.params.zone_name });
    if (zone) {
      req.zone = zone;
      next();
    } else {
      res.send(404, "no zone "+req.params.zone_name);
    }
  });
})
.get(function (req, res, next) {
  cf.listDomainRecords(req.params.zone_name, function (err, records) {
    if (err) throw err;
    var record = _.find(records, { name: req.name });
    if (record) {
      req.record = record;
      // check if we need to change this record, and if so, update the record
      if (record.content === req.ip) {
        res.send(200, "no change "+req.name+" -> "+req.ip);
      } else {
        next();
      }
    } else {
      // create the record, it did not exist
      cf.addDomainRecord(req.zone.zone_name, {
        type: "A",
        content: req.ip,
        name: req.name
      }, function (err) {
        if (err) throw err;
        res.send(201, "created "+req.name+" -> "+req.ip);
      })
    }
  })
})
.get(function (req, res, next) {
  cf.editDomainRecord(req.record.zone_name, req.record.rec_id, {
    type: "A",
    content: req.ip,
    name: req.record.name,
    ttl: 1
  }, function (err, data) {
    if (err) throw err;
    res.send(200, "updated "+req.record.name+" -> "+req.ip)
  })
});

https.createServer(config.ssl, app).listen(config.port, function(){
  console.log("HTTPS server listening on port "+config.port);
  console.log('Send HTTP GET requests to /example.com with required query string secret='+config.secret);
  console.log('Optionally include query string for subdomains like this: name=subdomain.example.com');
});
