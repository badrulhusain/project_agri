import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '@prisma/client';
import { map } from 'rxjs';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    let status = 500;
    let message: unknown = 'Internal server error';
    if (error instanceof HttpException) {
      status = error.getStatus();
      const body = error.getResponse();
      message =
        typeof body === 'string'
          ? body
          : ((body as { message?: unknown }).message ?? 'Request failed');
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const mapped = {
        P2002: [409, 'A record with these details already exists'],
        P2025: [404, 'Record not found'],
        P2003: [400, 'Invalid related record'],
        P2034: [409, 'Concurrent update; retry the request'],
      } as const;
      const detail = mapped[error.code as keyof typeof mapped];
      if (detail) [status, message] = detail;
    }
    if (status === 500)
      console.error(
        'Unhandled API error:',
        error instanceof Error ? error.name : 'Unknown error',
      );
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(status)
      .json({ success: false, message });
  }
}

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((value: unknown) => {
        if (
          value &&
          typeof value === 'object' &&
          'meta' in value &&
          'data' in value
        ) {
          return { success: true, ...value };
        }
        return { success: true, data: value };
      }),
    );
  }
}
