import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/errors.types';
import config from '../config';

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', {
    message: err.message,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode,
      },
      ...(config.nodeEnv === 'development' && { stack: err.stack }),
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: {
      message: config.nodeEnv === 'development' 
        ? err.message 
        : 'Une erreur interne est survenue',
      statusCode: 500,
    },
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} non trouvée`,
      statusCode: 404,
    },
  });
}
