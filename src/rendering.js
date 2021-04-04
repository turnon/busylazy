(function () {
  const { ipcRenderer, remote } = require('electron')
  const prompt = require('electron-prompt');

  // 拼接对话框中的日期
  function convertLabel(info) {
    let deadline = new Date(info.end.getTime() - (24 * 60 * 60 * 1000));
    if (info.start.toString() === deadline.toString()) {
      return info.startStr
    } else {
      return info.startStr + " ~ " + deadline.getFullYear() + "-" + (deadline.getMonth() + 1) + "-" + deadline.getDate()
    }
  }

  // 选定日期后回调
  function selectDate(info) {
    let label = convertLabel(info)

    prompt({
      title: "add event",
      label: label,
      type: 'input',
      height: 200
    }).then((evenName) => {
      if (evenName === null || evenName === '' || evenName === undefined) {
        return
      }
      calendar.addEvent({
        id: label + " : " + evenName,
        title: evenName,
        start: info.startStr,
        end: info.endStr,
      })
    }).catch(console.error);
  }

  // 选定事情后回调
  function clickEvent(info) {
    prompt({
      title: "remove event",
      label: info.event.id,
      type: 'input',
      height: 200
    }).then((confirmation) => {
      if (confirmation === 'y') {
        info.event.remove()
      }
    }).catch(console.error);
  }

  // 创建日历
  let calendar;
  document.addEventListener('DOMContentLoaded', function () {
    calendar = new FullCalendar.Calendar(
      document.getElementById('calendar'),
      {
        initialView: 'dayGridMonth',
        selectable: true,
        eventClick: clickEvent,
        select: selectDate
      }
    );
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
})()
