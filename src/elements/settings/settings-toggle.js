import { Link, useLocation } from 'react-router-dom'
import './settings-toggle.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear, faHouse } from '@fortawesome/free-solid-svg-icons'

function SettingsToggle(props) {
    const location = useLocation();
    const config = location.pathname.match(/\/w3c-search\/?$/i) ? {
        destination: '/w3c-search/settings',
        icon: faGear
    } : {
        destination: '/w3c-search',
        icon: faHouse
    };
    return (
        <Link to={config.destination} className="action-icon">
            <FontAwesomeIcon icon={config.icon} />
        </Link>
    );
}

export default SettingsToggle;
