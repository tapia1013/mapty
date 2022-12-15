'use strict';

// // map global variable
// let map;
// let mapEvent;



class Workout {
  date = new Date();
  // use current date to use as id and use the last 10 numbers from the date
  id = (Date.now() + '').slice(-10)

  constructor(coords, distance, duration) {
    this.coords = coords;     // [lat,lng] array
    this.distance = distance; // in km
    this.duration = duration; // in min

  }


  _setDescription() {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
  }
}



class Running extends Workout {
  type = 'running'

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    // call calcPace in constructor
    this.calcPace();
    this._setDescription();
  }

  // Calculate pace
  calcPace() {
    // min/kim
    this.pace = this.duration / this.distance;
    return this.pace
  }
}



class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    // this.type = 'cycling'
    this.calcSpeed()
    this._setDescription();
  }

  calcSpeed() {
    // km/hr
    this.speed = this.distance / (this.duration / 60)

    return this.speed
  }
}


const run1 = new Running([39, -12], 5.2, 24, 178);
const cycling1 = new Running([39, -12], 27, 95, 523);
// console.log(run1, cycling1);




//////////////////////////////////////////////////////////
// APPLICATION ARCHITECTURE

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


class App {
  // # means private instance properties
  #map;
  #mapEvent;
  #workouts = [];

  // constructor get automatically called when its loaded
  constructor() {
    this._getPosition();
    // listen to submit form
    form.addEventListener('submit', this._newWorkout.bind(this))
    inputType.addEventListener('change', this._toggleElevationField)
  }


  _getPosition() {
    // Check if geolocation exists
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
        alert('Could not get your position');
      })
    };

  }


  _loadMap(position) {

    // take coord out of object
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    // console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];

    // console.log(this);
    // Leaflet map api.... #map is like a properrty that is now defined on the object itself
    this.#map = L.map('map').setView(coords, 13);
    // console.log(map);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);



    // Handling clicks on map
    this.#map.on('click', this._showForm.bind(this))

  }


  _showForm(mapE) {
    this.#mapEvent = mapE;
    // When click show form
    form.classList.remove('hidden');
    inputDistance.focus();
  }


  _hideForm() {
    // Empty inputs
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';

    // hide form first
    form.style.display = 'none';

    form.classList.add('hidden');

    setTimeout(() => form.style.display = 'grid', 1000);
  }



  // form toggle
  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form_row--hidden')
    inputCadence.closest('.form__row').classList.toggle('form_row--hidden')
  }



  // creates a new workout
  _newWorkout(e) {
    // helper function for if() with loop
    const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp))
    // Helper function to check if no negative only on cycling
    const allPositive = (...inputs) => inputs.every(inp => inp > 0)


    e.preventDefault();
    // console.log(this);


    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // If workout running, create running object
    if (type === 'running') {
      // if its running get cadence
      const cadence = +inputCadence.value
      // check if data is valid, gaurd clause check for opp of what we og intered in if true we return 
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        !validInputs(distance, duration, cadence) || !allPositive(distance, duration, cadence)
      ) {
        return alert('Inputs have to be positive numbers!');
      }

      workout = new Running([lat, lng], distance, duration, cadence)

    }

    // If workout cycling, create cycling object
    if (type === 'cycling') {
      // if its running get cadence
      const elevation = +inputElevation.value

      // check if data is valid, gaurd clause check for opp of what we og intered in if true we return, we dont include elevation cause it can be negative
      if (!validInputs(distance, duration, elevation) || !allPositive(distance, duration)) {
        return alert('Inputs have to be positive numbers!')
      }

      workout = new Cycling([lat, lng], distance, duration, elevation)
    }



    // Add new object to workout array
    this.#workouts.push(workout);
    console.log(workout);


    // Render workout on map as a marker
    this._renderWorkoutMarker(workout)



    // Render workout on list
    this._renderWorkout(workout)



    // Hide form + clear input fields after submiting
    this._hideForm();


  }




  _renderWorkoutMarker(workout) {
    // display marker
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: `${workout.type}-popup`,
      }))
      .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`)
      .openPopup();
  }


  // DOM manipulation to insert to DOM when new workout
  _renderWorkout(workout) {
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
    `;

    if (workout.type === 'running')
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
      `;


    if (workout.type === 'cycling')
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
      </li> 
      `;



    // inserts html as sibling after form
    form.insertAdjacentHTML('afterend', html)

  }
}




// instantiate app so we can call it
const app = new App();

// call the app with position prop to get location
// app._getPosition();


