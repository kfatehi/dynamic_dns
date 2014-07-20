module.exports = function (config, cf) {
  var app = require('express')();
  var middleware = require('./middleware')(config, cf);
  app.route('/:name')
  .get(middleware.auth)
  .get(middleware.read)
  .get(middleware.readCache)
  .get(middleware.listDomains)
  .get(middleware.writeCache)
  .get(middleware.createRecord)
  .get(middleware.editRecord)
  return app;
};

