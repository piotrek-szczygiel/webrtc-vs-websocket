const ICE_CONFIG = {
  iceServers: [
    {
      url: "stun:stun.szczygiel.dev",
    },
    {
      urls: "turn:turn.szczygiel.dev?transport=udp",
      credential: "ftj491q",
      username: "piotr",
    },
    {
      urls: "turn:turn.szczygiel.dev?transport=tcp",
      credential: "ftj491q",
      username: "piotr",
    },
  ],
};

const Event = Object.freeze({
  CANDIDATE: 1,
  OFFER: 2,
  ANSWER: 3,
});

const rtc = new RTCPeerConnection(ICE_CONFIG);
const server = new WebSocket("ws://szczygiel.dev:8888");

server.onerror = (error) =>
  console.error("Error connecting to signaling server", error);

server.onopen = () => {
  rtc.onicecandidate = (event) => {
    if (event.candidate) {
      server.send(JSON.stringify([Event.CANDIDATE, event.candidate]));
    }
  };

  channel = rtc.createDataChannel("perf_channel", { reliable: true });
  channel.onerror = (error) => console.error("Error on data channel", error);
  channel.onclose = () => console.debug("Data channel closed");
  channel.ondatachannel = (event) => (channel = event.channel);
  channel.onmessage = (event) => {
    handleMessage(event.data, channel);
  };
};

server.onmessage = (message) => {
  console.debug("Received message", message);
  const [event, data] = JSON.parse(message.data);
  if (event === Event.CANDIDATE) {
    rtc.addIceCandidate(new RTCIceCandidate(data));
  } else if (event === Event.ANSWER) {
    rtc.setRemoteDescription(new RTCSessionDescription(data));
    console.debug("RTC Connection established successfully");
  } else if (event === Event.OFFER) {
    rtc.setRemoteDescription(new RTCSessionDescription(data));
    rtc.createAnswer(
      (answer) => {
        rtc.setLocalDescription(answer);
        server.send(JSON.stringify([Event.ANSWER, answer]));
      },
      (error) => console.error("Error creating an answer", error)
    );
  }
};

function createOffer() {
  rtc.createOffer(
    (offer) => {
      server.send(JSON.stringify([Event.OFFER, offer]));
      rtc.setLocalDescription(offer);
    },
    (error) => console.error("Error creating an offer", error)
  );
}

function sendMessage() {
  const timestamp = Date.now();
  const message = [timestamp, "A".repeat(1024)];
  dataChannel.send(JSON.stringify(message));
}
