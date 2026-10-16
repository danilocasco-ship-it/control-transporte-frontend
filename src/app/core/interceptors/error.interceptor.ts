import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { catchError, throwError } from "rxjs";

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  console.log(request);
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 400) {
        console.log("Bad Request");
      }

      console.log(error);
      return throwError(() => error.error.message);
    })
  );
};
