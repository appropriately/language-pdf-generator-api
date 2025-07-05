import { Request, Response } from 'express';
import { ResponseStandardizer } from '../utils/responseStandardizer';

export const notFoundHandler = (req: Request, res: Response): void =>
  ResponseStandardizer.notFound(
    res,
    `Route ${req.method} ${req.originalUrl} not found`
  );