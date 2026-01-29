import { GlobalConfig } from '@eui/core';

export const GLOBAL: GlobalConfig = {
    appTitle: 'CSDR-app',
    i18n: {
        i18nService: {
            defaultLanguage: 'en',
            languages: [
                {
                    code: 'en',
                    label: 'English'
                },
                {
                    code: 'fr',
                    label: 'Français'
                }
            ],
        },
        i18nLoader: {
            i18nFolders: [
            ],
        },
    },
    user: {
        defaultUserPreferences: {
            dashboard: { },
            lang: 'en',
        },
    },
};
