import { Static, Type } from "@sinclair/typebox";
import { FastifyReply } from "fastify";

export const SuccessResponse = Type.Object({
  success: Type.Literal(true),
  message: Type.String(),
  data: Type.Optional(Type.Any()),
});

export const ErrorResponse = Type.Object({
  success: Type.Literal(false),
  message: Type.String(),
  error: Type.String(),
});

export type SuccessResponseType = Static<typeof SuccessResponse>;
export type ErrorResponseType = Static<typeof ErrorResponse>;
export type ApiResponseType = SuccessResponseType | ErrorResponseType;

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
    const response: SuccessResponseType = {
      success: true,
      message,
      data,
    };
    reply.send(response);
  }

  static error(reply: FastifyReply, message: string, statusCode = 500): void {
    const response: ErrorResponseType = {
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
