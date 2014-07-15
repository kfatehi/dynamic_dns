var https = require('https');
var express = require('express');
var app = express();
var cloudflare = require('cloudflare');
var _ = require('lodash');

var config = require('./etc/config.js');
if ( ! config.secret ) throw new Error("No secret configured");
if ( ! config.ssl.key ) throw new Error("No ssl key configured");
if ( ! config.ssl.cert ) throw new Error("No ssl cert configured");

var cf = cloudflare.createClient(config.cloudflare);

var cache = {};

app.route('/:zone_name')
.get(function (req, res, next) {
  req.query.secret !== config.secret ? res.send(401) : next();
})
.get(function (req, res, next) {
  var addr = req.connection.remoteAddress;
  if (cache[req.params.zone_name] === addr) res.send(200, "No change");
  else { cache[req.params.zone_name] = addr; next() }
})
.get(function (req, res, next) {
  cf.listDomains(function (err, domains) {
    if (err) throw err;
    var zone = _.find(domains, { zone_name: req.params.zone_name });
    if (zone) {
      req.zone = zone;
      next();
    } else {
      res.send(404, "No such zone "+req.params.zone_name);
    }
  });
})
.get(function (req, res, next) {
  var name = req.query.name || req.params.zone_name;
  cf.listDomainRecords(req.params.zone_name, function (err, records) {
    if (err) throw err;
    var record = _.find(records, { name: name });
    if (record) {
      req.record = record;
      // check if we need to change this record, and if so, update the record
      if (record.content === req.connection.remoteAddress) {
        console.log("no change required");
      } else {
        console.log("updating record "+name+" to point to "+req.connection.remoteAddress);
      }
      res.send(record);
    } else {
      // create the record, it did not exist
      res.send(200, 'record '+name+'did not exist');
    }
  })
})
//.get(function (req, res, next) {
//  cf.editDomainRecord(zone_name, zone.zone_id, {
//
//  }, function (err, res) {
//    if (err) throw err;
//    res.send(res);
//  })
//});

https.createServer(config.ssl, app).listen(config.port, function(){
  console.log("HTTPS server listening on port "+config.port);
  console.log('Send HTTP GET requests to /'+config.secret);
});
