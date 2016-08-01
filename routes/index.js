// -------------------------------------------------------------------------
// Variable definitions
// -------------------------------------------------------------------------
var mysql = require('mysql'),
    moment = require('moment');

// -------------------------------------------------------------------------
// Helper functions
// -------------------------------------------------------------------------
function respondWithError(errMsg, res) {
  res.status(500);
  res.render('error.ejs', {title: 'HTTP 500: internal error',
      error: errMsg});
}

function queryMysqlAndRespond(sqlQuery, req, res, title) {
  var today = moment().format('YYYY-MM-DD HH:mm:ss'),
      past = moment().subtract(5, 'days').format('YYYY-MM-DD HH:mm:ss'),
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
              getFacility: getFacility});
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
      shorty = month[d.getMonth()] + ' ' + d.getDate() + ' ' +
         zeroPad(d.getHours()) + ':' + zeroPad(d.getMinutes());

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

exports.viewCfeLogs = function(req, res) {
  var title = 'CFEngine log details',
      // For Facility and Priority number mappings, see:
      // https://en.wikipedia.org/wiki/Syslog
      q = 'SELECT * FROM Syslog.SystemEvents ' +
          'WHERE DeviceReportedTime BETWEEN ? AND ? ' +
          'AND Facility = "19" ' +
          'ORDER BY DeviceReportedTime DESC ' +
          'LIMIT 300';

  queryMysqlAndRespond(q, req, res, title);
}

exports.viewHighPriorityLogs = function(req, res) {
  var title = 'High-severity log details',
      // For Facility and Priority number mappings, see:
      // https://en.wikipedia.org/wiki/Syslog
      q = 'SELECT * FROM Syslog.SystemEvents ' +
          'WHERE DeviceReportedTime BETWEEN ? AND ? ' +
          'AND Priority IN ("0","1","2") ' +
          'AND Facility != "19" ' +
          'ORDER BY DeviceReportedTime DESC ' +
          'LIMIT 300';

  queryMysqlAndRespond(q, req, res, title);
}
