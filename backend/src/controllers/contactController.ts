import { Request, Response, NextFunction } from 'express';
import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from '../utils/logger';

function createTransporter() {
  if (!config.smtp.host || !config.smtp.user) return null;
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });
}

export async function submitContact(req: Request, res: Response, _next: NextFunction): Promise<void> {
  try {
    const { name, email, subject, message } = req.body;

    logger.info({ name, email, subject }, 'Contact form submission');

    const transporter = createTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: `"TrustLens Contact" <${config.smtp.user}>`,
        to: config.smtp.user,
        replyTo: email,
        subject: `[TrustLens] ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `<h2>Contact Form Submission</h2><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Subject:</strong> ${subject}</p><hr/><p>${message.replace(/\n/g, '<br/>')}</p>`,
      });
      logger.info({ email, subject }, 'Contact email sent');
    } else {
      logger.warn('SMTP not configured, contact message logged only');
    }

    res.json({
      success: true,
      message: 'Thank you for your message. We will get back to you within 24 hours.',
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to send contact email');
    res.json({
      success: true,
      message: 'Thank you for your message. We will get back to you within 24 hours.',
    });
  }
}
