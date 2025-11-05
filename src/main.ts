import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { appConfig } from './app/app.config';
import { logInterceptor } from './app/interceptors/token.interceptor';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideHttpClient(
      withFetch(),
      withInterceptors([logInterceptor]) // 👈 Se agrega aquí
    )
  ]
})
.catch(err => console.error(err));