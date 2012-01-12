# node-portmutex: Process Mutual Exclusion using localhost TCP ports for Locking

## Introduction

I needed to prevent two copies of a node program from running concurrently
on a host.  There appears to be no support for `fcntl(2) F_SETLK` file
locking in node at the moment, so I fell back on this module.

Please note that there are obvious denial-of-service issues with this
module:  if you pick a non-privileged port for locking then any process
can open that port (even one that isn't yours) and prevent your process
from starting up.  With that said, it's a simple solution that should
work on systems with only trusted users.

## Usage

```javascript
var LOCKING_PORT = 43002;

var PortMutex = require('./portmutex').PortMutex;

var mtx = new PortMutex(LOCKING_PORT, 1000);
mtx.on('retrying', function() {
  console.log(' * retrying lock...');
  /* you could potentially give up and exit the process here */
});
mtx.on('gotlock', function() {
  console.log(' * got lock!');
  /* start the rest of your program here */
});
```
