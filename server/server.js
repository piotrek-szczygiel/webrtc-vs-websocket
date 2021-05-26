const http = require("http");
const WebSocket = require("ws");

const server = http.createServer();
const wss1 = new WebSocket.Server({ noServer: true });
const wss2 = new WebSocket.Server({ noServer: true });

wss1.on("connection", (ws, req) => {
  const addr = `${req.socket.remoteAddress}:${req.socket.remotePort}`;
  console.log(`Client ${addr} connected`);
  ws.on("close", () => console.log(`Client ${addr} disconnected`));
  ws.on("message", (message) => {
    console.debug(`Received ${message.length} bytes from ${addr}`);
    wss1.clients.forEach((client) => {
      if (client !== ws) client.send(message);
    });
  });
});

server.on("upgrade", function upgrade(request, socket, head) {
  if (request.url === "/webrtc") {
    wss1.handleUpgrade(request, socket, head, (ws) =>
      wss1.emit("connection", ws, request)
    );
  } else if (request.url === "/websocket") {
    wss2.handleUpgrade(request, socket, head, (ws) =>
      wss2.emit("connection", ws, request)
    );
  } else {
    socket.destroy();
  }
});

server.listen(8888);
