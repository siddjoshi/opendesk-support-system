import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

interface ErrorWithStatus extends Error {
  status?: number;
  code?: string;
}

const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.status || 500;
  const message = err.message || 'Something went wrong';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  // Log the error
  logger.error(`${status} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`, {
    stack: err.stack,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Send error response
  res.status(status).json({
    success: false,
    error: {
      code,
      message,
    },
  });
};

export default errorHandler;
