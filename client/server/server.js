const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// =====================================
// Load Environment Variables
// =====================================

dotenv.config();


// =====================================
// Database
// =====================================

const connectDB = require("./config/db");


// =====================================
// Routes
// =====================================

const authRoutes =
  require("./routes/authRoutes");

const reportRoutes =
  require("./routes/reportRoutes");


// =====================================
// Express App
// =====================================

const app = express();


// =====================================
// Middleware
// =====================================

app.use(cors());

app.use(express.json());


// =====================================
// Serve Uploaded Images
// =====================================

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);


// =====================================
// Test Route
// =====================================

app.get("/", (req, res) => {
  res.send(
    "🎉 Lost & Found Backend Running"
  );
});


// =====================================
// API Routes
// =====================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/reports",
  reportRoutes
);


// =====================================
// Server Start
// =====================================

const PORT =
  process.env.PORT || 5000;


const startServer = async () => {
  try {

    // Connect MongoDB first
    await connectDB();

    // Start Express
    app.listen(
      PORT,
      () => {
        console.log(
          `🚀 Server running on http://localhost:${PORT}`
        );
      }
    );

  } catch (error) {

    console.error(
      "❌ Failed to start server"
    );

    console.error(
      error.message
    );

    process.exit(1);
  }
};


startServer();