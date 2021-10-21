const express = require("express");
const axios = require("../theirAPIServer/node_modules/axios");

const app = express();
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
  res.send(200);
});

function callWorker() {
  let currentNum = numsToCall[currentIndex++];
  console.log(currentNum);

  // let response = axios.post("http://localhost:4830/call", {
  //   phone: currentNum,
  //   webhookURL: "http://localhost:3001/update",
  // })

  //let id = response.data.id
  //callStatuses[id] = {
  //  number: currentNum,
  //  status: "idle",
  //}
  return new Promise((resolve) => {
    axios
      .post("http://localhost:4830/call", {
        phone: currentNum,
        webhookURL: "http://localhost:3001/update",
      })
      .then((response) => resolve(response.data));
  });
}

function initCalls() {
  for (let i = 0; i < MAX_SIMUL_CALLS; i++) {
    callWorker();
  }
}

app.post("/update", (req, res, next) => {
  console.log(req.body);
  const id = req.body.id;
  const status = req.body.status;

  callStatuses[id].status = status;

  if (status === "completed" && currentIndex <= numsToCall.length) {
    console.log("inside the if");
    callWorker();
  }

  res.status(200);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
