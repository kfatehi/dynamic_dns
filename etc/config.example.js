var fs = require('fs');

module.exports = {
  port: 3000,
  secret: 'whatever',
  ssl: {
    key: fs.readFileSync(__dirname+'/ssl/server.key'),
    cert: fs.readFileSync(__dirname+'/ssl/server.crt')
  },
  cloudflare: {
    email: "you@example.com",
    token: "your-cloudflare-token"
  }
}
