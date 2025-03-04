
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");  
const bodyParser = require("body-parser");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS 
app.use(cors()); 
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
 

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

//Imports
const userRoutes = require("./routes/User.router");
const propertRoutes = require("./routes/Property.router");
const uploadRoutes = require("./routes/Upload.router");
const leadRoutes = require("./routes/Lead.router");
const inquiryRoutes = require("./routes/Inquiry.router");
const transactionRoutes = require("./routes/Transaction.router");


// Middleware
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/properties", propertRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/transactions", transactionRoutes);


app.get("/", (req, res) => {
  res.send("Welcome to CRM API");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
