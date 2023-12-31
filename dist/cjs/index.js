"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStore = void 0;
let Conf;
function importConf() {
    return __awaiter(this, void 0, void 0, function* () {
        if (Conf === undefined) {
            Conf = (yield import('conf')).default;
        }
    });
}
const os_1 = require("os");
const generatePassword = require("password-generator");
const fGeneratePassword = typeof generatePassword === 'object' ? generatePassword.default : generatePassword;
function createStore(cwd) {
    return __awaiter(this, void 0, void 0, function* () {
        yield importConf();
        const schema = getSchema();
        return new Conf({
            configName: 'storage',
            schema,
            migrations,
            cwd,
            projectVersion: '1.5.8'
        });
    });
}
exports.createStore = createStore;
function getSchema() {
    return {
        connection: {
            type: 'object',
            properties: {
                host: {
                    type: 'string',
                    default: getInternalIP() || '192.168.1.1',
                },
                port: {
                    type: 'number',
                    default: 8081
                },
                webSocketPort: {
                    type: 'number',
                    default: 8082
                },
                password: {
                    type: 'string',
                    default: fGeneratePassword(8, false)
                }
            }
        },
        provider: {
            type: 'object',
            oneOf: [
                {
                    properties: {
                        name: { const: 'mango' },
                        settings: {
                            type: 'object',
                            properties: {
                                apiKey: { type: 'string' },
                                apiSalt: { type: 'string' }
                            }
                        }
                    }
                },
                {
                    properties: {
                        name: { const: 'rt' },
                        settings: {
                            type: 'object',
                            properties: {
                                url: { type: 'string' },
                                xClientId: { type: 'string' },
                                xClientSign: { type: 'string' }
                            }
                        }
                    }
                },
            ]
        },
        preferences: {
            type: 'object',
            properties: {
                showRegionOperator: {
                    type: 'boolean',
                    default: false
                },
                routeCalls: {
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
                    lineNumber: { type: ['string', 'number'] },
                    login: { type: 'string' },
                    password: { type: 'string' },
                    guid: { type: 'string' },
                    number: { type: 'string' }
                }
            }
        }
    };
}
const migrations = {
    /* initial */
    '1.0.0': (store) => {
        var _a;
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
        store.set('lines', ((_a = store.get('lines')) === null || _a === void 0 ? void 0 : _a.map(line => (Object.assign(Object.assign({}, line), { lineNumber: String(line.lineNumber) })))) || []);
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
    },
    /* provider */
    '1.5.8': (store) => {
        const mangoSettings = store.get('mango');
        store.set('provider', {
            name: 'mango',
            settings: mangoSettings
        });
        store.delete('mango');
        store.set('preferences.routeCalls', false);
    }
};
function getInternalIP() {
    const nets = (0, os_1.networkInterfaces)();
    const results = Object.create(null); // Or just '{}', an empty object
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
            const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
            if (net.family === familyV4Value && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }
    if (Object.keys(results).length) {
        return results[Object.keys(results)[0]][0];
    }
}
