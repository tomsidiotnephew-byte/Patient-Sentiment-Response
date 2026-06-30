const complaints={

Cleanliness:1,

Service:37,

Safety:8,

Equipment:4,

Treatment:19,

Questions:6,

Management:4,

Communication:5

};

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

  const {

emotion,

category,

comment

} = req.body;

  const sentiment = analyzeSentiment(emotion);

  const data = {
    emotion,
    category,
    comment,
    sentiment,
    time: new Date()
  };

  feedbackData.push(data);

  if (complaints[category] !== undefined) {
    complaints[category]++;
}

  // Calculate stats
  const negativeCount = feedbackData.filter(f => f.sentiment === "negative").length;
  const total = feedbackData.length;
  const negativePercent = (negativeCount / total) * 100;

  // Alert condition
  let alert = null;
  let suggestion = null;

 if (complaints.Service >= 40) {

    alert = "High number of Service complaints";

    suggestion = "Open another registration counter.";

}
else if (complaints.Treatment >= 20) {

    alert = "Treatment complaints increasing";

    suggestion = "Assign additional nurses.";

}
else if (complaints.Cleanliness >= 5) {

    alert = "Cleanliness complaints detected";

    suggestion = "Notify housekeeping.";

}
else if (complaints.Safety >= 10) {

    alert = "Safety complaints increasing";

    suggestion = "Notify hospital security.";

}
else if (negativePercent > 50 && waitingTime > 15) {

    alert = "High patient frustration";

    suggestion = "Reduce waiting time.";

}

io.emit("update", {
    feedbackData,
    complaints,
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
    complaints,
    waitingTime,
    queueLength
});

}, 5000);

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});