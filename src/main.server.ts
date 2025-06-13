import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { prerenderRoutes } from './app/prerender-routes';

const serverConfig = {
  providers: [
    provideServerRendering(),
    { provide: 'PRERENDER_ROUTES', useValue: prerenderRoutes }
  ]
};

const config = mergeApplicationConfig(appConfig, serverConfig);
const bootstrap = () => bootstrapApplication(App, config);

export default bootstrap;
