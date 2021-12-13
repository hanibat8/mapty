class Workout{
  date=new Date();
  constructor(coords,distance,duration){
    this.coords=coords;
    this.distance=distance;
    this.duration=duration;
  }

  _setDescription(){
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description=`${this.type[0].toUpperCase()}${this.type.slice(1)} on 
        ${months[this.date.getMonth()]}
        ${this.date.getDate()}`;
  }
}

class Running extends Workout{
  type='Running';
  constructor(coords,distance,duration,cadence){
    super(coords,distance,duration);
    this.cadence=cadence;
    this._setDescription();
    this._calcPace();
  }

  _calcPace(){
    //min/km
    this.pace=this.duration/this.distance;
    return this.pace;
  }
}

class Cycling extends Workout{
  type='Cycling';
  constructor(coords,distance,duration,elevationGain){
    super(coords,distance,duration);
    this.elevationGain=elevationGain;
    this._setDescription();
    this._calcSpeed();
  }

  _calcSpeed(){
    //km/hr
    this.speed=this.distance/(this.duration/60);
    return this.speed;
}
}

const sidebar=document.querySelector('.sidebar');
const form=document.querySelector('.form');
const formRow=document.querySelectorAll('.form__row');
const inputType=document.querySelector('.form__type');
const inputDistance=document.querySelector('.form__distance');
const inputDuration=document.querySelector('.form__duration');
const inputCadence=document.querySelector('.form__cadence');
const inputElevationGain=document.querySelector('.form__elevation_gain');
const labelCadence=document.querySelector('.form__row__label__cadence');
const labelElevationGain=document.querySelector('.form__row__label__elevation__gain');

class App{
  #map;
  #mapEvent;
  #workouts=[];
  
  constructor(){
    this._getPosition();

    form.addEventListener('submit',this._createNewWorkout.bind(this));
    inputType.addEventListener('change',this._updateForm.bind(this));
  }

  _getPosition(){
    if(!navigator.geolocation) {
      console.log('dadada');
    } 
    else {
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function(){
        alert('Cannot get position');
      });
    } 
  }

  _loadMap(position){
    const latitude  = position.coords.latitude;
    const longitude = position.coords.longitude;

    this.#map = L.map('map').setView([latitude, longitude], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

    this.#map.on('click',this._onMapClick.bind(this));

  }

  _updateForm(){
    if(inputType.value==='Running' && inputCadence.classList[2]==='hide'){
        this._removeHideClass(labelCadence,inputCadence);

        !(inputElevationGain.classList[2]==='hide')?this._addHideClass(labelElevationGain,inputElevationGain):'';
      }
    else if(inputType.value==='Cycling' && inputElevationGain.classList[2]==='hide'){
        this._removeHideClass(labelElevationGain,inputElevationGain);    

        !(inputCadence.classList[2]==='hide')?this._addHideClass(labelCadence,inputCadence):'';
    }
  }

  _removeHideClass(label,input){
    label.classList.remove('hide');
    input.classList.remove('hide');
  }

  _addHideClass(label,input){
    label.classList.add('hide');
    input.classList.add('hide');
  }

  _onMapClick(e){
    if(this._isFormInvisible(Array.from(form.classList)))
    return;
    
    form.classList.remove('form--hide');
    formRow.forEach((row)=>{
      row.classList.remove('hide');
    })

    this.#mapEvent=e;
    this._addMarkerOnClick(e.latlng.lat,e.latlng.lng);
  }

  _isFormInvisible(formClasslist){
    formClasslist.find(child=>child==='form--hide');
  }

  _addMarkerOnClick(lat,lng){
    let marker = L.marker([lat, lng]).addTo(this.#map);
  }


  _addPopup(coords,workout){
    let [lat,lng]=[coords];
    console.log(lat,lng)
    let popup = L.popup()
    .setLatLng(lat,lng)
    .setContent(workout.description)
    .openOn(this.#map);
  }

  _createNewWorkout(e){
    e.preventDefault();
    
    const isValid=(...inputs)=>inputs.every(inp=>Number.isFinite(inp));
    const isPositive=(...inputs)=>inputs.every(inp=>inp>0);
    
    const typeVal=inputType.value;
    const distanceVal=+inputDistance.value;
    const durationVal=+inputDuration.value;
    
    let newWorkout;

    console.log(this.#mapEvent.latlng);
    if(typeVal==='Running'){
      
      const cadenceVal=+inputCadence.value;
      
      if(!isValid(distanceVal,durationVal,cadenceVal) || !isPositive(distanceVal,durationVal,cadenceVal)){
        alert('Please input valid entries');
        return;
      }
      else{
        newWorkout=new Running(this.#mapEvent.latlng,distanceVal,durationVal,cadenceVal);
      }
    }
    else{
      
      const elevationGainVal=+inputElevationGain.value;
      
      if(!isValid(distanceVal,durationVal,elevationGainVal) || !isPositive(distanceVal,durationVal,elevationGainVal)){
        alert('Please input valid entries');
        return;
      }
      else{
        newWorkout=new Cycling(this.#mapEvent.latlng,distanceVal,durationVal,elevationGainVal);
      }
    }
      this.#workouts.push(newWorkout);
      console.log(newWorkout);
    
      form.style.display='none';
      form.classList.add('form--hide');
      setTimeout(()=>form.style.display='block',1000);

    let workoutHtml=`
      <div class="workout workout--${newWorkout.type==='Running'? 'running' :'cycling'}">
          <div class="workout__entry">
              ${newWorkout.description}
          </div>

          <div class="workout__details">
            <div class="workout__details__item workout__details__container workout__details__distance">
                <span class="workout__icon">
                  ${newWorkout.type==='Running'?'🏃‍♂️' : '🚴‍♀️'}
                </span>
                <span class="workout__details__distance__value"> ${newWorkout.distance}</span>
                <span class="workout__details__distance__unit">Km</span>
            </div>
            <div class="workout__details__time workout__details__item">
                <span class="workout__icon">
                  ⏱
                </span>
                <span class="workout__details__distance__value"> ${newWorkout.duration}</span>
                <span class="workout__details__distance__unit">min</span>
            </div>`;

            if(newWorkout.type==='Running')
              workoutHtml+=`
              <div class="workout__details__pace workout__details__item">
                <span class="workout__icon">
                  ⚡️
                </span>
                <span class="workout__details__pace__value">${newWorkout.pace}</span>
                <span class="workout__details__pace__unit">MINKM</span>
              </div>
              <div class="workout__details__cadence workout__details__item">
                <span class="workout__icon">
                  🦶🏼
                </span>
                <span class="workout__details__cadence__value">${newWorkout.cadence}</span>
                <span class="workout__details__cadence__unit">SPM</span>
              </div>
              </div>
            </div>`;

            if(newWorkout.type==='Cycling')
            workoutHtml+=`
            <div class="workout__details__speed workout__details__item">
              <span class="workout__icon">
                ⚡️
              </span>
              <span class="workout__details__speed__value">${newWorkout.speed}</span>
              <span class="workout__details__speed__unit">MINKM</span>
            </div>
            <div class="workout__details__elevation__gain workout__details__item">
              <span class="workout__icon">
                ⛰
              </span>
              <span class="workout__details__elevation__gain__value">${newWorkout.elevationGain}</span>
              <span class="workout__details__elevation__gain__unit">SPM</span>
            </div>
            </div>
            </div>`;
  
            console.log(newWorkout.coords);
      this._addPopup(newWorkout.coords,newWorkout.description);
      sidebar.insertAdjacentHTML('beforeend',workoutHtml)
  }
}

const app=new App();