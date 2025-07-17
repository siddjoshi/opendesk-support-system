# Email Notification System Testing Guide

## Overview
This guide describes how to test the email notification system implementation in the OpenDesk support system.

## Prerequisites
Before testing, ensure you have:
1. A working email service configuration (SendGrid or SMTP)
2. Redis server running (for queue processing)
3. Database initialized with test users

## Configuration

### SendGrid Configuration
Add to your `.env` file:
```
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=noreply@yourdomain.com
BASE_URL=http://localhost:3000
```

### SMTP Configuration
Add to your `.env` file:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FROM_EMAIL=noreply@yourdomain.com
BASE_URL=http://localhost:3000
```

### Redis Configuration
Add to your `.env` file:
```
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

## Test Scenarios

### 1. Test Email Service Connection
```bash
# Test the email service connection
cd backend
npm run build
node -e "
const emailService = require('./dist/services/email.service').default;
emailService.testConnection().then(result => {
  console.log('Email service test:', result);
  process.exit(0);
}).catch(err => {
  console.error('Email service test failed:', err);
  process.exit(1);
});
"
```

### 2. Test Notification Queue
```bash
# Test Redis connection and queue stats
node -e "
const notificationService = require('./dist/services/notification.service').default;
notificationService.getQueueStats().then(stats => {
  console.log('Queue stats:', stats);
  process.exit(0);
}).catch(err => {
  console.error('Queue test failed:', err);
  process.exit(1);
});
"
```

### 3. Test Email Templates
```bash
# Test email template rendering
node -e "
const emailService = require('./dist/services/email.service').default;
const templateData = {
  ticket: {
    id: 1,
    ticketNumber: 'TICK-20240101-1234',
    title: 'Test Ticket',
    description: 'Test description',
    status: 'open',
    priority: 'medium',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  creator: {
    name: 'Test User',
    email: 'test@example.com',
  },
  baseUrl: 'http://localhost:3000',
};
emailService.sendTemplateEmail('ticket-created', 'test@example.com', 'Test Ticket Created', templateData).then(result => {
  console.log('Template email test:', result);
  process.exit(0);
}).catch(err => {
  console.error('Template email test failed:', err);
  process.exit(1);
});
"
```

### 4. Test User Notification Preferences
1. Start the application
2. Navigate to http://localhost:3000/settings/notifications
3. Test toggling notification preferences
4. Verify preferences are saved correctly

### 5. Test Ticket Notification Triggers
1. Create a new ticket and verify ticket creation notification
2. Update ticket status and verify status change notification
3. Assign ticket to agent and verify assignment notification
4. Add comment to ticket and verify comment notification
5. Resolve ticket and verify resolution notification
6. Close ticket and verify closure notification

## Test Data Setup

### Create Test Users
```sql
INSERT INTO users (name, email, password, role, "isActive", "emailNotifications", "createdAt", "updatedAt")
VALUES 
  ('Test Customer', 'customer@test.com', '$2b$10$hashedpassword', 'customer', true, 
   '{"ticketCreated": true, "ticketUpdated": true, "ticketAssigned": true, "ticketCommented": true, "ticketResolved": true, "ticketClosed": true}',
   NOW(), NOW()),
  ('Test Agent', 'agent@test.com', '$2b$10$hashedpassword', 'agent', true,
   '{"ticketCreated": true, "ticketUpdated": true, "ticketAssigned": true, "ticketCommented": true, "ticketResolved": true, "ticketClosed": true}',
   NOW(), NOW()),
  ('Test Admin', 'admin@test.com', '$2b$10$hashedpassword', 'admin', true,
   '{"ticketCreated": true, "ticketUpdated": true, "ticketAssigned": true, "ticketCommented": true, "ticketResolved": true, "ticketClosed": true}',
   NOW(), NOW());
```

## API Testing

### Test User Preferences API
```bash
# Get user preferences
curl -X GET http://localhost:4000/api/users/notifications \
  -H "Authorization: Bearer <your_jwt_token>"

# Update user preferences
curl -X PUT http://localhost:4000/api/users/notifications \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "emailNotifications": {
      "ticketCreated": true,
      "ticketUpdated": false,
      "ticketAssigned": true,
      "ticketCommented": true,
      "ticketResolved": true,
      "ticketClosed": false
    }
  }'
```

### Test Ticket Operations with Notifications
```bash
# Create ticket (triggers notification)
curl -X POST http://localhost:4000/api/tickets \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Ticket",
    "description": "Test description",
    "priority": "medium"
  }'

# Update ticket status (triggers notification)
curl -X PUT http://localhost:4000/api/tickets/1 \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }'

# Assign ticket (triggers notification)
curl -X PUT http://localhost:4000/api/tickets/1 \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "assignedToId": 2
  }'

# Add comment (triggers notification)
curl -X POST http://localhost:4000/api/tickets/1/comments \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "comment": "This is a test comment"
  }'
```

## Expected Results

### Email Content
Each notification email should contain:
- Professional HTML formatting
- Ticket information (number, title, status, priority)
- User information (creator, assigned agent)
- Clear call-to-action buttons
- Consistent branding (OpenDesk logo and colors)

### Notification Types
- **Ticket Created**: Sent to all agents/admins when a new ticket is created
- **Ticket Updated**: Sent to creator and assigned agent when status changes
- **Ticket Assigned**: Sent to creator and assigned agent when assignment changes
- **Ticket Commented**: Sent to creator and assigned agent when comment is added
- **Ticket Resolved**: Sent to creator when ticket is resolved
- **Ticket Closed**: Sent to creator when ticket is closed

### User Preferences
- Users should be able to enable/disable each notification type
- Preferences should be saved and respected when sending notifications
- UI should be intuitive and responsive

## Troubleshooting

### Common Issues
1. **Email not sending**: Check email service configuration and credentials
2. **Queue not processing**: Ensure Redis is running and accessible
3. **Templates not found**: Verify template files exist in `src/templates/email/`
4. **User preferences not working**: Check database schema and API endpoints

### Debugging
1. Check application logs for error messages
2. Monitor Redis queue for job processing
3. Verify email service provider dashboard for delivery status
4. Use browser developer tools to inspect API calls

## Performance Considerations

### Queue Management
- Monitor queue size and processing time
- Implement queue failure handling
- Consider scaling Redis for high volume

### Email Delivery
- Respect email service rate limits
- Implement exponential backoff for failures
- Monitor bounce rates and spam complaints

## Security Considerations

### Email Security
- Use environment variables for sensitive credentials
- Implement proper authentication for email service
- Validate email addresses before sending

### Data Protection
- Don't include sensitive information in emails
- Use secure connections (TLS) for email transmission
- Implement proper user consent for notifications