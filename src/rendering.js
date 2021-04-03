const { ipcRenderer } = require('electron')

document.addEventListener('DOMContentLoaded', function () {
  var calendarEl = document.getElementById('calendar');
  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth'
  });
  calendar.render();

  const readDb = 'readDb'
  let schedule = null
  ipcRenderer.send(readDb, null)
  ipcRenderer.on(readDb, (event, arg) => {
    console.log(arg)
    schedule = arg
  })

  window.document.querySelector('#logDate').addEventListener('click', () => {
    schedule['updated'] = new Date()
    ipcRenderer.send('writeDb', schedule)
  })
});