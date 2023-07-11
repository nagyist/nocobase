import { applyMixins, AsyncEmitter } from '@nocobase/utils';
import { EventEmitter } from 'events';
import type Application from './application';
import { RpcBrokerFactory } from './rpc-broker/factory';
import { RpcBrokerInterface } from './rpc-broker/interface';

type BootOptions = {
  appName: string;
  options: any;
  appSupervisor: AppSupervisor;
};

type AppBootstrapper = (bootOptions: BootOptions) => Promise<void>;

export class AppSupervisor extends EventEmitter implements AsyncEmitter {
  private static instance: AppSupervisor;
  public runningMode: 'single' | 'multiple' = 'multiple';
  public singleAppName: string | null = null;
  declare emitAsync: (event: string | symbol, ...args: any[]) => Promise<boolean>;
  public apps: {
    [key: string]: Application;
  } = {};

  private rpcBroker: RpcBrokerInterface;
  private appBootstrapper: AppBootstrapper = null;

  private constructor() {
    super();

    if (process.env.STARTUP_SUBAPP) {
      this.runningMode = 'single';
      this.singleAppName = process.env.STARTUP_SUBAPP;
    }

    this.rpcBroker = RpcBrokerFactory.build(this);
  }

  public static getInstance(): AppSupervisor {
    if (!AppSupervisor.instance) {
      AppSupervisor.instance = new AppSupervisor();
    }

    return AppSupervisor.instance;
  }

  getRpcBroker() {
    return this.rpcBroker;
  }

  async reset() {
    const appNames = Object.keys(this.apps);
    for (const appName of appNames) {
      await this.removeApp(appName);
    }

    this.appBootstrapper = null;
    this.removeAllListeners();
  }

  async destroy() {
    await this.reset();
    AppSupervisor.instance = null;
  }

  async bootStrapApp(appName: string, options = {}) {
    if (!this.hasApp(appName) && this.appBootstrapper) {
      console.log(`bootStrapApp ${appName}`);
      await this.appBootstrapper({
        appSupervisor: this,
        appName,
        options,
      });
    }
  }

  async getApp(
    appName: string,
    options: {
      withOutBootStrap?: boolean;
      [key: string]: any;
    } = {},
  ) {
    if (!options.withOutBootStrap) {
      await this.bootStrapApp(appName, options);
    }

    return this.apps[appName];
  }

  setAppBootstrapper(appBootstrapper: AppBootstrapper) {
    this.appBootstrapper = appBootstrapper;
  }

  hasApp(appName: string): boolean {
    return !!this.apps[appName];
  }

  // add app into supervisor
  addApp(app: Application) {
    // if there is already an app with the same name, throw error
    if (this.apps[app.name]) {
      throw new Error(`app ${app.name} already exists`);
    }

    console.log(`add app ${app.name} into supervisor`);

    this.apps[app.name] = app;

    // listen afterDestroy event, after app destroyed, remove it from supervisor
    const afterDestroy = () => {
      delete this.apps[app.name];
    };

    // set alwaysBind to true, so that afterDestroy will always be listened after application reload
    afterDestroy.alwaysBind = true;

    app.on('afterDestroy', afterDestroy);
    this.emit('afterAppAdded', app);

    return app;
  }

  // get registered app names
  async getAppsNames() {
    const apps = Object.values(this.apps);

    return apps.map((app) => app.name);
  }

  async removeApp(appName: string) {
    if (!this.apps[appName]) {
      console.log(`app ${appName} not exists`);
      return;
    }

    // call app.destroy
    await this.apps[appName].destroy();
  }

  subApps() {
    return Object.values(this.apps).filter((app) => app.name !== 'main');
  }

  on(eventName: string | symbol, listener: (...args: any[]) => void): this {
    const listeners = this.listeners(eventName);
    const listenerName = listener.name;

    if (listenerName !== '') {
      const exists = listeners.find((l) => l.name === listenerName);

      if (exists) {
        super.removeListener(eventName, exists as any);
      }
    }

    return super.on(eventName, listener);
  }

  // call rpc method of other app
  async rpcCall(appName: string, method: string, ...args: any[]): Promise<{ result: any }> {
    return this.rpcBroker.callApp(appName, method, ...args);
  }

  // push event to other app
  async rpcPush(appName: string, event: string, options?: any) {
    return this.rpcBroker.pushToApp(appName, event, options);
  }

  // broadcast event to all other apps
  async rpcBroadcast(caller: Application, event: string, eventOptions?: any) {
    return this.rpcBroker.broadcast(caller, event, eventOptions);
  }
}

applyMixins(AppSupervisor, [AsyncEmitter]);
