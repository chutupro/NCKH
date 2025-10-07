import express, { Application } from 'express'
import usersRouter from './routes/users.route'

const app: Application = express()
app.use(express.json())

app.use('/api/users', usersRouter)

app.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'))
