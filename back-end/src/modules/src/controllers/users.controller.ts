import { Request, Response } from 'express'
import { getAllUsers } from '../services/users.service'

export const getUsers = (req: Request, res: Response): void => {
  const users = getAllUsers()
  res.status(200).json(users)
}
