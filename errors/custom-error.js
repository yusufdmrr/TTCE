const { z } = require('zod')
const { errorMessages } = require('./error-messages')
const { adminErrorMessages } = require('../controllers/Admin/error')

class CustomAPIError extends Error {
  constructor(message, statusCode, customErrorCode, detail) {
    super(message)
    this.statusCode = statusCode
    this.customErrorCode = customErrorCode
    this.detail = detail
  }
}

const databaseActionType = z.enum([
  'create',
  'read',
  'update',
  'delete'
])

const errorRoute = z.enum([
  'general',
  'admin',
  'company',

])

const createCustomError = (errorCode, route, detail) => {
  let errorRouteType
  if (route === errorRoute.enum.general) {
    errorRouteType = errorMessages(errorCode, detail)
  } else if (route === errorRoute.enum.admin) {
    errorRouteType = adminErrorMessages(errorCode, detail)
  }
  else if (route === errorRoute.enum.company) {
    errorRouteType = companyErrorMessages(errorCode, detail)
  }
  const {
    message,
    statusCode,
    errorCode: customErrorCode,
    detail: messageDetail
  } = errorRouteType

  const error = new CustomAPIError(message, statusCode, customErrorCode, messageDetail)
  return error
}

module.exports = { createCustomError, CustomAPIError, errorRoute, databaseActionType }
