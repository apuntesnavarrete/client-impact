import { HttpInterceptorFn } from '@angular/common/http';

export const logInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🌐 Petición interceptada:', req.url);
  return next(req);
};
