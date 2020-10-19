
// remove uneeded weather widget
document.getElementById('widgetWeather').remove();

// live refresh time worked today with minutes not just rounded hours
const refreshSinceStarted = () => {
  const startedAgoElement = document.querySelector('.counter').querySelector('.vertical-align-middle');
  const startTimeTextElement = document.querySelector('.counter-number');
  
  const now = new Date();
  const started = new Date();
  started.setHours(startTimeTextElement.innerText.split(':')[0]);
  started.setMinutes(startTimeTextElement.innerText.split(':')[1]);

  const workedMinusMs = now  - started;
  const workedMinutesTotal = Math.floor(workedMinusMs / 1000 / 60);
  startedAgoElement.innerText = 'Beginn vor ' + Math.floor(workedMinutesTotal / 60) + ' Stunden ' + (workedMinutesTotal % 60) + ' Minuten';

  setTimeout(refreshSinceStarted, 20000);
};

refreshSinceStarted();