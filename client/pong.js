function rtcReady() {
  console.log("WebRTC Ready");
}

function wsReady() {
  console.log("WebSocket ready");
}

function rtcHandleMessage(message) {
  const now = Date.now();
  rtcMessageSend(message);
  const [start, _] = JSON.parse(message);
  console.debug(`Echoed WebRTC message after ${now - start}ms`);
}

function wsHandleMessage(message) {
  const now = Date.now();
  wsMessageSend(message);
  const [start, _] = JSON.parse(message);
  console.debug(`Echoed WebSocket message after ${now - start}ms`);
}

rtcInitialize();
wsInitialize();
