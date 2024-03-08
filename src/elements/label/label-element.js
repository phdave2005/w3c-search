import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import './label-element.css'

function LabelElement(props) {
    return (
        <label htmlFor={props.labelFor} data-testid="label">
            <span className="default-label">
                <span dangerouslySetInnerHTML={{__html: props.text}}></span>
				<span className={props.required ? '' : 'DN'}> *</span>
			</span>
			<span className="error-label DN">
				<FontAwesomeIcon icon={faTimes} />
				<span className="error-label-text ML4"></span>
			</span>
		</label>
    );
}

export default LabelElement;