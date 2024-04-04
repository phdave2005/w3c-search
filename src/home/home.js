import React, { Component } from 'react'
import axios from 'axios'
import './home.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy, faDownload, faRefresh } from '@fortawesome/free-solid-svg-icons'
import MainForm from '../forms/main/main-form.js'
import processing from './processing.svg'
import TRANSLATION_MAPS from './translation-map.js'

class Home extends Component {
    constructor(props) {
        super(props);
        this.apiPath = 'https://cssburner.com/requests/ajax/ajax.php';
        this.language = window?.localStorage?.getItem("language-used") || 'en';
        this.textUsed = TRANSLATION_MAPS.TEXT[this.language];
        this.corsDomain = 'https://corsproxy.io';
        this.state = {
            forms: {
                cl: '',
                active: 'main',
                validation: {
                    error: {
                        cl: 'VH invalid',
                        text: '&nbsp;'
                    },
                    processing: {
                        cl: 'DN',
                        text: null
                    }
                }
            },
            info: {
                cl: 'DN'
            },
            recentResponse: null,
            results: {
                cl: 'DN',
                html: ''
            }
        };
    }

    search = () => {
        if (!this.isProcessing() && !this.invalidateFormActiveSection()) {
            document.getElementById("parameters-form").getElementsByTagName("BUTTON")[1].click();
        }
    }

    isProcessing = () => {
        const el = document.getElementById("processing-container");
        return !!el && !el.classList.contains("DN");
    }

    processFormSubmission = (e) => {
        e.preventDefault();
        const elements = e.target.querySelectorAll("[data-search-category]");
        let i,
            val,
            ID,
            type,
            category,
            filterData,
            searchData = {
                payload: {},
                filters: {}
            };
        for(i in elements) {
            if (i.match(/^\d+$/) && !!elements[i] && elements[i].nodeName && !!elements[i]?.getAttribute("data-search-category")) {
                val = elements[i]?.value.trim();
                if (val) {
                    if (!!elements[i]?.type) {
                        ID = elements[i].id;
                        category = elements[i].getAttribute("data-search-category");
                        filterData = elements[i].getAttribute("data-filter") || null;
                        type = elements[i].type;
                        if (val) {
                            if (elements[i].type === 'checkbox') {
                                if (elements[i].checked) {
                                    val = 1;
                                } else {
                                    continue;
                                }
                            }
                            searchData[category][ID] = {
                                filter: filterData,
                                nodeName: elements[i].nodeName,
                                type: type,
                                value: val
                            };
                        }
                    }
                }
            }
        }
        if (Object.keys(searchData.payload).length) {
            this.setState(state => (state.forms.validation = {
                error: {
                    cl: 'VH invalid',
                    text: '&nbsp;'
                },
                processing: {
                    cl: '',
                    text: null
                }
            }, state));
            this.fetchData(searchData);
        } else{
            this.setState(state => (state.forms.validation = {
                error: {
                    cl: 'invalid',
                    text: this.textUsed.validation.error.oneParameter
                },
                processing: {
                    cl: 'DN',
                    text: null
                }
            }, state));
        }
    }

    constructQueryString(data) {
        let i, field, value, parameter, queryStringArray = [];
        const paramMap = {
            searchcontains: 'value',
            searchlacks: 'notvalue'
        };
        for(i in data) {
            if (!!data[i]?.value) {
                value = data[i].value;
                field = document.getElementById(i);
                if (!!field && !!value) {
                    parameter = paramMap[i] + '=' + data[i].value;
                    queryStringArray.push(parameter);
                }
            }
        }
        queryStringArray.push('username=' + window.localStorage?.getItem("username"));
        queryStringArray.push('publickey=' + window.localStorage?.getItem("publickey"));
        return queryStringArray.join('&');
    }

    isLocalhost() {
        return document.URL.indexOf("localhost") !== -1;
    }

    getQueryLimitParameter() {
        const searchLimit = window?.localStorage?.getItem("search-limit");
        return (!!searchLimit && searchLimit > 0) ? '&limit=' + searchLimit : '';
    }

