import { WebSocketServer } from 'ws';
import net from 'net';

const wss = new WebSocketServer({ noServer: true });

const TARGET_HOST = 'psm.isdarprem.net'; 
const TARGET_PORT = 53; 

export default function handler(req, res) {
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
      // Terhubung ke backend VPS
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

    ws.on('close', () => {
      backend.destroy();
    });

    ws.on('error', () => {
      backend.destroy();
    });

    ws.on('error', () => {
      ws.close();
    });
  });

  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};
