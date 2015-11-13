# Simple ommysql log viewer

## Synopsis

Web app for viewing the special MySQL table that ommysql (rsyslog-mysql module) inserts to. Built with Node.js, Express.js, EJS, Bootstrap, and several Javascript libraries.

Designed to be used as a companion app to [ec2-cfengine37](https://github.com/ecs-hk/ec2-cfengine37#promise-logging-to-a-mysql-db-eg-aws-rds).

![Screenshot](/README.md-img/cfe-logs.png?raw=true)

Tested with Node.js v4.2.1 LTS.

* https://nodejs.org/
* http://getbootstrap.com/
* https://bootswatch.com/

## A word about security

### MySQL connections

First of all, the ommysql module sends your MySQL service account credentials, along with all logged messages, clear text across the wire.

Secondly, the `simple-ommysql-viewer` app sends your MySQL service account credentials, along with all retrieved messages, clear text across the wire.

Plan accordingly:

* If you use AWS EC2, make your MySQL connections over your VPC subnet.
* If you are using another hosting provider, make your MySQL connections over non-routed or RFC 1918 private networks.
* Configure EC2 Security Groups and/or packet filtering to open the MySQL service port only to hosts that really need access.
* Utilize separate accounts for privilege separation. Use an account for just ommysql, and nothing else. Use a separate account for `simple-ommysql-viewer`, and nothing else.

### HTTP/S connections

The `simple-ommysql-viewer` provides an HTTP listener, as written. If you have access to a CA-signed x509 cert, then it would be better to access the app over TLS (HTTPS).

#### Example using Node.js

```
var sslOptions = {
    key: fs.readFileSync('/usr/local/etc/ssl/server.key'),
    cert: fs.readFileSync('/usr/local/etc/ssl/server.pem'),
    ca: fs.readFileSync('/usr/local/etc/ssl/ca.pem'),
    secureProtocol: 'TLSv1_method'
};

var server = https.createServer(sslOptions, app);
```

There are a number of authentication possibilities, including HTTP Basic, via the [npm](https://www.npmjs.com/) repositories.

#### Example front-ending with Apache HTTP Server

Alternatively, you can also front-end the `simple-ommysql-viewer` app using another TLS-enabled HTTP server, like Apache HTTP Server:

```
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so

ProxyRequests Off
 
ProxyPass /logs/ http://127.0.0.1:8080/
ProxyPassReverse /logs/ http://127.0.0.1:8080/
```

## Using the app

### One-time preparation

* Install Node.js
* Set up your environment, e.g.:
```
export NODE_PATH=/path/to/node-v4.2.1-linux-x64/lib/node_modules
export PATH=/path/to/node-v4.2.1-linux-x64/bin:$PATH
```
* Install dependences, e.g.:
```
cd simple-ommysql-viewer
npm install
```

### Run it

* Set up your environment, e.g.:
```
export NODE_PATH=/path/to/node-v4.2.1-linux-x64/lib/node_modules
export PATH=/path/to/node-v4.2.1-linux-x64/bin:$PATH
```
* Launch it using node
```
cd simple-ommysql-viewer
node app.js
```
