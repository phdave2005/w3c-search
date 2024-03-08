import React, { Component } from 'react'
import './user-settings.css'
import '../App.css';
import LANGUAGE_INFO from './translation-map.js'
import LabelElement from '../elements/label/label-element.js'

class Settings extends Component {
    constructor() {
        super();
        this.languageUsed = 'en';
        this.state = {
            hasStorage: false,
            storageEvent: {
                text: '&nbsp;',
                cl: 'VH'
            },
            text: {
                title: '',
                label: {
                    language: '',
                    download: '',
                    publicKey: '',
                    searchLimit: '',
                    username: ''
                },
                button: ''
            },
            view: {
                storage: {
                    cl: 'VH',
                    text: '&nbsp;'
                },
                nostorage: {
                    cl: 'VH',
                    text: '&nbsp;'
                }
            }
        }
    }

    componentDidMount() {
        if (this.detectLocalStorage()) {
            this.languageUsed = window.localStorage.getItem("language-used") || 'en';
            this.setSettingsState();
            document.getElementById("username").value = window.localStorage?.getItem("username");
            document.getElementById("publickey").value = window.localStorage?.getItem("publickey");
            document.getElementById("language-used").value = this.languageUsed;
            document.getElementById("download").checked = window.localStorage?.getItem("download") === '1';
        }
    }

    setSettingsState() {
        const textUsed = LANGUAGE_INFO.TEXT_MAP[this.languageUsed];
        this.setState({
            hasStorage: true,
            text: {
                label: {
                    language: textUsed.label.language,
                    download: textUsed.label.download,
                    publicKey: textUsed.label.publicKey,
                    searchLimit: textUsed.label.searchLimit,
                    username: textUsed.label.username
                },
                button: textUsed.button
            },
            view: {
                storage: {
                    cl: '',
                    text: textUsed.heading
                },
                nostorage: {
                    cl: 'VH',
                    text: textUsed.noStorage
                }
            }
        });
    }

      detectLocalStorage() {
        if ('hasStorageAccess' in document) {
            return true;
        } else {
            return this.detectLocalStorageLegacy();
        }
    }

    detectLocalStorageLegacy = () => {
        try {
            var value = '1',
                testkey = 'aaa',
                storage = window.localStorage;
            storage.setItem(testkey, value);
            storage.removeItem(testkey);
            return true;
        } catch (e) {
            return false;
        }
    }

    updateLocalStorage = () => {
        const set = document.getElementsByClassName("field");
        const storage = window.localStorage;
        const storageJSONInitial = JSON.stringify(storage);
        let i, val, storageJSONFinal,
            textUsed = LANGUAGE_INFO.TEXT_MAP[this.languageUsed]
        for(i in set) {
            if (set[i]?.nodeName) {
                val = set[i].value;
                if (set[i].type === 'checkbox') {
                    val = set[i].checked ? 1 : 0;
                }
                storage.setItem(set[i].id, val);
                storage.setItem(set[i].id, val);
                if (set[i].id === 'language-used') {
                    this.languageUsed = set[i].value;
                    this.setSettingsState();
                    let elem = document.getElementById("about");
                    if (!!elem) {
                        elem.innerHTML = LANGUAGE_INFO.TEXT_MAP[this.languageUsed].about.dvp;
                    }
                }
            }
        }
        storageJSONFinal = JSON.stringify(localStorage);
        textUsed = LANGUAGE_INFO.TEXT_MAP[this.languageUsed];
        this.setState({
            storageEvent: (storageJSONInitial !== storageJSONFinal) ? {
                text: textUsed.storageEvent.success,
                cl: ' success'
            } : {
                text: textUsed.storageEvent.fail,
                cl: ' fail'
            }
        });
        setTimeout(() => {
            this.setState({
                storageEvent: {
                    text: '&nbsp;',
                    cl: ' VH'
                }
            });
        }, 5000);
    }

    languageOptions() {
        let options = [],
            i = 0,
            selectedLanguage = window?.localStorage?.getItem("language-used") || 'en',
            src = LANGUAGE_INFO.LANGUAGES[selectedLanguage],
            len = src.length;
        for(; i < len; i++) {
            options.push(<option key={'l' + i} value={src[i].value}>{src[i].label}</option>);
        }
        return options;
    }

    handleNumberChange = (e) => {
        if ((e.target.type === 'number') && !e.target.value) {
            e.preventDefault();
            e.target.value = '';
        }
    }

    render() {
        return ( 
            <main id="settings">
                <section className="main-wrapper">
                    <p className={"dialog " + this.state.storageEvent.cl} data-identifier="info">{this.state.storageEvent.text}</p>
                    <div className={this.state.view.storage.cl}>
                        <h1 dangerouslySetInnerHTML={{__html: this.state.view.storage.text}}></h1>
                        <div className="flex-field">
                            <input id="username" className="field" data-search-category="payload" />
                            <LabelElement labelFor={'username'} text={this.state.text.label.username} />
                        </div>
                        <div className="flex-field">
                            <input id="publickey" className="field" data-search-category="payload" />
                            <LabelElement labelFor={'publickey'} text={this.state.text.label.publicKey} />
                        </div>
                        <div className="flex-field">
                            <select id="language-used" className="field">
                                {this.languageOptions()}
                            </select>
                            <LabelElement labelFor={'language-used'} text={this.state.text.label.language} />
                        </div>
                        <div className="flex-field-half-wrapper MT32">
                            <div className="flex-field half">
                                <input id="search-limit" step="any" min="1" type="number" data-validations="positiveNumber" data-search-category="payload" onKeyUp={this.handleNumberChange} />
                                <LabelElement labelFor={'search-limit'} text={this.state.text.label.searchLimit} />
                            </div>
                            <div className="flex-field half">
                                <input id="download" className="field MT24" type="checkbox" />
                                <LabelElement labelFor={'download'} text={this.state.text.label.download} tooltip={false} />
                            </div>
                        </div>
                        <button type="button" className="primary" onClick={this.updateLocalStorage}>{this.state.text.button}</button>
                    </div>
                    <div className={this.state.view.nostorage.cl}>
                        <h2 dangerouslySetInnerHTML={{__html: this.state.view.nostorage.text}}></h2>
                    </div>
                </section>
            </main>
        );
    }
}

export default Settings;
