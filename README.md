# dynamic_dns

provides an http endpoint to update configured cloudflare record

it won't hit cloudflare unless it thinks it needs to

**note** i now use a much simpler approach: https://gist.github.com/larrybolt/6295160

## server setup

* install on a server with a static IP, e.g. (a digital ocean VPS) via npm `npm install -g dynamic_dns`
* generate ssl cert `openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=www.example.com" -keyout etc/ssl/server.key -out etc/ssl/server.crt`
* copy config example `cp etc/config.example.js etc/config.js`
* make sure to change your secret in `etc/config.js`
* start the daemon `dynamic_dns -k /path/to/key -c /path/to/cert -e you@example.org -t your_cloudflare_token`

## client setup

install a client like so

```
cat <<EOF | sudo tee /usr/local/bin/dynamic_dns_client
#!/bin/sh
while true; do
  curl https://example.org:3000/example.org/\?secret\=your_secret 2>/dev/null
  curl https://example.org:3000/www.example.org/\?secret\=your_secret 2>/dev/null
  echo
  sleep 120
done
EOF
```

## caveats

due to the way the server is caching requests (to avoid abusing cloudflare) if you edit or delete a record on cloudflare, it `dynamic_dns` may never know and will stop working. a patch is required that will actually `dig` the name too in addition to checking the cache. until then, don't edit manually.
