# dynamic_dns

provides an http endpoint to update configured cloudflare record

## server setup

* install on a server with a static IP, e.g. digital ocean VPS
* generate an ssl cert `openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=www.example.com" -keyout server.key -out server.cert`
* copy and configure `cp etc/config.example.js etc/config.js && vi etc/config.js`
* start the daemon `node server.js`

## client setup

send POST requests to /update to the endpoint containing your secret

`curl -XPOST --no-check-certificate -H "Content-Type: application/json" -d '{"secret":"mysecret"}' https://example.org:3000/checkip`

