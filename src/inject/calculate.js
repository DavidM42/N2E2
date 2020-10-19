const abrechnungStartingDay = 19;

const parseMinutes = (durationRawText) => {
  const hours = parseInt(durationRawText.split('Std.')[0].trim(), 10);
  const minutes = parseInt(durationRawText.split('Std.')[1].trim().split('Min.')[0].trim(), 10);
  return hours * 60 + minutes;
};

const minutesToHuman = (minutes) => {
  return Math.floor(minutes / 60) + ' Stunden ' + minutes % 60 + ' Minuten';
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

window.addEventListener('load', () => {
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
    const durationRawText = clockIcon.parentElement.innerText;
    const durationMinutesWork = parseMinutes(durationRawText);

    const coffeIcon = h.parentElement.querySelector('.fa-coffee');
    const pauseDurationRawText = coffeIcon.parentElement.innerText;
    const durationMinutesPause = parseMinutes(pauseDurationRawText);

    if (!timeMinutesByWeek[dt.getWeek()]) {
      timeMinutesByWeek[dt.getWeek()] = {
        work: 0,
        pause: 0
      };
    }

    timeMinutesByWeek[dt.getWeek()].work += durationMinutesWork;
    timeMinutesByWeek[dt.getWeek()].pause += durationMinutesPause;

    if (dt > startDateCurrentMonth) {
      minutesSinceMonthStarted.work += durationMinutesWork;
      minutesSinceMonthStarted.pause += durationMinutesPause;
    } else if(dt < startDateCurrentMonth && dt > startDatePreviousMonth) {
      minutesSincePreviousMonthStarted.work += durationMinutesWork;
      minutesSincePreviousMonthStarted.pause += durationMinutesPause;
    }
  }
  // console.log(timeMinutesByWeek);

  const htmlInfoString = `
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="card-block p-35 clearfix" id="infoContent">
          
          </div>
        </div>
      </div>
    </div>
  `;
  const infoElement = document.createElement('div');
  infoElement.innerHTML = htmlInfoString;

  const counterIcon = document.querySelector('.counter-icon');
  const counterRow = counterIcon.parentElement.parentElement.parentElement.parentElement;
  counterRow.parentElement.insertBefore(infoElement, counterRow);

  const title = 'Worked: ';
  const thisWeekText = 'This week: ' + minutesToHuman(timeMinutesByWeek[thisWeek].work);
  const lastWeekText = 'Tast week: ' + minutesToHuman(timeMinutesByWeek[thisWeek-1].work);
  const thisMonthtext = 'Abrechnungs month: ' + minutesToHuman(minutesSinceMonthStarted.work);
  const lastMonthText = 'Previous abrechnungs month: ' + minutesToHuman(minutesSincePreviousMonthStarted.work);
  const textArr = [title, thisWeekText, lastWeekText, thisMonthtext, lastMonthText];

  infoElement.querySelector('#infoContent').innerText = textArr.join('\n');
});