const WebSocketServer = require("ws").Server;
const wss = new WebSocketServer({ port: 8888 });

let connections = [];

wss.on("listening", function () {
  console.log("Server started");
});

wss.on("connection", (connection) => {
  console.log("User connected", connection);
  connections.push(connection);

  connection.on("close", () => console.log("Disconnecting user", connection));

  connection.on("message", (message) => {
    console.log("Message from user", message);
    connections.forEach((conn) => {
      if (conn !== connection) conn.send(message);
    });
  });
});
