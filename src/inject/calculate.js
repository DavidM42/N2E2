const abrechnungStartingDay = 19;

// downloaded from font awesome
// same as used by original page
const fasClockSvg = '<svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="clock" class="svg-inline--fa fa-clock fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm61.8-104.4l-84.9-61.7c-3.1-2.3-4.9-5.9-4.9-9.7V116c0-6.6 5.4-12 12-12h32c6.6 0 12 5.4 12 12v141.7l66.8 48.6c5.4 3.9 6.5 11.4 2.6 16.8L334.6 349c-3.9 5.3-11.4 6.5-16.8 2.6z"></path></svg>';
const fasCoffeeSvg = '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="coffee" class="svg-inline--fa fa-coffee fa-w-20" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M192 384h192c53 0 96-43 96-96h32c70.6 0 128-57.4 128-128S582.6 32 512 32H120c-13.3 0-24 10.7-24 24v232c0 53 43 96 96 96zM512 96c35.3 0 64 28.7 64 64s-28.7 64-64 64h-32V96h32zm47.7 384H48.3c-47.6 0-61-64-36-64h583.3c25 0 11.8 64-35.9 64z"></path></svg>';

const parseMinutes = (durationRawText) => {
  const hours = parseInt(durationRawText.split('Std.')[0].trim(), 10);
  const minutes = parseInt(durationRawText.split('Std.')[1].trim().split('Min.')[0].trim(), 10);
  return hours * 60 + minutes;
};

const minutesToHuman = (minutesRaw) => {
  const hours = Math.floor(minutesRaw / 60);
  const minutes = minutesRaw % 60;
  const hourText = hours > 1 ? 'Stunden' : 'Stunde';
  const minuteText = minutes > 1 ? 'Minuten' : 'Minute';

  return `${hours} ${hourText} ${minutes} ${minuteText}`;
};

const minutesToDecimalHours = (minutes) => {
  return minutes / 60;
};

const today = Date.today();
// testing option
// const today = Date.parse('yesterday');
const currentYear = Date.today().getFullYear();
const thisWeek = today.getWeek();

let startDateCurrentMonth = new Date(currentYear, today.getMonth(), abrechnungStartingDay);
let startDatePreviousMonth = new Date(currentYear, today.getMonth()-1, abrechnungStartingDay);
// if it's before 19th then use last months 19th as starting point
// if (Date.compare(startDateCurrentMonth,today) === 1) {
if (startDateCurrentMonth > today) {
  startDateCurrentMonth = new Date(currentYear, today.getMonth() -1, abrechnungStartingDay);
  startDatePreviousMonth = new Date(currentYear, today.getMonth()-2, abrechnungStartingDay);
}

/**
 * Generic element change subscription helper
 * @param {HTMLElement} selector HTMl Element to observe
 * @param {Function} callback Callback to execute on change
 */
function onElementChange(selector, callback) {
  new MutationObserver((mutationsList, observer) => {
    callback();
  })
  .observe(selector, {
    subtree: true,
    childList: true
  });
}


/**
 * Main function to do the work
 */