    fetchData(searchData) {
        const payload = searchData.payload;
        const filters = searchData.filters;
        if (!window.navigator.onLine && this.isLocalhost()) {
            import(`../constants/mock-response.js`)
            .then((response) => {
                const mockResponseData = response.MOCK_RESPONSE;
                this.processResponse(mockResponseData, filters);
            });
        } else {
            if (!window.localStorage?.getItem("username")?.length || !window.localStorage?.getItem("publickey")?.length) {
                this.setState(state => (state.forms.validation = {
                    error: {
                        cl: 'invalid',
                        text: this.textUsed.validation.error.missingAuth
                    },
                    processing: {
                        cl: 'DN',
                        text: null
                    }
                }, state));
            } else {
                const searchUrl = this.apiPath + '?type=getGlossaryTerms&scope=api&searchType=topic&' + this.constructQueryString(payload) + this.getQueryLimitParameter();
                axios.get(
                    this.corsDomain + '/?' + encodeURIComponent(searchUrl)
                )
                .then((response) => {
                    if (response?.data?.terms?.length) {
                        this.processResponse(response.data, filters);
                    } else {
                        this.setState(state => (state.forms.validation = {
                            error: {
                                cl: 'invalid',
                                text: this.textUsed.validation.error.noData
                            },
                            processing: {
                                cl: 'DN',
                                text: null
                            }
                        }, state));
                    }
                })
                .catch((error) => {
                    this.setState(state => (state.forms.validation = {
                        error: {
                            cl: 'invalid',
                            text: this.textUsed.validation.error.api
                        },
                        processing: {
                            cl: 'DN',
                            text: null
                        }
                    }, state));
                });
            }
        }
    }

    processResponse(data, filters) {
        this.setState({
            recentResponse: data
        });
        let i, j, filteredData = [], allPass;
        /*for(i in data) {
            allPass = true;
            for(j in filters) {
                if (!filterMap[filters[j].filter](data[i], filters[j].value)) {
                    allPass = false;
                    break;
                }
            }
            if (allPass) {
                filteredData.push(data[i]);
            }
        }*/
        //if (filteredData.length) {
            if (window.localStorage?.getItem("download") === '1') {
                this.downloadData(data);
            } else {
                this.renderWithTimeout(data);
            }
        /*} else {
            this.setState(state => (state.forms.validation = {
                error: {
                    cl: 'invalid',
                    text: this.textUsed.validation.error.noData
                },
                processing: {
                    cl: 'DN',
                    text: null
                }
            }, state));
        }*/
    }

    downloadData(data) {
        const date = new Date();
        const str = JSON.stringify(data, undefined, 2);
        const blob = new Blob([str], {
            type: "application/json"
        });
        const downloadLink = document.getElementById("download");
        downloadLink.setAttribute("href", URL.createObjectURL(blob));
        downloadLink.setAttribute("download", "data_" + date.toISOString().split("T")[0] + "-" + date.getTime() + ".json");
        downloadLink.click();
        this.renderWithTimeout(data);
    }

    downloadResponse = () => {
        this.downloadData(this.state.recentResponse);
    }

    copyResponse = () => {
        const el = document.getElementById("results-container");
        if ('clipboard' in navigator && document.createRange) {
            const textToCopy = el.innerText;
            navigator.clipboard.writeText(textToCopy)
            .then(function() {
                let range = document.createRange(), selection;
                range.selectNodeContents(el);
                selection = 'getSelection' in window ? window.getSelection() : textToCopy.substring(0, textToCopy.length);
                selection.removeAllRanges();
                selection.addRange(range);
                return range;
            })
            .catch(function(error) {});
        } else {
            if (document.body.createControlRange) {
                let content = el.innerText,
                    controlRange,
                    range = document.body.createTextRange();
                range.moveToElementText(content);
                range.select();

                controlRange = document.body.createControlRange();
                controlRange.addElement(content);
                controlRange.execCommand('Copy');
            }
        }
    }

    renderWithTimeout(data) {
        setTimeout(() => {
            this.setState(state => (state.forms.validation = {
                error: {
                    cl: 'valid',
                    text: this.textUsed.validation.success.downloaded
                },
                processing: {
                    cl: 'DN',
                    text: null
                }
            }, state));
            this.setState({
                results: {
                    cl: '',
                    html: JSON.stringify(data, null, 4)
                }
            });
            setTimeout(() => {
                this.completeProcessing();
            }, 6000);
        }, 250);
    }

    completeProcessing() {
        this.setState(state => (state.forms.validation = {
            error: {
                cl: 'VH',
                text: '&nbsp;'
            },
            processing: {
                cl: 'DN',
                text: null
            }
        }, state));
    }

