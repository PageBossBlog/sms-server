import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import senderRoute from "./routes/sender.route.js";

const app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({ origin: ["http://localhost:3000", "https://sms-sender-music-life.onrender.com", "https://sms-sender-music-life.onrender.com/support", "https://sms-sender-ml.web.app", "https://sms-sender-ml.web.app/support", "https://sms-sender-twilio.web.app", "https://sms-sender-twilio.web.app/support", "https://sms-sender-smtp.web.app", "https://sms-sender-smtp.web.app/support", "https://light-sender.web.app", "https://light-sender.web.app/support"], credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Use your existing routes
app.use("/sms-sender", senderRoute);

// Error handling middleware
app.use((error, req, res, next) => {
  const errorStatus = error.status || 500;
  const errorMessage = error.message || "Something went wrong!";
  return res.status(errorStatus).send(errorMessage);
});

// Default route
app.use("/", (req, res) => {
  res.send("Welcome to Node SMS Sender!");
});

const port = process.env.PORT || 8800;
app.listen(port, () => {
  console.log(`SMS Sender is running on port ${port}`);
});
