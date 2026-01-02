import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request & { requestId?: string }, res: Response, next: () => void) {
    const start = Date.now();

    res.on('finish', () => {
      const ms = Date.now() - start;
      const rid = req.requestId || (req.headers['x-request-id'] as string) || '-';
      // Log gọn, đủ debug
      // eslint-disable-next-line no-console
      console.log(`[${req.method}] ${req.originalUrl} ${res.statusCode} - ${ms}ms rid=${rid}`);
    });

    next();
  }
}