const calculate = () => {
  const headlines = document.querySelectorAll('.headline ');

  const timeMinutesByWeek = {};
  timeMinutesByWeek[thisWeek] = {work: 0, pause: 0};

  const minutesSinceMonthStarted = {
    work: 0,
    pause: 0
  };
  const minutesSincePreviousMonthStarted = {
    work: 0,
    pause: 0
  };

  for (let h of headlines) {

    const rawDate = h.querySelector('div').innerText.split('\n')[1];
    const parts = (rawDate + currentYear ).split('.');
    const dt = new Date(parseInt(parts[2], 10),
                      parseInt(parts[1], 10) - 1,
                      parseInt(parts[0], 10));

    const clockIcon = h.parentElement.querySelector('.fa-clock');
    if (!clockIcon) {
      // No time worked in this entry so just skip
      continue;
    }
    const durationRawText = clockIcon.parentElement.innerText;
    const durationMinutesWork = parseMinutes(durationRawText);

    const coffeIcon = h.parentElement.querySelector('.fa-coffee');
    let durationMinutesPause = 0;
    if (coffeIcon) {
      const pauseDurationRawText = coffeIcon.parentElement.innerText;
      durationMinutesPause = parseMinutes(pauseDurationRawText);
    }

    if (!timeMinutesByWeek[dt.getWeek()]) {
      timeMinutesByWeek[dt.getWeek()] = {
        work: 0,
        pause: 0
      };
    }

    timeMinutesByWeek[dt.getWeek()].work += durationMinutesWork;
    timeMinutesByWeek[dt.getWeek()].pause += durationMinutesPause;

    if (dt >= startDateCurrentMonth) {
      minutesSinceMonthStarted.work += durationMinutesWork;
      minutesSinceMonthStarted.pause += durationMinutesPause;
    } else if(dt < startDateCurrentMonth && dt >= startDatePreviousMonth) {
      minutesSincePreviousMonthStarted.work += durationMinutesWork;
      minutesSincePreviousMonthStarted.pause += durationMinutesPause;
    }
  }
  // console.log(timeMinutesByWeek);

  const htmlInfoString = `
    <div class="col-md-12">
      <div class="card">
        <div class="card-block p-35 clearfix" id="infoContent">
        
        </div>
      </div>
    </div>
  `;

  const previouseInfo = document.getElementById('e2n-calc-row');
  let infoElement = document.createElement('div');
  infoElement.id = 'e2n-calc-row';
  infoElement.classList.add('row');
  if (previouseInfo) {
    infoElement = previouseInfo;
  }
  infoElement.innerHTML = htmlInfoString;

  const counterIcon = document.querySelector('.counter-icon');
  const counterRow = counterIcon.parentElement.parentElement.parentElement.parentElement;
  counterRow.parentElement.insertBefore(infoElement, counterRow);

  const textArr = [];

  // const thisWeekText = 'Diese Woche: ' + minutesToHuman(timeMinutesByWeek[thisWeek].work);
  const thisWeekWork = minutesToHuman(timeMinutesByWeek[thisWeek].work);
  const thisWeekPause = minutesToHuman(timeMinutesByWeek[thisWeek].pause);
  const thisWeekText = `
      <span class="weekTitle">Diese Woche</span>
      <br>
      ${fasClockSvg} ${thisWeekWork} Arbeit 
      <br> 
      ${fasCoffeeSvg} ${thisWeekPause} Pause
  `;
  textArr.push(thisWeekText);

  if (timeMinutesByWeek[thisWeek-1]) {
    const lastWeekWork = minutesToHuman(timeMinutesByWeek[thisWeek-1].work);
    const lastWeekPause = minutesToHuman(timeMinutesByWeek[thisWeek-1].pause);
    const lastWeekText = `
      <span class="weekTitle">Letzte Woche</span>
      <br>
      ${fasClockSvg} ${lastWeekWork} Arbeit
      <br>
      ${fasCoffeeSvg} ${lastWeekPause} Pause
    `;
    textArr.push(lastWeekText);
  }
  // const thisMonthtext = 'Settlement month: ' + minutesToHuman(minutesSinceMonthStarted.work);
  // textArr.push(thisMonthtext);

  infoElement.querySelector('#infoContent').innerHTML = textArr.join('<br><br>');

  let noTime = !timeMinutesByWeek[thisWeek].work && !minutesSinceMonthStarted.work;
  if (!timeMinutesByWeek[thisWeek-1]) {
    noTime = true;
  }

  if (noTime) {
    infoElement.style.display = 'none';
  } else {
    infoElement.style.display = 'block';
  }
};

window.addEventListener('load', () => {
  const titleElement = document.querySelector('div.page-header');
  onElementChange(titleElement, calculate);

  calculate();
});