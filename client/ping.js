let rtcChart = undefined;
let rtcStatus = undefined;
let rtcAverage = undefined;
let rtcTimeout = undefined;
let rtcCount = 0;

let wsChart = undefined;
let wsStatus = undefined;
let wsAverage = undefined;
let wsTimeout = undefined;
let wsCount = 0;

function rtcReady() {
  rtcStatus.innerHTML = "WebRTC connected";
  rtcStatus.style.backgroundColor = "green";
  rtcAverage.style.backgroundColor = "pink";
}

function wsReady() {
  wsStatus.innerHTML = "WebSocket connected";
  wsStatus.style.backgroundColor = "green";
  wsAverage.style.backgroundColor = "pink";
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

  rtcChart.data.datasets[0].data.push({
    x: Date.now(),
    y: latency
  });

  rtcChart.update("quiet");

  let sum = 0;
  for (let i = 0; i < rtcChart.data.datasets[0].data.length; ++i) sum += rtcChart.data.datasets[0].data[i].y;

  avg = sum / rtcChart.data.datasets[0].data.length;
  rtcAverage.innerHTML = Math.round(avg * 10) / 10;

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

  wsChart.data.datasets[0].data.push({
    x: Date.now(),
    y: latency
  });

  wsChart.update("quiet");

  let sum = 0;
  for (let i = 0; i < wsChart.data.datasets[0].data.length; ++i) sum += wsChart.data.datasets[0].data[i].y;

  avg = sum / wsChart.data.datasets[0].data.length;
  wsAverage.innerHTML = Math.round(avg * 10) / 10;

  wsTimeout = setTimeout(wsSendPayload, 500);
}

function initialize() {
  rtcStatus = document.getElementById("rtcStatus");
  rtcAverage = document.getElementById("rtcAverage");

  wsStatus = document.getElementById("wsStatus");
  wsAverage = document.getElementById("wsAverage");

  Chart.defaults.set('plugins.streaming', {
    duration: 20000
  });

  rtcChart = new Chart(document.getElementById("rtcChart"), {
    type: "line",
    data: {
      datasets: [
        {
          label: "WebRTC latency",
          data: [],
          fill: true,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        }
      ]
    },
    options: {
      scales: {
        x: {
          type: "realtime",
          ticks: {
            display: false
          },
          grid: {
            display: false
          }
        }
      }
    }
  });

  wsChart = new Chart(document.getElementById("wsChart"), {
    type: "line",
    data: {
      datasets: [
        {
          label: "WebSocket latency",
          data: [],
          fill: true,
          borderColor: "rgb(192, 192, 75)",
          tension: 0.1,
        }
      ]
    },
    options: {
      scales: {
        x: {
          type: "realtime",
          ticks: {
            display: false
          },
          grid: {
            display: false
          }
        }
      }
    }
  });

  rtcInitialize();
  wsInitialize();
}
