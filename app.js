// -------------------------------------------------------------------------
// Variable definitions
// -------------------------------------------------------------------------
var express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    helmet = require('helmet'),
    request = require('request'),
    assert = require('assert'),
    hostnameURI = 'http://169.254.169.254/latest/meta-data/public-hostname',
    tcpPort = 8080;

var app = express();

var server = http.createServer(app);

// -------------------------------------------------------------------------
// MySQL hostname and credentials sucked in from config file
// -------------------------------------------------------------------------
var mysqlCreds = fs.readFileSync(path.join(__dirname, 'config',
        'mysql-creds.json')),
    mysqlCreds = JSON.parse(mysqlCreds);

// -------------------------------------------------------------------------
// Express setup
// -------------------------------------------------------------------------
app.use(helmet());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.locals.mysqlCreds = mysqlCreds;

app.use(morgan('combined'));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// -------------------------------------------------------------------------
// Express routes
// -------------------------------------------------------------------------
app.get('/', routes.index);
app.get('/server-info', routes.viewServerInfo);
app.get('/cfe-logs', routes.viewCfeLogs);
app.get('/highprio-logs', routes.viewHighPriorityLogs);

// -------------------------------------------------------------------------
// Express error handling
// -------------------------------------------------------------------------
// Handle HTTP 404 if we didn't match any of the routes above
app.use(function(req, res) {
  res.status(404);
  res.render('error.ejs', {title: 'HTTP 404: not found'});
});

// Handle HTTP 500 if we hit an application error
app.use(function(err, req, res, next) {
  res.status(500);
  res.render('error.ejs', {title: 'HTTP 500: internal error',
      error: err});
});

// -------------------------------------------------------------------------
// Get the public hostname and fire up the HTTP server
// -------------------------------------------------------------------------
request.get(hostnameURI, function(err, res, body) {
  assert.equal(null, err);
  assert.equal(res.statusCode, 200);

  var publicHostname = body;

  server.listen(tcpPort, function(){
    console.log('HTTP server listening on all interfaces');
    console.log('public name: http://' + publicHostname + ':' + tcpPort);
  });
});
