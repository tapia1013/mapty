'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


// // map global variable
// let map;
// let mapEvent;



class Workout {
  date = new Date();
  // use current date to use as id and use the last 10 numbers from the date
  id = (new Date() + '').slice(-10)

  constructor(coords, distance, duration) {
    this.coords = coords;     // [lat,lng] array
    this.distance = distance; // in km
    this.duration = duration; // in min
  }
}



class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;

    // call calcPace in constructor
    this.calcPace();
  }

  // Calculate pace
  calcPace() {
    // min/kim
    this.pace = this.duration / this.distance;
    return this.pace
  }
}



class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed()
  }

  calcSpeed() {
    // km/hr
    this.speed = this.distance / (this.duration / 60)

    return this.speed
  }
}

const run1 = new Running([39, -12])

//////////////////////////////////////////////////////////
// APPLICATION ARCHITECTURE
class App {
  // # means private instance properties
  #map;
  #mapEvent;

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



  // form toggle
  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form_row--hidden')
    inputCadence.closest('.form__row').classList.toggle('form_row--hidden')
  }



  // creates a new workout
  _newWorkout(e) {
    e.preventDefault();

    // console.log(this);

    // Clear input fields after submiting
    inputDistance.value = inputDistance.value = inputCadence.value = inputElevation.value = '';

    const { lat, lng } = this.#mapEvent.latlng;

    // display marker
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup',
      }))
      .setPopupContent('Workout')
      .openPopup();
  }


}




// instantiate app so we can call it
const app = new App();

// call the app with position prop to get location
// app._getPosition();









