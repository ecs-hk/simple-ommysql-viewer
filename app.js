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
    helmet = require('helmet');

var app = express();

var server = http.createServer(app);

// -------------------------------------------------------------------------
// Variable definitions sucked in from config files
// -------------------------------------------------------------------------
var listener = fs.readFileSync(path.join(__dirname, 'config',
        'http-listener.json')),
    listener = JSON.parse(listener),
    mysqlCreds = fs.readFileSync(path.join(__dirname, 'config',
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
app.get('/view-cfe-logs', routes.viewCfeLogs);
app.get('/view-highprio-logs', routes.viewHighPriorityLogs);

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
// Fire up the HTTP server
// -------------------------------------------------------------------------
server.listen(listener.port, listener.ip, function(){
  console.log('HTTP server listening on ' + listener.ip + ':' +
      listener.port);
});
