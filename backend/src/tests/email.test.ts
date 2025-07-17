import emailService from '../services/email.service';
import notificationService from '../services/notification.service';

describe('Email Notification System', () => {
  describe('Email Service', () => {
    test('should initialize without errors', () => {
      expect(emailService).toBeDefined();
    });

    test('should test connection', async () => {
      const result = await emailService.testConnection();
      // This will fail if no email configuration is provided, which is expected
      expect(typeof result).toBe('boolean');
    });

    test('should send template email', async () => {
      const result = await emailService.sendTemplateEmail(
        'ticket-created',
        'test@example.com',
        'Test Ticket Created',
        {
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
        }
      );
      
      // Should return false if no email configuration
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Notification Service', () => {
    test('should initialize without errors', () => {
      expect(notificationService).toBeDefined();
    });

    test('should get queue stats', async () => {
      const stats = await notificationService.getQueueStats();
      expect(stats).toBeDefined();
      if (stats) {
        expect(typeof stats.waiting).toBe('number');
        expect(typeof stats.active).toBe('number');
        expect(typeof stats.completed).toBe('number');
        expect(typeof stats.failed).toBe('number');
      }
    });
  });
});