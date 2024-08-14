const http = require('http');
const app = require('../app');

let server;

function startServer() {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => { // Use port 0 to let the OS assign a random available port
      const { port } = server.address();
      console.log(`Test server running on port ${port}`);
      resolve(port);
    });
  });
}

function stopServer() {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => {
        console.log('Test server closed');
        resolve();
      });
    } else {
      resolve();
    }
  });
}

module.exports = { startServer, stopServer };