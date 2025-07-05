import { NextFunction, Request, Response } from "express";
import { ResponseStandardizer } from "../utils/responseStandardizer";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`Error ${statusCode}: ${message}`);
  console.error(err.stack);

  ResponseStandardizer.error(res, message, statusCode);

  next();
};
