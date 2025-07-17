import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import logger from '../config/logger';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailTemplateData {
  [key: string]: any;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private useSendGrid = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (process.env.SENDGRID_API_KEY) {
      // Use SendGrid
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.useSendGrid = true;
      logger.info('Email service initialized with SendGrid');
    } else if (process.env.EMAIL_HOST) {
      // Use SMTP
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      logger.info('Email service initialized with SMTP');
    } else {
      logger.warn('No email configuration found. Email notifications will be disabled.');
    }
  }

  public async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (this.useSendGrid) {
        return await this.sendWithSendGrid(options);
      } else if (this.transporter) {
        return await this.sendWithSMTP(options);
      } else {
        logger.warn('Email service not configured. Skipping email send.');
        return false;
      }
    } catch (error) {
      logger.error('Error sending email:', error);
      return false;
    }
  }

  private async sendWithSendGrid(options: EmailOptions): Promise<boolean> {
    try {
      const msg = {
        to: options.to,
        from: process.env.FROM_EMAIL || 'noreply@opendesk.com',
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      await sgMail.send(msg);
      logger.info(`Email sent successfully to ${options.to} via SendGrid`);
      return true;
    } catch (error) {
      logger.error('Error sending email via SendGrid:', error);
      return false;
    }
  }

  private async sendWithSMTP(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@opendesk.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      await this.transporter!.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${options.to} via SMTP`);
      return true;
    } catch (error) {
      logger.error('Error sending email via SMTP:', error);
      return false;
    }
  }

  public async sendTemplateEmail(
    templateName: string,
    to: string,
    subject: string,
    data: EmailTemplateData
  ): Promise<boolean> {
    try {
      const templatePath = path.join(__dirname, '..', 'templates', 'email', `${templateName}.hbs`);
      
      if (!fs.existsSync(templatePath)) {
        logger.error(`Email template not found: ${templatePath}`);
        return false;
      }

      const templateSource = fs.readFileSync(templatePath, 'utf-8');
      const template = handlebars.compile(templateSource);
      const html = template(data);

      return await this.sendEmail({
        to,
        subject,
        html,
        text: this.htmlToText(html),
      });
    } catch (error) {
      logger.error('Error sending template email:', error);
      return false;
    }
  }

  private htmlToText(html: string): string {
    // Simple HTML to text conversion - in production, consider using a library like html-to-text
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  }

  public async testConnection(): Promise<boolean> {
    try {
      if (this.useSendGrid) {
        // SendGrid doesn't have a test connection, so we'll just verify the API key exists
        return !!process.env.SENDGRID_API_KEY;
      } else if (this.transporter) {
        await this.transporter.verify();
        logger.info('Email service connection test passed');
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Email service connection test failed:', error);
      return false;
    }
  }
}

export default new EmailService();