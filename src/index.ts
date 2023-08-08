export type ConfType = any;

let Conf: ConfType | undefined;
async function importConf() {
    if (Conf === undefined) {
        Conf = (await import('Conf')).default;
    }
}

export async function createStore(cwd: string) {

    await importConf();

    return new Conf({
        configName: 'storage',
        schema,
        migrations,
        cwd,
        projectVersion: '1.0.0'
    });
}

const schema = {
    connection: {
        type: 'object',
        properties: {
            host: {
                type: 'string',
                default: ''
            },
            port: {
                type: 'number',
                default: 8081
            },
            webSocketPort: {
                type: 'number',
                default: 41312
            },
            password: {
                type: 'string',
                default: '1234'
            }
        }
    },
    mango: {
        type: 'object',
        properties: {
            apiKey: {
                type: 'string',
                default: ''
            },
            apiSalt: {
                type: 'string',
                default: ''
            }
        }
    },
    preferences: {
        type: 'object',
        properties: {
            showRegionOperator: {
                type: 'boolean',
                default: false
            },
            logMode: {
                type: 'number',
                default: 1
            }
        }
    },
    http1c: {
        type: 'object',
        properties: {
            use: {
                type: 'boolean',
                default: false
            },
            connectionString: {
                type: 'string',
                default: ''
            },
            userName: {
                type: 'string',
                default: ''
            },
            password: {
                type: 'string',
                default: ''
            }
        }
    },
    comConnection: {
        type: 'object',
        properties: {
            use: {
                type: 'boolean',
                default: false
            },
            connectionString: {
                type: 'string',
                default: ''
            }
        }
    },
    lines: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                lineNumber: {
                    type: 'string'
                },
                login: {
                    type: 'string'
                },
                password: {
                    type: 'string'
                },
                guid: {
                    type: 'string'
                },
                number: {
                    type: 'string'
                }
            }
        }
    }
};

const migrations = {
    //migration to new schema
    '1.0.0': (store: ConfType) => {
        store.set({
            connection: {
                host: store.get('host'),
                port: store.get('httpPort'),
                webSocketPort: store.get('webSocketPort'),
                password: store.get('passwordKey')
            }
        });

        store.set({
            mango: {
                apiKey: store.get('apiKey'),
                apiSalt: store.get('apiSalt')
            }
        });

        store.set({
            preferences: {
                showRegionOperator: store.get('showRegionOperator'),
                logMode: store.get('logMode')
            }
        });


        store.set({
            http1c: {
                use: store.get('useHTTP1C'),
                connectionString: store.get('HTTP1CConnectionString'),
                userName: store.get('HTTP1CUserName'),
                password: store.get('HTTP1CPassword')
            }
        });

        store.set({
            comConnection: {
                use: store.get('v83ComActive'),
                connectionString: store.get('v83ComDbConnectString')
            }
        });

        store.set('lines', (store.get('lines') as Array<{ lineNumber: 'number' }>)?.map(line => ({ ...line, lineNumber: String(line.lineNumber) })) || []);

        store.delete('version');
        store.delete('host');
        store.delete('httpPort');
        store.delete('apiKey');
        store.delete('apiSalt');
        store.delete('webSocketPort');
        store.delete('passwordKey');
        store.delete('v83ComDbConnectString');
        store.delete('showRegionOperator');
        store.delete('v83ComActive');
        store.delete('logMode');
        store.delete('useHTTP1C');
        store.delete('HTTP1CConnectionString');
        store.delete('HTTP1CUserName');
        store.delete('HTTP1CPassword');
    }
}