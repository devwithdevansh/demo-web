const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const Customer = require('../models/Customer');
const Appointment = require('../models/Appointment');
const sendEmail = require('../utils/sendEmail');

// Public route to get all active services
router.get('/services', async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ category: 1, name: 1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public route to request an appointment
router.post('/book', async (req, res) => {
  const { name, phone, email, serviceId, date, time, notes } = req.body;
  
  try {
    // Find or create customer by phone number
    let customer = await Customer.findOne({ phone });
    if (!customer) {
      customer = await Customer.create({ 
        name, 
        phone, 
        email, 
        notes: 'Client registered via public booking portal' 
      });
    } else {
      // Update name/email if it was missing
      if (!customer.email && email) customer.email = email;
      customer.name = name; // Update to latest name
      await customer.save();
    }

    // Parse date and time
    const appointmentDate = new Date(`${date}T${time}`);

    // Create the appointment (Defaults to 'Pending' status)
    const appointment = await Appointment.create({
      customer: customer._id,
      service: serviceId,
      date: appointmentDate,
      notes: notes ? `Public Note: ${notes}` : 'Booked via public portal'
    });

    // Send confirmation email to customer (if email exists)
    if (customer.email) {
      await sendEmail({
        email: customer.email,
        subject: 'Appointment Request Received - GlowUp Salon',
        message: `Hello ${customer.name}, we have received your appointment request for ${appointmentDate.toLocaleString()}.`,
        htmlMessage: `
          <p>Hello <strong>${customer.name}</strong>,</p>
          <p>We have successfully received your appointment request for <strong>${appointmentDate.toLocaleDateString()}</strong> at <strong>${appointmentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</strong>.</p>
          <p>Our team will review the schedule and confirm your appointment shortly!</p>
        `
      });
    }

    res.status(201).json({ 
      message: 'Appointment requested successfully', 
      appointmentId: appointment._id 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
