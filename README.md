# dynamic_dns

provides an http endpoint to update configured cloudflare record

it won't hit cloudflare unless it thinks it needs to

## server setup

* install on a server with a static IP, e.g. digital ocean VPS
* generate ssl cert `openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=www.example.com" -keyout etc/ssl/server.key -out etc/ssl/server.crt`
* copy config example `cp etc/config.example.js etc/config.js`
* make sure to change your secret in `etc/config.js`
* start the daemon `node server.js`

## client setup

setup a loop to send GET requests to the endpoint containing your secret

### bash curl example

```
secret="mysecret"
while true; do
  curl -k https://example.org:3000/example.com/?secret=$secret
  sleep 30
done
```

### subdomains

pass an extra query string parameter: `name=subdomain.example.com`
