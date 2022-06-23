let server = undefined;

function wsInitialize() {
  server = new WebSocket("wss://tactile.tk/websocket");
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
