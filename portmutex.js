var net = require('net');
var events = require('events');
var util = require('util');

function PortMutex(portnumber, delay) {
  events.EventEmitter.call(this);
  var self = this;

  if (!portnumber)
    throw new Error('must provide port number');
  if (!delay)
    delay = 5000;

  var s = net.createServer();
  function tryLock() {
    s.listen(portnumber, 'localhost');
  }
  s.on('error', function(err) {
    if (err.code === 'EADDRINUSE') {
      setTimeout(tryLock, delay);
      self.emit('retrying');
    } else {
      self.emit('error', err);
    }
  });
  s.on('listening', function() {
    self.emit('gotlock');
  });
  s.on('connection', function(con) {
    /* 
     * discard all incoming connections, as we're just
     * holding this port open as a mutex.  spit out our
     * process id to ease troubleshooting.  NB: don't depend
     * on this pid for anything, as obviously it could be forged.
     */
    con.on('error', function() {});
    con.write(JSON.stringify({ pid: process.pid }) + '\n', 'utf8');
    con.end();
  });

  tryLock();
}
util.inherits(PortMutex, events.EventEmitter);

exports.PortMutex = PortMutex;
