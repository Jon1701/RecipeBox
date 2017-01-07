// Dependencies.
import React from 'react';
import classNames from 'classnames';

// Component containing buttons to add/remove fields.
export default class PlusMinus extends React.Component {
  render() {
    // Deconstruct props.
    const { handleClick, stateKey, readOnly } = this.props;

    // Classnames to control component visibility.
    const myClasses = classNames({
      hidden: readOnly,
      'btn-group-plusminus': true,
    });

    return (
      <div className={myClasses}>
        <button
          className="btn btn-add-remove"
          type="button"
          onClick={(e) => { handleClick(e, 'ADD', stateKey); }}
        >
          Add
        </button>

        <button
          className="btn btn-add-remove"
          type="button"
          onClick={(e) => { handleClick(e, 'REMOVE', stateKey); }}
        >
          Remove
        </button>
      </div>
    );
  }
}

// Prop validation.
PlusMinus.propTypes = {
  handleClick: React.PropTypes.func.isRequired,
  stateKey: React.PropTypes.oneOf(['instructions', 'ingredients']).isRequired,
  readOnly: React.PropTypes.bool,
};