    invalidateFormActiveSection = () => {
        const validate = (f) => {
            const errorLabels = [];
            const validations = f.getAttribute("data-validations");
            let invalid;
            validations.split(",").forEach((validation) => {
                switch(validation) {
                    case 'disallowedContainsSubstring':
                        const containsValue = document.getElementById("searchcontains").value.trim();
                        const lacksValue = document.getElementById("searchlacks").value.trim();
                        invalid = !!containsValue && !!lacksValue && (containsValue.indexOf(lacksValue) !== -1);
                    break;
                    default: // required
                        invalid = !f.value.trim();
                    break;
                }
                if (invalid) {
                    errorLabels.push(this.textUsed.validation.labels[validation]);
                }
            });
            return errorLabels;
        };

        let field,
            errorLabels,
            i,
            id,
            validations,
            hasError = false;
        validations = document.querySelectorAll("[data-validations]");
        for(i in validations) {
            id = validations[i].id;
            field = document.getElementById(validations[i].id);
            if (!!field) {
                errorLabels = validate(field);
                if (errorLabels?.length) {
                    hasError = true;
                    this.markInvalidField({
                        elem: document.getElementById(id),
                        errorLabel: errorLabels[0]
                    });
                } else {
                    this.clearInvalidField({
                        elem: document.getElementById(id),
                        errorLabel: ''
                    });
                }
            }
        }
        if (hasError) {
            document.querySelectorAll(".flex-field.invalid")[0].parentElement.parentElement.scrollIntoView();
        } else {
            document.getElementById("main-grid-view").scrollTop = 0;
        }
        return hasError;
    }

    markInvalidField(data) {
        let field = data.elem,
            target,
            label;
        if (!!field) {
            target = field;
            while(!target.classList.contains("flex-field")) {
                target = field.parentElement;
            }
            target.classList.add("invalid");
            label = target.getElementsByTagName("LABEL");
            if (!!label) {
                label[0].getElementsByClassName("default-label")[0].classList.add("DN");
                label[0].getElementsByClassName("error-label")[0].classList.remove("DN");
                label[0].getElementsByClassName("error-label-text")[0].innerHTML = data.errorLabel;
            }
        }
    }

    clearInvalidField(data) {
        let field = data.elem,
            target,
            label;
        if (!!field) {
            target = field;
            while(!target.classList.contains("flex-field")) {
                target = field.parentElement;
            }
            target.classList.remove("invalid");
            label = target.getElementsByTagName("LABEL");
            if (!!label) {
                label[0].getElementsByClassName("default-label")[0].classList.remove("DN");
                label[0].getElementsByClassName("error-label")[0].classList.add("DN");
                label[0].getElementsByClassName("error-label-text")[0].innerHTML = data.errorLabel || '';
            }
        }
    }

    reset = () => {
        this.completeProcessing();
        this.setState({
            results: {
                cl: 'DN',
                html: ''
            }
        });
    }

    render() {
        return (
            <main>
                <div id="main-grid">
                    <div id="main-grid-view">
                        <p className={"dialog " + this.state.forms.validation.error.cl} data-identifier="info">{this.state.forms.validation.error.text}</p>
                        <div id="processing-container" className={this.state.forms.validation.processing.cl}>
                            <div>
                                <img className="scale-2" src={processing} alt="processing" data-testid="processing" />
                            </div>
                            <p>{this.textUsed.processing.text}</p>
                        </div>
                        <form id="parameters-form" className={this.state.results.cl.match(/DN/) ? '' : 'DN'} data-testid="form" onSubmit={this.processFormSubmission}>
                            <h1 className="form-heading">{this.textUsed.appTitle}</h1>
                            <MainForm language={this.language} />
                            <button type="button" onClick={this.search}>{this.textUsed.button.text}</button>
                            <button type="submit" className="DN"></button>
                        </form>
                        <div id="results-container-parent" className={this.state.results.cl}>
                            <h1 className="M0">{this.textUsed.heading.searchResults} ({this.state.recentResponse?.terms?.length})</h1>
                            <div id="results-actions">
                                <span onClick={this.reset}><FontAwesomeIcon icon={faRefresh} /></span>
                                <span onClick={this.copyResponse}><FontAwesomeIcon icon={faCopy} /></span>
                                <span onClick={this.downloadResponse}><FontAwesomeIcon icon={faDownload} /></span>
                            </div>
                            <pre id="results-container" className="bgw" dangerouslySetInnerHTML={{__html: this.state.results.html}}></pre>
                        </div>
                        <a href="/" id="download" className="DN">-</a>
                    </div>
                </div>
            </main>
        );
    }
}

export default Home;
