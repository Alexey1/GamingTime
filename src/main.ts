import { Aurelia } from 'aurelia-framework'
import environment from './environment';
import { I18N, Backend, TCustomAttribute, translations } from 'aurelia-i18n';
import { IWebApi, FakeWebApi } from './data/web-api';
import { IRxSchedulerProvider, RxSchedulerProvider } from './rx-scheduler-provider';

export function configure(aurelia: Aurelia) {
    aurelia.use
        .defaultBindingLanguage()
        .defaultResources()
        .eventAggregator()
        .plugin('aurelia-animator-css')
        .plugin('aurelia-i18n', (instance: any) => {
            let aliases = ['t', 'i18n'];
            TCustomAttribute.configureAliases(aliases);
            instance.i18next.use(Backend.with(aurelia.loader));
            instance.i18next.use({
                type: 'postProcessor',
                name: 'dev',
                process: function (value: any, key: any, options: any, translator: any) {
                    if (translator.language == 'dev') {
                        return ':' + value + ':';
                    }
                    return value;
                }
            });
            return instance.setup({
                backend: {
                    loadPath: './locales/{{ns}}.{{lng}}.json',
                },
                attributes: aliases,
                lng: 'dev',
                debug: false,
                parseMissingKeyHandler: function (key: string) {
                    return `[${key}]`;
                },
                postProcess: 'dev'
            });
        })
        .feature('common')
        .feature('resources');

    if (environment.debug) {
        aurelia.use.developmentLogging();
    }

    if (environment.testing) {
        aurelia.use.plugin('aurelia-testing');
    }

    aurelia.container.registerSingleton(IRxSchedulerProvider, RxSchedulerProvider);
    aurelia.container.registerSingleton(IWebApi, FakeWebApi);

    aurelia.start().then(() => aurelia.setRoot());
}
