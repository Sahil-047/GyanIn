const express = require('express');
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

const router = express.Router();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Validation rules
const contactValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('queryType').isIn(['general', 'course', 'other']).withMessage('Invalid query type'),
  body('subject').trim().isLength({ min: 5 }).withMessage('Subject must be at least 5 characters'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters')
];

// POST /api/contact - Submit contact form
router.post('/', contactValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, queryType, subject, message } = req.body;

    // Create new contact entry
    const contact = new Contact({
      name,
      email,
      queryType,
      subject,
      message
    });

    await contact.save();

    // Send email notifications (optional)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        // Email to admin
        await transporter.sendMail({
          from: `"GyanIN Contact Form" <${process.env.EMAIL_USER}>`,
          to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
          subject: `New Contact Form Submission: ${subject}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #0061FF 0%, #4F46E5 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
                .info-box { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #0061FF; }
                .label { font-weight: bold; color: #0061FF; }
                .message-box { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border: 1px solid #e5e7eb; }
                .footer { background: #f3f4f6; padding: 15px; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 8px 8px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2 style="margin: 0;">New Contact Form Submission</h2>
                </div>
                <div class="content">
                  <div class="info-box">
                    <p style="margin: 5px 0;"><span class="label">Name:</span> ${name}</p>
                    <p style="margin: 5px 0;"><span class="label">Email:</span> <a href="mailto:${email}" style="color: #0061FF;">${email}</a></p>
                    <p style="margin: 5px 0;"><span class="label">Query Type:</span> ${queryType.charAt(0).toUpperCase() + queryType.slice(1)}</p>
                    <p style="margin: 5px 0;"><span class="label">Subject:</span> ${subject}</p>
                  </div>
                  <div class="message-box">
                    <p style="margin: 0 0 10px 0;"><strong>Message:</strong></p>
                    <p style="margin: 0; white-space: pre-wrap;">${message}</p>
                  </div>
                </div>
                <div class="footer">
                  <p style="margin: 0;">Submitted on: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
                  <p style="margin: 5px 0 0 0;">This is an automated notification from GyanIN Contact Form</p>
                </div>
              </div>
            </body>
            </html>
          `
        });

        // Confirmation email to user
        await transporter.sendMail({
          from: `"GyanIN" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: `Thank you for contacting GyanIN - We've received your message`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #0061FF 0%, #4F46E5 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e5e7eb; }
                .message { background: #f0f9ff; padding: 20px; margin: 20px 0; border-radius: 6px; border-left: 4px solid #0061FF; }
                .details { background: #f9fafb; padding: 15px; margin: 15px 0; border-radius: 6px; }
                .footer { background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; padding: 12px 24px; background: #0061FF; color: white; text-decoration: none; border-radius: 6px; margin: 15px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">Thank You for Contacting Us!</h1>
                </div>
                <div class="content">
                  <p>Dear ${name},</p>
                  
                  <div class="message">
                    <p style="margin: 0;"><strong>We've successfully received your message!</strong></p>
                  </div>

                  <p>Thank you for reaching out to GyanIN. We have received your inquiry and our team will review it shortly.</p>

                  <div class="details">
                    <p style="margin: 5px 0;"><strong>Your Query Details:</strong></p>
                    <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
                    <p style="margin: 5px 0;"><strong>Query Type:</strong> ${queryType.charAt(0).toUpperCase() + queryType.slice(1)}</p>
                  </div>

                  <p>We typically respond within 24-48 hours. If your inquiry is urgent, please feel free to contact us directly.</p>

                  <p>Best regards,<br><strong>The GyanIN Team</strong></p>
                </div>
                <div class="footer">
                  <p style="margin: 0;">This is an automated confirmation email. Please do not reply to this message.</p>
                  <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} GyanIN. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `
        });
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        queryType: contact.queryType,
        subject: contact.subject,
        createdAt: contact.createdAt
      }
    });

  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/contact - Get all contact submissions (for admin)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, queryType } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (queryType) filter.queryType = queryType;

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Contact.countDocuments(filter);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// PUT /api/contact/:id - Update contact status (for admin)
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['new', 'in-progress', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: new, in-progress, or resolved'
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact status updated successfully',
      data: contact
    });

  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: 'Failed to update contact',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
