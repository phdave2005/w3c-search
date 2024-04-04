import React, { useState } from 'react'
import { BrowserRouter, Link, Routes, Route } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXTwitter } from '@fortawesome/free-brands-svg-icons'
import Home from './home/home.js'
import Help from './help/help.js'
import About from './about/about.js'
import HelpIcon from './elements/help-icon/help-icon.js'
import Settings from './settings/user-settings.js'
import SettingsToggle from './elements/settings/settings-toggle.js'
import TRANSLATION_MAP from './app-translation-map.js'

const App = () => {
    const language =  window?.localStorage?.getItem("language-used") || 'en';
    const [state] = useState({
        about: TRANSLATION_MAP[language].about
    });
    return (
        <BrowserRouter>
            <div className="App">
                <header className="flex-align-top">
                    <div></div>
                    <div className="action-container MR4">
                        <HelpIcon />
                        <SettingsToggle />
                    </div>
                </header>
                <Routes>
                    <Route path="/w3c-search" element={<Home />} />
                    <Route path="/w3c-search/help" element={<Help />} />
                    <Route path="/w3c-search/settings" element={<Settings />} />
                    <Route path="/w3c-search/about" element={<About />} />
                </Routes>
                <footer className="flex-align-center">
                    <span className="ML4">
                        <a href="https://twitter.com/phdave2005?ref_src=twsrc%5Etfw" target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faXTwitter} /></a>
                    </span>
                    <span>&copy;{new Date().getFullYear()} <a href="https://phdave.com" target="_blank" rel="noreferrer">PhDave LLC</a></span>
                    <span className="MR4">
                        <Link id="about" to="/w3c-search/about">{state.about}</Link>
                    </span>
                </footer>
            </div>
        </BrowserRouter>
    );
};

export default App;
