let rtcStatus = undefined;
let rtcAverage = undefined;
let rtcTimeout = undefined;
let rtcCount = 0;

let wsStatus = undefined;
let wsAverage = undefined;
let wsTimeout = undefined;
let wsCount = 0;

let chart = undefined;

function latencyColor(latency) {
  latency /= 1.5;
  latency = Math.min(latency, 100);
  latency = Math.max(latency, 0);
  latency = 100 - latency;

  let r, g, b = 0;
  if (latency < 50) {
    r = 255;
    g = Math.round(5.1 * latency);
  }
  else {
    g = 255;
    r = Math.round(510 - 5.10 * latency);
  }
  let h = r * 0x10000 + g * 0x100 + b * 0x1;
  return '#' + ('000000' + h.toString(16)).slice(-6);
}

function rtcReady() {
  rtcStatus.className = "dot active";
}

function rtcClose() {
  rtcStatus.className = "dot inactive";
}

function rtcError() {
  rtcStatus.className = "dot error";
}

function wsReady() {
  wsStatus.className = "dot active";
}

function wsError() {
  wsStatus.className = "dot error";
}

function rtcSetUp() {
  let reliability = document.getElementById("reliability").checked;

  if (reliability) {
    rtcInitialize({ ordered: true, maxRetransmits: null });
  } else {
    rtcInitialize({ ordered: false, maxRetransmits: 0 });
  }
}

function rtcSendPayload() {
  const timestamp = performance.now();
  const message = [timestamp, "A".repeat(64)];
  rtcMessageSend(JSON.stringify(message));
}

function rtcHandleMessage(message) {
  const end = performance.now();
  const [start, payload] = JSON.parse(message);
  const latency = end - start;

  chart.data.datasets[0].data.push({
    x: Date.now(),
    y: latency
  });

  chart.update("quiet");

  let sum = 0;
  for (let i = 0; i < chart.data.datasets[0].data.length; ++i) sum += chart.data.datasets[0].data[i].y;

  avg = sum / chart.data.datasets[0].data.length;
  rtcAverage.innerHTML = Math.round(avg * 10) / 10 + " ms";
  rtcAverage.style.backgroundColor = latencyColor(avg);

  rtcTimeout = setTimeout(rtcSendPayload, 500);
}

function wsSendPayload() {
  const timestamp = performance.now();
  const message = [timestamp, "A".repeat(64)];
  wsMessageSend(JSON.stringify(message));
}

function wsHandleMessage(message) {
  const end = performance.now();
  const [start, payload] = JSON.parse(message);
  const latency = end - start;

  chart.data.datasets[1].data.push({
    x: Date.now(),
    y: latency
  });

  chart.update("quiet");

  let sum = 0;
  for (let i = 0; i < chart.data.datasets[1].data.length; ++i) sum += chart.data.datasets[1].data[i].y;

  avg = sum / chart.data.datasets[1].data.length;
  wsAverage.innerHTML = Math.round(avg * 10) / 10 + " ms";
  wsAverage.style.backgroundColor = latencyColor(avg);

  wsTimeout = setTimeout(wsSendPayload, 500);
}

function initialize() {
  rtcStatus = document.getElementById("rtcStatus");
  rtcAverage = document.getElementById("rtcAverage");

  wsStatus = document.getElementById("wsStatus");
  wsAverage = document.getElementById("wsAverage");

  chart = new Chart(document.getElementById("chart"), {
    type: "line",
    data: {
      datasets: [
        {
          label: "WebRTC",
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgb(255, 99, 132)',
          // borderDash: [8, 4],
          cubicInterpolationMode: 'monotone',
          fill: true,
          data: []
        },
        {
          label: "WebSocket",
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgb(54, 162, 235)',
          cubicInterpolationMode: 'monotone',
          fill: true,
          data: []
        }
      ]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Comparison of WebRTC and WebSocket latency'
        },
      },
      scales: {
        x: {
          type: "realtime",
          realtime: {
            delay: 2000,
            duration: 10000,
          },
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

  wsInitialize();
}
