const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const sendEmail = require('../utils/sendEmail');

// Get all appointments (with customer and service populated)
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('customer', 'name phone email')
      .populate('service', 'name price duration')
      .sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create an appointment
router.post('/', async (req, res) => {
  const appointment = new Appointment(req.body);
  try {
    const newAppointment = await appointment.save();
    // Fetch with populated fields to return full details
    const populatedAppointment = await Appointment.findById(newAppointment._id)
      .populate('customer', 'name phone email')
      .populate('service', 'name price duration');
      
    res.status(201).json(populatedAppointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update an appointment (e.g. status)
router.put('/:id', async (req, res) => {
  try {
    const originalAppointment = await Appointment.findById(req.params.id).populate('customer').populate('service');
    if (!originalAppointment) return res.status(404).json({ message: 'Appointment not found' });

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    ).populate('customer').populate('service');
    
    // Check if status was changed to Confirmed or Cancelled
    if (originalAppointment.status !== req.body.status && req.body.status && updatedAppointment.customer.email) {
      const dateStr = new Date(updatedAppointment.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
      const serviceName = updatedAppointment.service ? updatedAppointment.service.name : 'your service';
      
      let subject = '';
      let htmlMessage = '';

      if (req.body.status === 'Confirmed') {
        subject = 'Appointment Confirmed - GlowUp Salon';
        htmlMessage = `<p>Hello <strong>${updatedAppointment.customer.name}</strong>,</p>
                       <p>Great news! Your appointment for <strong>${serviceName}</strong> has been <strong>confirmed</strong>.</p>
                       <p><strong>When:</strong> ${dateStr}</p>
                       <p>We look forward to seeing you!</p>`;
      } else if (req.body.status === 'Cancelled') {
        subject = 'Appointment Cancelled - GlowUp Salon';
        htmlMessage = `<p>Hello <strong>${updatedAppointment.customer.name}</strong>,</p>
                       <p>Your appointment for <strong>${serviceName}</strong> on <strong>${dateStr}</strong> has been cancelled.</p>
                       <p>If you have any questions or wish to reschedule, please contact us.</p>`;
      }

      if (subject) {
        await sendEmail({
          email: updatedAppointment.customer.email,
          subject,
          message: `Your appointment status is now: ${req.body.status}`,
          htmlMessage
        });
      }
    }
    
    res.json(updatedAppointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an appointment
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get today's stats (for dashboard)
router.get('/stats/dashboard', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's appointments
    const todaysAppointments = await Appointment.find({
      date: { $gte: today, $lt: tomorrow }
    }).populate('service', 'price');
    
    const todaysCount = todaysAppointments.length;
    
    // Revenue (completed or confirmed)
    let todayRevenue = 0;
    todaysAppointments.forEach(app => {
      if (app.status !== 'Cancelled' && app.service && app.service.price) {
        todayRevenue += app.service.price;
      }
    });
    
    // Total services rendered
    const totalServicesRendered = await Appointment.countDocuments({ status: 'Completed' });
    
    // New customers this month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const Customer = require('../models/Customer');
    const newCustomersCount = await Customer.countDocuments({ createdAt: { $gte: startOfMonth } });

    res.json({
      todaysAppointments: todaysCount,
      revenueToday: todayRevenue,
      servicesRendered: totalServicesRendered,
      newCustomers: newCustomersCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get revenue data for the chart (last 7 days)
router.get('/stats/revenue-chart', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 6); // 7 days including today

    const appointments = await Appointment.find({
      date: { $gte: lastWeek },
      status: { $in: ['Completed', 'Confirmed'] }
    }).populate('service', 'price');

    // Initialize array of last 7 days
    const chartData = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(lastWeek);
      d.setDate(d.getDate() + i);
      chartData.push({
        dateStr: d.toISOString().split('T')[0],
        name: dayNames[d.getDay()],
        revenue: 0
      });
    }

    // Populate revenue
    appointments.forEach(app => {
      if (app.service && app.service.price) {
        const apptDateStr = new Date(app.date).toISOString().split('T')[0];
        const dayIndex = chartData.findIndex(d => d.dateStr === apptDateStr);
        if (dayIndex !== -1) {
          chartData[dayIndex].revenue += app.service.price;
        }
      }
    });

    res.json(chartData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
