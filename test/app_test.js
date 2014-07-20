var sinon = require('sinon');
var expect = require('chai').expect;

describe("GET /example.org", function() {
  var app = require('../src/app')({}, {
    listDomains: sinon.stub().yields(null, {})
  });

  var request = require('supertest');

  it("returns 404", function(done) {
    request(app)
    .get('/example.org')
    .expect(404)
    .end(function (err, res) {
      if (err) throw err;
      done();
    })
  });
});

describe("middleware", function() {
  var middleware = require('../src/middleware')({}, {});
  var req = null;
  var fn = null;

  describe("read()", function() {
    beforeEach(function() { fn = middleware.read });
    describe("/example.org", function() {
      beforeEach(function(done) {
        send("example.org", function (_req) { req = _req; }, done)
      });
      it("sets ip address correctly", function() {
        expect(req.ip).to.eq('123');
      });
      it("sets zone_name to example.org", function() {
        expect(req.zone_name).to.eq('example.org');
      });
      it("sets rec_name to example.org", function() {
        expect(req.rec_name).to.eq('example.org');
      });
    });

    describe("sub.example.org", function() {
      beforeEach(function(done) {
        send("sub.example.org", function (_req) { req = _req; }, done)
      });
      it("sets zone_name to example.org", function() {
        expect(req.zone_name).to.eq('example.org');
      });
      it("sets rec_name to sub.example.org", function() {
        expect(req.rec_name).to.eq('sub.example.org');
      });
    });
  });

  // helper
  var send = function (name, cb, done) {
    var req = {
      connection: { remoteAddress: "123" },
      params: { name: name },
      query: {}
    };
    fn(req, null, function () {
      cb(req)
      done();
    })
  };
});
