import { ErrorRequestHandler } from 'express'

/**
 * An expected user error.
 *
 * The message is exposed in the API response, along with the
 * provided HTTP status code.
 *
 * @see expressErrorHandler
 */
export class AppError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)

    this.status = status
  }
}

/**
 * An express error handler that exposes `AppError` instances,
 * and hides all others.
 *
 * @see AppError
 */
export const expressErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  if (err instanceof AppError) {
    res.status(err.status).json({
      message: err.message,
    })
  } else {
    console.error('Unhandled error:', err)
    res.status(500).json({
      message: 'Internal server error',
    })
  }
}
