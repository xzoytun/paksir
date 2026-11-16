const { WebSocketServer } = require('ws');
const net = require('net');

const wss = new WebSocketServer({ noServer: true });

const TARGET_HOST = 'psm.isdarprem.net'; 
const TARGET_PORT = 443; 

module.exports = function handler(req, res) {
  if (!res.socket.server.ws) {
    console.log('Initializing WebSocket server wrapper...');
    
    res.socket.server.on('upgrade', (request, socket, head) => {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    });

    res.socket.server.ws = true;
  }

  wss.on('connection', (ws, req) => {
    const backend = net.createConnection({ host: TARGET_HOST, port: TARGET_PORT }, () => {
      // Connected
    });

    ws.on('message', (msg) => {
      if (backend.writable) {
        backend.write(msg);
      }
    });

    backend.on('data', (data) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(data);
      }
    });

    backend.on('close', () => {
      ws.close();
    });

    backend.on('close', () => {
      backend.destroy();
    });

    backend.on('error', () => {
      backend.destroy();
    });

    backend.on('error', () => {
      ws.close();
    });
  });

  res.end();
};

module.exports.config = {
  api: {
    bodyParser: false,
  },
};
