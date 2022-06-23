let server = undefined;

function wsInitialize() {
  server = new WebSocket("ws://165.22.16.178/websocket");
  server.onerror = (error) => console.log("Server error", error);
  server.onopen = () => console.log("Connected to WebSocket server");
  server.onmessage = (message) => {
    wsHandleMessage(message.data);
  };
  wsReady();
}

function wsMessageSend(data) {
  server.send(data);
}
