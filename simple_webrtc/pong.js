var conn = new WebSocket("ws://wojsik.codes:8888");

var peerConnection;
var dataChannel;
var container = document.getElementsByClassName("container")[0];

conn.onopen = function () {
    console.log("Connected to the signaling server");
    container.style.backgroundColor = "green";
    initialize();
};

conn.onerror = function(error) {
    console.log("conn error: ", error);
    container.style.backgroundColor = "red";
};

conn.onmessage = function (msg) {
    console.log("Got message", msg.data);
    var content = JSON.parse(msg.data);
    var data = content.data;
    switch (content.event) {
        // when somebody wants to call us
        case "offer":
            handleOffer(data);
            break;
        case "answer":
            handleAnswer(data);
            break;
        // when a remote peer sends an ice candidate to us
        case "candidate":
            handleCandidate(data);
            break;
        default:
            break;
    }
};

function send(message) {
    conn.send(JSON.stringify(message));
}

function initialize() {
    var configuration = {
        "iceServers": [{
            "url": "stun:stun.szczygiel.dev",

        },
        {
            'urls': 'turn:turn.szczygiel.dev?transport=udp',
            'credential': 'ftj491q',
            'username': 'piotr'
        },
        {
            'urls': 'turn:turn.szczygiel.dev?transport=tcp',
            'credential': 'ftj491q',
            'username': 'piotr'
        }
        ]
    };

    peerConnection = new RTCPeerConnection(configuration);

    // Setup ice handling
    peerConnection.onicecandidate = function (event) {
        if (event.candidate) {
            send({
                event: "candidate",
                data: event.candidate
            });
        }
    };

    // creating data channel
    dataChannel = peerConnection.createDataChannel("dataChannel", {
        reliable: true
    });

    console.log(dataChannel);

    dataChannel.onerror = function (error) {
        console.log("Error occured on datachannel:", error);
    };

    // when we receive a message from the other peer, printing it on the console
    dataChannel.onmessage = function (event) {
        var received = JSON.parse(event.data);
        var response = {
            "id": received.id,
            "payload": received.payload
        }
        dataChannel.send(JSON.stringify(response));
    };

    dataChannel.onclose = function () {
        console.log("data channel is closed");
    };

    peerConnection.ondatachannel = function (event) {
        dataChannel = event.channel;
    };

}

function createOffer() {
    peerConnection.createOffer(function (offer) {
        send({
            event: "offer",
            data: offer
        });
        peerConnection.setLocalDescription(offer);
    }, function (error) {
        alert("Error creating an offer");
    });
}

function handleOffer(offer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    // create and send an answer to an offer
    peerConnection.createAnswer(function (answer) {
        peerConnection.setLocalDescription(answer);
        send({
            event: "answer",
            data: answer
        });
    }, function (error) {
        alert("Error creating an answer");
    });

};

function handleCandidate(candidate) {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
};

function handleAnswer(answer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    console.log("connection established successfully!!");
};
