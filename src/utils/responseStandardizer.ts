import { FastifyReply } from "fastify";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * A class for standardizing the response format of the API.
 * @class ResponseStandardizer
 * @static
 * @method success Standardizes the success response format
 * @method error Standardizes the error response format
 * @method notFound Equivalent to error(reply, message, 404)
 * @method badRequest Equivalent to error(reply, message, 400)
 */
export class ResponseStandardizer {
  static success<T>(reply: FastifyReply, data: T, message = "Success"): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
    };
    reply.send(response);
  }

  static error(reply: FastifyReply, message: string, statusCode = 500): void {
    const response: ApiResponse = {
      success: false,
      message,
      error: message,
    };
    reply.status(statusCode).send(response);
  }

  static notFound(reply: FastifyReply, message = "Resource not found"): void {
    this.error(reply, message, 404);
  }

  static badRequest(reply: FastifyReply, message = "Bad request"): void {
    this.error(reply, message, 400);
  }
}
