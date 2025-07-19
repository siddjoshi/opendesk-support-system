// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  AGENT: 'agent',
  CUSTOMER: 'customer'
} as const;

// SLA targets (in hours) based on priority
export const SLA_TARGETS = {
  urgent: 4,
  high: 8,
  medium: 24,
  low: 72
} as const;

// Ticket statuses
export const TICKET_STATUSES = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress', 
  RESOLVED: 'resolved',
  CLOSED: 'closed'
} as const;

// Ticket priorities
export const TICKET_PRIORITIES = {
  URGENT: 'urgent',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type TicketStatus = typeof TICKET_STATUSES[keyof typeof TICKET_STATUSES];
export type TicketPriority = typeof TICKET_PRIORITIES[keyof typeof TICKET_PRIORITIES];
export type SLATarget = typeof SLA_TARGETS[keyof typeof SLA_TARGETS];