import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class UndefinedToNullInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    // 전 부분
    return next
      .handle()
      .pipe(map((data) => (data === undefined ? null : data)));
  }
}

// interceptor는 마지막으로 데이터를 보낼 때 가공할 기회를 준다.
