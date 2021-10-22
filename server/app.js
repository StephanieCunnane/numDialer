const cors = require("cors");
const express = require("express");
const axios = require("axios");

const WebSocketServer = require("ws").Server;

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3001;
const MAX_SIMUL_CALLS = 3;

app.use(express.json());
const numsToCall = [
  "13018040009",
  "19842068287",
  "15512459377",
  "19362072765",
  "18582210308",
  "13018040009",
  "19842068287",
  "15512459377",
  "19362072765",
];

const callStatuses = {};
let currentIndex = 0;

// app.get("/", (req, res, next) => {
// res.send("hi from server/app.js")
// })

app.post("/kickoff", (req, res, next) => {
  initCalls();
  res.sendStatus(200).end();
});

function callWorker() {
  let currentNum = numsToCall[currentIndex++];
  return new Promise((resolve) => {
    axios
      .post("http://localhost:4830/call", {
        phone: currentNum,
        webhookURL: "http://localhost:3001/update",
      })
      .then((response) => {
        callStatuses[response.data.id] = {
          status: response.data.status,
          currentNum,
        };
        resolve(response.data);
      });
  });
}

let firstBatch = [];

async function initCalls() {
  for (let i = 0; i < MAX_SIMUL_CALLS; i++) {
    firstBatch.push(callWorker());
    if (i == 2) {
      let results = await Promise.all(firstBatch);
    }
  }
}

app.post("/update", (req, res, next) => {
  const id = req.body.id;

  const status = req.body.status;
  callStatuses[id].status = status;

  if (status === "completed" && currentIndex < numsToCall.length) {
    let promise = callWorker();
    Promise.resolve(promise);
  }

  let str = JSON.stringify(callStatuses);

  client.send(str);
  console.log(callStatuses);
  res.status(200).end();
});

const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

const wss = new WebSocketServer({ noServer: true });

let client;

wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(message) {
    console.log("received: %s", message);
  });
  client = ws;
});

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (socket) => {
    wss.emit("connection", socket, request);
  });
});
