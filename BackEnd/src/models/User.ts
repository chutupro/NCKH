export interface User {
  id: number
  name: string
  email: string
  role?: string
  status?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateUserDto {
  name: string
  email: string
  role?: string
}

export interface UpdateUserDto {
  name?: string
  email?: string
  role?: string
  status?: string
}
