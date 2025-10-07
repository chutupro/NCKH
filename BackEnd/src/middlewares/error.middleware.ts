import { Request, Response, NextFunction } from 'express'
import { HTTP_STATUS } from '../constants/httpStatus'
import { MESSAGES } from '../constants/message'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR
  const message = err.message || MESSAGES.ERROR.INTERNAL_SERVER_ERROR

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  })
}
