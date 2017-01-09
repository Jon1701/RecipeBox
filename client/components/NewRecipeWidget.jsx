// Dependencies.
import React from 'react';                  // React.
import request from 'common/request';       // HTTP GET/POST functionality.
import { connect } from 'react-redux';      // Connects component to Redux store.
import { withRouter } from 'react-router';  // Allows component to be aware of React Router.
import classNames from 'classnames';

// React Components.
import AlertBox from 'components/AlertBox'; // Alert Box.
import PlusMinus from 'components/PlusMinus';

// Component definition.
class NewRecipeWidget extends React.Component {

  // Component constructor.
  constructor(props) {
    super(props);

    // Local state.
    this.state = {
      alert: null,  // Alert Box notification.
      title: '',      // Recipe title.
      tagline: '',    // Recipe tagline.
      ingredients: [],  // Array of recipe ingredients.
      instructions: [], // Array of recipe preparation instructions.
    };

    // Bind methods to component instance.
    this.handleFormSubmit = this.handleFormSubmit.bind(this); // Form Submit.
    this.handleFormReset = this.handleFormReset.bind(this); // Form Reset.
    this.setAlert = this.setAlert.bind(this); // Set current alert.
    this.clearAlert = this.clearAlert.bind(this); // Clear the current alert.
    this.updateIngredient = this.updateIngredient.bind(this);
    this.updateInstruction = this.updateInstruction.bind(this);
    this.addRemoveFields = this.addRemoveFields.bind(this); // Adds/Remove ingredients/instructions.
  }

  // Method to set the current alert.
  setAlert(type, message) {
    this.setState({ alert: { type, message } });
  }

  // Method to clear the current alert.
  clearAlert() {
    this.setState({ alert: null });
  }

  // Method to handle form submit.
  handleFormSubmit(e) {
    // Prevent default form submit.
    e.preventDefault();

    // Clear any existing alerts.
    this.clearAlert();

    // Gather form field values.
    const { title, tagline, ingredients, instructions } = this.state;

    // Request body.
    const body = { title, tagline, ingredients, instructions };

    // Make a POST request to the API server, send recipe data, and token.
    request
      .post('/api/auth/create_recipe', body, this.props.token)
      .then((res) => {
        // Get recipe ID.
        const recipeID = res.data.payload.recipe['_id'];

        // Different behaviour based on success message.
        switch (res.data.code) {

          // Recipe successfully created.
          case 'CREATE_RECIPE_SUCCESS': {
            // Display success message.
            this.setAlert('SUCCESS', 'Recipe successfully created. Redirecting now.');

            // Redirect function.
            const redirect = () => {
              this.props.router.replace(`/view_recipe/${recipeID}`);
            };

            // Redirect to the login page.
            setTimeout(redirect.bind(this), 2000);
            break;
          }

          // Default behaviour: do nothing.
          default:
            break;
        }
      })
      .catch((err) => {
        // Display alert box with corresponding message.
        switch (err.response.data.code) {

          // Database error.
          case 'DB_ERROR':
            this.setAlert('FAILURE', 'Database error occurred.');
            break;

          // Missing title.
          case 'MISSING_TITLE':
            this.setAlert('FAILURE', 'Your recipe needs a title.');
            break;

          // Missing tagline.
          case 'MISSING_TAGLINE':
            this.setAlert('FAILURE', 'You should really provide a short summary of your recipe.');
            break;

          // Missing ingredients.
          case 'MISSING_INGREDIENTS':
            this.setAlert('FAILURE', 'No ingredients? What are you making? Air?');
            break;

          // Missing instructions.
          case 'MISSING_INSTRUCTIONS':
            this.setAlert('FAILURE', 'No preparation instructions? Did you buy this dish from a supermarket?');
            break;

          // Not enough ingredients.
          case 'MULTIPLE_INGREDIENTS_NEEDED':
            this.setAlert('FAILURE', 'You must provide at least 2 ingredients.');
            break;

          // Not enough preparation steps.
          case 'MULTIPLE_PREPARATION_STEPS_NEEDED':
            this.setAlert('FAILURE', 'At least 2 preparation instructions are needed.');
            break;

          // Invalid token.
          case 'INVALID_TOKEN':
            this.setAlert('FAILURE', 'Your session is invalid. Please log in again.');
            break;

          // Default action: do nothing.
          default:
            break;
        }
      });
  }

