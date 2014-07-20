var _ = require('lodash');

module.exports = function (config, cf) {
  var cache = {};
  return {
    auth: function (req, res, next) {
      req.query.secret !== config.secret ? res.send(401) : next();
    },
    read: function (req, res, next) {
      req.ip = req.connection.remoteAddress;
      var name = req.params.name;
      var parts = name.split('.');
      var len = parts.length;
      if (len > 2) {
        req.zone_name = parts[len-2]+'.'+parts[len-1];
        req.rec_name = name;
      } else {
        req.zone_name = req.rec_name = name;
      }
      next();
    },
    readCache: function (req, res, next) {
      if (cache[req.rec_name] === req.ip)
        res.send(200, "no change "+req.rec_name+" -> "+req.ip);
      else
        next();
    },
    listDomains: function (req, res, next) {
      cf.listDomains(function (err, domains) {
        if (err) throw err;
        var zone = _.find(domains, { zone_name: req.zone_name });
        if (zone) {
          req.zone = zone;
          cf.listDomainRecords(req.zone.zone_name, function (err, records) {
            if (err) throw err;
            var record = _.find(records, { name: req.rec_name });
            if (record) {
              req.record = record;
              // check if we need to change this record, and if so, update the record
              if (record.content === req.ip) {
                res.send(200, "no change "+req.rec_name+" -> "+req.ip);
              } else {
                req.newRecord = false;
                next()
              }
            } else {
              req.newRecord = true;
              next();
            }
          })
        } else {
          res.send(404, "no zone "+req.zone_name);
        }
      });
    },
    writeCache: function (req, res, next) {
      cache[req.rec_name] = req.ip;
      next();
    },
    createRecord: function (req, res, next) {
      if (req.newRecord) {
        cf.addDomainRecord(req.zone.zone_name, {
          type: "A",
          content: req.ip,
          name: req.rec_name
        }, function (err) {
          if (err) throw err;
          res.send(201, "created "+req.rec_name+" -> "+req.ip);
        })
      } else
        next();
    },
    editRecord: function (req, res, next) {
      cf.editDomainRecord(req.record.zone_name, req.record.rec_id, {
        type: "A",
        content: req.ip,
        name: req.record.name,
        ttl: 1
      }, function (err, data) {
        if (err) throw err;
        res.send(200, "updated "+req.record.name+" -> "+req.ip)
      })
    }
  }
}
