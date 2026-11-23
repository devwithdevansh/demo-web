require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const customerRoutes = require('./routes/customerRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const staffRoutes = require('./routes/staffRoutes');
const publicRoutes = require('./routes/publicRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const { protect } = require('./middleware/authMiddleware');

app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/services', protect, serviceRoutes);
app.use('/api/customers', protect, customerRoutes);
app.use('/api/appointments', protect, appointmentRoutes);
app.use('/api/staff', protect, staffRoutes);
app.use('/api/settings', protect, settingsRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/salon-dashboard";

mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Salon Dashboard API is running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
