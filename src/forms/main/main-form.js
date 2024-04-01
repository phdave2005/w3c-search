import React from 'react'
import './main-form.css'
import '../form.css'
import LabelElement from '../../elements/label/label-element.js'
import TEXT_MAP from './translation-map.js'

function MainForm(props) {
    const textUsed = TEXT_MAP[props.language];
    return (
        <section id="main-section" className={props.class} data-testid="main">
            <div className="flex-field">
                <input id="searchcontains" className="field" data-validations="required" data-search-category="payload" />
                <LabelElement labelFor={'searchcontains'} text={textUsed.labels.searchContains} required={true} />
            </div>
            <div className="flex-field">
                <input id="searchlacks" className="field" data-validations="disallowedContainsSubstring" data-search-category="payload" />
                <LabelElement labelFor={'searchlacks'} text={textUsed.labels.searchLacks} required={false} />
            </div>
        </section>
    );
}

export default MainForm;
