# Simple ommysql log viewer

Companion app for [ec2-cfengine37](https://github.com/ecs-hk/ec2-cfengine37#promise-logging-to-a-mysql-db-eg-aws-rds).

## Synopsis

Web app for viewing CFEngine logging and EC2 instance metadata. Built with Node.js, Express.js, EJS, Bootstrap / Bootswatch, and several Javascript libraries.

![Screenshot](/README.md-img/srv-info.png?raw=true)

![Screenshot](/README.md-img/cfe-logs.png?raw=true)

Tested with Node.js v4.4.* LTS.

* https://nodejs.org/
* http://getbootstrap.com/
* https://bootswatch.com/

## Use the app

### One-time preparation

* Download and install Node.js LTS
* Set up your environment, e.g.:
```
export NODE_PATH=/path/to/node-v4.x.y/lib/node_modules
export PATH=/path/to/node-v4.x.y/bin:$PATH
```
* Install dependences:
```
cd simple-ommysql-viewer
npm install
```
* Set up RDS connection info:
```
cd simple-ommysql-viewer/config
cp mysql-creds.json.EXAMPLE mysql-creds.json
vi mysql-creds.json
```

### Run it

* Set up your environment (if you haven't already), a la:
```
export NODE_PATH=/path/to/node-v4.x.y/lib/node_modules
export PATH=/path/to/node-v4.x.y/bin:$PATH
```
* Launch it using node
```
cd simple-ommysql-viewer
node app.js
```

## Integrate with Apache HTTP Server

Just make life easy and front-end your Node.js app with Apache HTTP Server. Then your app can make its RDS calls over EC2 VPC, and you can let Apache deal with TLS / x509 certs et al.

```
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so

ProxyRequests Off
 
ProxyPass /cfeinfo/ http://127.0.0.1:8080/
ProxyPassReverse /cfeinfo/ http://127.0.0.1:8080/
```
