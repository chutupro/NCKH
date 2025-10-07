import { Request, Response, NextFunction } from 'express'
import { HTTP_STATUS } from '../constants/httpStatus'

export const validateEmail = (req: Request, res: Response, next: NextFunction): void => {
  const { email } = req.body
  
  if (!email) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      status: 'error',
      message: 'Email is required'
    })
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      status: 'error',
      message: 'Invalid email format'
    })
    return
  }

  next()
}

export const validateName = (req: Request, res: Response, next: NextFunction): void => {
  const { name } = req.body
  
  if (!name) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      status: 'error',
      message: 'Name is required'
    })
    return
  }

  if (name.length < 2) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      status: 'error',
      message: 'Name must be at least 2 characters long'
    })
    return
  }

  next()
}