  // Method to handle form reset.
  handleFormReset() {
    // Clear fields.
    this.setState({
      title: '',      // Recipe title.
      tagline: '',    // Recipe tagline.
      ingredients: [],  // Array of recipe ingredients.
      instructions: [], // Array of recipe preparation instructions.
    });
  }

  // Method to update the ingredient at a given index in the array.
  updateIngredient(e, idx) {
    // Get a copy of ingredients array.
    const ingredients = this.state.ingredients.slice();

    // Update the ingredient at the specified index with the new value.
    ingredients[idx] = e.target.value;

    // Update list of ingredients with the updated copy.
    this.setState({ ingredients });
  }

  // Method to update the ingredient at a given index in the array.
  updateInstruction(e, idx) {
    // Get a copy of ingredients array.
    const instructions = this.state.instructions.slice();

    // Update the ingredient at the specified index with the new value.
    instructions[idx] = e.target.value;

    // Update list of ingredients with the updated copy.
    this.setState({ instructions });
  }

  // Method to add/remove ingredients/instructions input boxes.
  addRemoveFields(e, action, stateKey) {
    // Deconstruct ingredients and instructions array.
    const { ingredients, instructions } = this.state;

    /*
     * stateKey is either 'ingredients' or 'instructions'
     *
     * Select the correct array.
     */
    let arrayItems = stateKey === 'ingredients' ? ingredients : instructions;

    // Create a copy of that array.
    arrayItems = arrayItems.slice();

    // Mutate copy of array.
    switch (action) {
      // Different actions each case.
      case 'ADD':
        // Add new blank string to the array.
        arrayItems.push('');
        break;

      case 'REMOVE':
        // Remove last element.
        arrayItems = arrayItems.slice(0, arrayItems.length - 1);
        break;

      default:
        break;
    }

    // If we are changing ingredients, replace state copy with the new one.
    if (stateKey === 'ingredients') {
      return this.setState({ ingredients: arrayItems });
    }

    // If we are changing instructions, replace state copy with the new one.
    return this.setState({ instructions: arrayItems });
  }

  // Component render.
  render() {
    // Dynamically render <input/> for each ingredient.
    const renderIngredients = this.state.ingredients.map((val, idx) => (
      <input
        className="input"
        key={`recipe-ingredient-${idx}`}
        type="text"
        value={this.state.ingredients[idx]}
        onChange={(e) => { this.updateIngredient(e, idx); }}
      />
    ));

    // Dynamically render <input/> for each instruction.
    const renderInstructions = this.state.instructions.map((val, idx) => (
      <textarea
        className="input-textarea"
        key={`recipe-instruction-${idx}`}
        type="text"
        value={this.state.instructions[idx]}
        onChange={(e) => { this.updateInstruction(e, idx); }}
        rows="2"
      />
    ));

    return (
      <div className="box shadow">
        <AlertBox alert={this.state.alert} handleClose={this.clearAlert} />
        <form type="POST" className="form-newrecipe-widget" onSubmit={this.handleFormSubmit}>

          <div className="input-group">
            <div className="text-center">Recipe Title:</div>
            <input
              className="input"
              type="text"
              onChange={e => this.setState({ title: e.target.value })}
              value={this.state.title}
            />
          </div>

          <div className="input-group">
            <div className="text-center">Recipe Tagline:</div>
            <input
              className="input"
              type="text"
              id="recipe-tagline"
              onChange={e => this.setState({ tagline: e.target.value })}
              value={this.state.tagline}
            />
          </div>

          <div className="input-group ingredients-group">
            <div className="text-center">Ingredients:</div>
            <PlusMinus
              handleClick={this.addRemoveFields}
              stateKey="ingredients"
            />
            <div className="ingredients-list">{renderIngredients}</div>
          </div>

          <div className="input-group instructions-group">
            <div className="text-center">Preparation Instructions:</div>
            <PlusMinus
              handleClick={this.addRemoveFields}
              stateKey="instructions"
            />
            <div className="ingredients-list">{renderInstructions}</div>
          </div>

          <button className="btn btn-submit width-100" type="submit" value="submit">
            Save Recipe
          </button>

        </form>
      </div>
    );
  }
}

// Maps state to props.
const mapStateToProps = state => ({ token: state.token });

// Allow component access to Redux store.
export default connect(mapStateToProps, null)(withRouter(NewRecipeWidget));

// Prop validation.
NewRecipeWidget.propTypes = {
  token: React.PropTypes.string,
};
