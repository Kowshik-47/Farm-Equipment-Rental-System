import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';
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
