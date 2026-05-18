const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));
app.use(express.json());

let feedbackData = [];
let waitingTime = 20; // simulated
let queueLength = 10;

// Simple sentiment logic
function analyzeSentiment(emotion) {
  if (emotion === "happy") return "positive";
  if (emotion === "neutral") return "neutral";
  return "negative";
}

app.post("/feedback", (req, res) => {
  const { emotion, comment } = req.body;

  const sentiment = analyzeSentiment(emotion);

  const data = {
    emotion,
    comment,
    sentiment,
    time: new Date(),
  };

  feedbackData.push(data);

  // Calculate stats
  const negativeCount = feedbackData.filter(f => f.sentiment === "negative").length;
  const total = feedbackData.length;
  const negativePercent = (negativeCount / total) * 100;

  // Alert condition
  let alert = null;
  let suggestion = null;

  if (negativePercent > 50 && waitingTime > 15) {
    alert = "High frustration detected!";
    suggestion = "Open more counters or reduce queue load.";
  }

  io.emit("update", {
    feedbackData,
    waitingTime,
    queueLength,
    negativePercent,
    alert,
    suggestion,
  });

  res.sendStatus(200);
});

// Simulate changing queue
setInterval(() => {
  waitingTime = Math.floor(Math.random() * 30);
  queueLength = Math.floor(Math.random() * 20);

  io.emit("update", {
    feedbackData,
    waitingTime,
    queueLength,
  });
}, 5000);

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});