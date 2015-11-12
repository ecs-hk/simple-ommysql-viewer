# Simple ommysql (rsyslog-mysql module) viewer

## Synopsis

Web app for viewing the special MySQL table that ommysql inserts to. Uses Node.js, Express.js, EJS, Bootstrap, and several Javascript libraries.

Tested with Node.js v4.2.1 LTS.

* https://nodejs.org/
* http://getbootstrap.com/
* https://bootswatch.com/

## A word about security

First of all, the ommysql module inserts rows to the MySQL "Syslog" table over the wire clear text. This means your MySQL service account credentials, along with all logged messages, are sent clear text. Plan accordingly.

Secondly, the connection from simple-ommysql-viewer to your MySQL DB goes over the wire clear text.

- If you use AWS EC2, then perform the ommysql logging only over your VPC subnet.
- If you are using physical systems or a different service provide, prefer non-routed networks for logging.
