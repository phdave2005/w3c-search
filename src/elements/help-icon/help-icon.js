import { Link } from 'react-router-dom'
import './help-icon.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons'

function HelpIcon(props) {
    return (
        <Link to="/w3c-search/help" className="action-icon">
            <FontAwesomeIcon icon={faCircleQuestion} />
        </Link>
    );
}

export default HelpIcon;
