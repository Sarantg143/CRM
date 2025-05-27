
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

const appointmentRoutes = require("./routes/Appointment.router");
const authRoutes = require("./routes/Auth.router");
const bookingRoutes = require("./routes/Booking.router");
const brokerRoutes = require("./routes/Broker.router");
const calenderRoutes = require("./routes/Calender.router");
const complaintRoutes = require("./routes/Complaint.router");
const feedbackRoutes = require("./routes/Feedback.router");
const inquiryRoutes = require("./routes/Inquiry.router");
const leadRoutes = require("./routes/Lead.router");
const notificationRoutes = require("./routes/Notification.router");
const propertyRoutes = require("./routes/Property.router");
const propertyGetRoutes = require("./routes/PropertyGet.router");
const reviewRoutes = require("./routes/Review.router");
const savedPropertRoutes = require("./routes/SavedProperty.router");
const transactionRoutes = require("./routes/Transaction.router");
const userRoutes = require("./routes/User.router");

// Middleware
app.use(express.json());

// Routes
app.use("/api/appointments",appointmentRoutes);
app.use("/api/auth",authRoutes);
app.use("/api/booking",bookingRoutes);
app.use("/api/broker", brokerRoutes);
app.use("/api/calender",calenderRoutes);
app.use("/api/complaints",complaintRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/propertiesGet", propertyGetRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/saved-property",savedPropertRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/users", userRoutes);



app.get("/", (req, res) => {
  res.send("Welcome to CRM API");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
