const ICE_CONFIG = {
  iceServers: [
    {
      url: "stun:stun.l.google.com:19302",
    },
  ],
};

const RtcEvent = {
  OFFER: 1,
  ANSWER: 2,
  CANDIDATE: 3,
};

let rtcPeer = undefined;
let rtcChannel = undefined;
let rtcServer = undefined;

function rtcInitialize(config) {
  console.log(config);
  rtcPeer = new RTCPeerConnection(ICE_CONFIG);
  rtcChannel = rtcPeer.createDataChannel("channel", config);
  rtcServer = new WebSocket("wss://tactile.tk/webrtc");
  rtcServer.onerror = (error) => console.log("Server error", error);

  rtcServer.onmessage = (message) => {
    console.debug("Got message", message.data);
    const [event, data] = JSON.parse(message.data);
    switch (event) {
      case RtcEvent.OFFER:
        rtcHandleOffer(data);
        break;
      case RtcEvent.ANSWER:
        rtcHandleAnswer(data);
        break;
      case RtcEvent.CANDIDATE:
        rtcHandleCandidate(data);
        break;
      default:
        console.error("Unknown event", event);
        break;
    }
  };

  rtcServer.onopen = () => {
    console.log("Connected to the signaling server");

    rtcPeer.onicecandidate = (event) => {
      if (event.candidate) {
        rtcServer.send(JSON.stringify([RtcEvent.CANDIDATE, event.candidate]));
      }
    };

    rtcChannel.onerror = (error) => { console.log("Error on data channel", error); rtcError(); }
    rtcChannel.onclose = () => { console.log("Data channel is closed"); rtcClose(); }
    rtcChannel.onmessage = (event) => rtcHandleMessage(event.data);
    rtcPeer.ondatachannel = (event) => (rtcChannel = event.channel);
  };
}

function rtcHandleOffer(offer) {
  rtcPeer.setRemoteDescription(new RTCSessionDescription(offer));

  rtcPeer.createAnswer(
    (answer) => {
      rtcPeer.setLocalDescription(answer);
      rtcServer.send(JSON.stringify([RtcEvent.ANSWER, answer]));
    },
    (error) => console.error("Error creating an answer", error)
  );
}

function rtcHandleCandidate(candidate) {
  rtcPeer.addIceCandidate(new RTCIceCandidate(candidate));
}

function rtcHandleAnswer(answer) {
  rtcPeer.setRemoteDescription(new RTCSessionDescription(answer));
  console.log("Connection established successfully!!");
  rtcReady();
}

function rtcCreateOffer() {
  rtcPeer.createOffer(
    (offer) => {
      rtcServer.send(JSON.stringify([RtcEvent.OFFER, offer]));
      rtcPeer.setLocalDescription(offer);
    },
    (error) => console.error("Error creating an offer", error)
  );
}

function rtcMessageSend(data) {
  rtcChannel.send(data);
}
