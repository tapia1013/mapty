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









