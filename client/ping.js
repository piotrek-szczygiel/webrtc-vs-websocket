let rtcChart = undefined;
let wsChart = undefined;

let rtcStatus = undefined;
let wsStatus = undefined;

let rtcCount = 0;
let wsCount = 0;

let rtcTimeout = undefined;
let wsTimeout = undefined;

function rtcReady() {
  rtcStatus.innerHTML = "WebRTC connected";
  rtcStatus.style.backgroundColor = "green";
}

function wsReady() {
  wsStatus.innerHTML = "WebSocket connected";
  wsStatus.style.backgroundColor = "green";
}

function rtcSendPayload() {
  const timestamp = Date.now();
  const message = [timestamp, "A".repeat(64)];
  rtcMessageSend(JSON.stringify(message));
}

function rtcHandleMessage(message) {
  const end = Date.now();
  const [start, payload] = JSON.parse(message);
  const latency = end - start;

  rtcChart.data.datasets[0].data.push(latency);
  rtcChart.data.labels.push(++rtcCount);
  rtcChart.update();

  rtcTimeout = setTimeout(rtcSendPayload, 500);
}

function wsSendPayload() {
  const timestamp = Date.now();
  const message = [timestamp, "A".repeat(64)];
  wsMessageSend(JSON.stringify(message));
}

function wsHandleMessage(message) {
  const end = Date.now();
  const [start, payload] = JSON.parse(message);
  const latency = end - start;

  wsChart.data.datasets[0].data.push(latency);
  wsChart.data.labels.push(++wsCount);
  wsChart.update();

  wsTimeout = setTimeout(wsSendPayload, 500);
}

function initialize() {
  rtcStatus = document.getElementById("rtcStatus");
  wsStatus = document.getElementById("wsStatus");
  rtcChart = new Chart(document.getElementById("rtcChart").getContext("2d"), {
    type: "line",
    options: {
      scales: {
        x: {
          ticks: {
            display: false,
          },
          grid: {
            display: false,
          },
        },
      },
    },
    data: {
      labels: [],
      datasets: [
        {
          label: "WebRTC Latency",
          data: [],
          fill: true,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    },
  });
  wsChart = new Chart(document.getElementById("wsChart").getContext("2d"), {
    type: "line",
    options: {
      scales: {
        x: {
          ticks: {
            display: false,
          },
          grid: {
            display: false,
          },
        },
      },
    },
    data: {
      labels: [],
      datasets: [
        {
          label: "WebSocket Latency",
          data: [],
          fill: true,
          borderColor: "rgb(192, 192, 75)",
          tension: 0.1,
        },
      ],
    },
  });

  rtcInitialize();
  wsInitialize();
}
