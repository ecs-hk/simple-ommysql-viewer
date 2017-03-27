// -------------------------------------------------------------------------
// Variable definitions
// -------------------------------------------------------------------------
var mysql = require('mysql'),
    moment = require('moment'),
    numDays = 7,
    maxRows = 300;

// -------------------------------------------------------------------------
// Helper functions
// -------------------------------------------------------------------------
function validUserInput(suspect) {
  var re = /^([a-zA-Z0-9]|[.%-]|\s)+$/;

  if(re.test(suspect)) {
    return true;
  }
  return false;
}

function buildQueryFilter(col, val) {
  if(val && validUserInput(val)) {
    return 'AND ' + col + ' LIKE "' + val + '" ';
  }
  return '';
}

function respondWithError(errMsg, res) {
  res.status(500);
  res.render('error.ejs', {title: 'HTTP 500: internal error',
      error: errMsg});
}

function queryMysqlAndRespond(sqlQuery, req, res, title) {
  var today = moment().format('YYYY-MM-DD HH:mm:ss'),
      past = moment().subtract(numDays, 'days').format('YYYY-MM-DD HH:mm:ss'),
      c = mysql.createConnection(req.app.locals.mysqlCreds);

  c.connect(function(err) {
    if(err) {
      console.log(err);
      respondWithError('MySQL connection error', res);
      return;
    } else {
      c.query(sqlQuery, [past, today], function(err, rows, fields) {
        c.end();
        if(err) {
          console.log(err);
          respondWithError('MySQL query error', res);
          return;
        } else {
          res.render('viewServerLogs.ejs', {title: title, logEntries: rows,
              formatDate: shortDateTime, getPriority: getPriority,
              getFacility: getFacility, numDays: numDays});
        }
      });
    }
  });
}

function shortDateTime(d) {
  if(d === undefined) {
    d = new Date();
  }
  var month = [ 'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep',
          'Oct','Nov','Dec' ],
      shorty = month[d.getUTCMonth()] + ' ' + d.getUTCDate() + ' ' +
         zeroPad(d.getUTCHours()) + ':' + zeroPad(d.getUTCMinutes());

  return shorty;
}

function zeroPad(n) {
  return ("0" + n).slice(-2);
}

function getFacility(n) {
  var facility = [ 'kern','user','mail','daemon','auth','syslog','lpr',
          'news','uucp','','authpriv','ftp','','','','cron','local0',
          'local1','local2','local3','local4','local5','local6','local7' ],
      keyword;

  if(n >= 0 && n < facility.length) {
    keyword = facility[n];
  } else {
    keyword = 'n/a'
  }
  return keyword;
}

function getPriority(n) {
  var priority = [ 'emerg','alert','crit','err','warning','notice',
          'info','debug' ],
      keyword;

  if(n >= 0 && n < priority.length) {
    keyword = priority[n];
  } else {
    keyword = 'n/a'
  }
  return keyword;
}

// -------------------------------------------------------------------------
// Exported functions
// -------------------------------------------------------------------------
exports.index = function(req, res) {
  var title = 'Simple ommysql viewer';
  res.render('index.ejs', {title: title});
};

exports.viewServerInfo = function(req, res) {
  var title = 'Server info',
      db = req.app.locals.mysqlCreds.database,
      past = moment().subtract(numDays, 'days').format('YYYY-MM-DD HH:mm:ss'),
      c = mysql.createConnection(req.app.locals.mysqlCreds),
      q = 'SELECT * FROM ServerInfo ' +
          'WHERE LastUpdated > ? ' +
          'ORDER BY Hostname';

  c.connect(function(err) {
    if(err) {
      console.log(err);
      respondWithError('MySQL connection error', res);
      return;
    } else {
      c.query(q, [past], function(err, rows, fields) {
        c.end();
        if(err) {
          console.log(err);
          respondWithError('MySQL query error', res);
          return;
        } else {
          res.render('viewServerInfo.ejs', {title: title, servers: rows,
              formatDate: shortDateTime});
        }
      });
    }
  });
}

exports.viewCfeLogs = function(req, res) {
  var title = 'CFEngine log details',
      host = req.query.hostInput,
      msg = req.query.msgInput,
      db = req.app.locals.mysqlCreds.database,
      // For Facility and Priority number mappings, see:
      // https://en.wikipedia.org/wiki/Syslog
      q = 'SELECT * FROM ' + db + '.SystemEvents ' +
          'WHERE ReceivedAt BETWEEN ? AND ? ' +
          'AND Facility = "19" ' +
          buildQueryFilter('FromHost', host) +
          buildQueryFilter('Message', msg) +
          'ORDER BY ReceivedAt DESC ' +
          'LIMIT ' + maxRows;

  queryMysqlAndRespond(q, req, res, title);
}

exports.viewHighPriorityLogs = function(req, res) {
  var title = 'High-severity log details',
      host = req.query.hostInput,
      msg = req.query.msgInput,
      db = req.app.locals.mysqlCreds.database,
      // For Facility and Priority number mappings, see:
      // https://en.wikipedia.org/wiki/Syslog
      q = 'SELECT * FROM ' + db + '.SystemEvents ' +
          'WHERE ReceivedAt BETWEEN ? AND ? ' +
          'AND Priority IN ("0","1","2") ' +
          buildQueryFilter('FromHost', host) +
          buildQueryFilter('Message', msg) +
          'ORDER BY ReceivedAt DESC ' +
          'LIMIT ' + maxRows;

  queryMysqlAndRespond(q, req, res, title);
}
