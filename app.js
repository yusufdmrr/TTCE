// app.js

const express = require('express')
const connectDB = require('./db/connect')
const compression = require('compression')
const helmet = require('helmet')
const cors = require('cors');
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const path = require('path')
const bodyParser = require('body-parser')

const app = express()

const envFile =
  process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
require('dotenv').config({ path: envFile })

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use('/public', express.static(path.join(__dirname, '/public')))

app.use(cors())

// app.use(compression())
// app.use(helmet())
// app.use(cookieParser())
app.use(mongoSanitize())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.disable('x-powered-by')

const handlerMiddleware = require('./middleware/error-handler')
const notFound = require('./middleware/not-found')
const { initRoutes } = require('./routes/index')

initRoutes(app)
app.use(notFound)
app.use(handlerMiddleware)

connectDB() // Bağlantıyı burada başlat

module.exports = app  // Sadece app export et
