var http = require('http');
var app = require('../../app');

function normalizePort(val) {
    var port = parseInt(val, 10);
  
    if (isNaN(port)) {
      // named pipe
      return val;
    }
  
    if (port >= 0) {
      // port number
      return port;
    }
  
    return false;
  }

var port = normalizePort(process.env.PORT || '3001');
app.set('port', port);

/**
 * Create HTTP server.
 */
var server = http.createServer(app);


server.listen(app.get('port'), function() {
  console.log("Express Server Runing on port "+ app.get('port'));
});

