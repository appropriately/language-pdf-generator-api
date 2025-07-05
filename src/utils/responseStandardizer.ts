import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export class ResponseStandardizer {
  static success<T>(res: Response, data: T, message = 'Success'): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
    };
    res.json(response);
  }

  static error(res: Response, message: string, statusCode = 500): void {
    const response: ApiResponse = {
      success: false,
      message,
      error: message,
    };
    res.status(statusCode).json(response);
  }

  static notFound(res: Response, message = 'Resource not found'): void {
    this.error(res, message, 404);
  }

  static badRequest(res: Response, message = 'Bad request'): void {
    this.error(res, message, 400);
  }
} 