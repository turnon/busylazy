; (function () {
  const { ipcRenderer, remote } = require('electron')
  const prompt = require('electron-prompt')
  const scheduleKeySep = ' | '

  //数据库交互
  let db = (function () {
    let json = null

    function readDb(callback) {
      const readDb = 'readDb'
      ipcRenderer.send(readDb, null)
      ipcRenderer.on(readDb, (event, jsonData) => {
        json = jsonData
        callback(unzipData(jsonData))
      })
    }

    function unzipData(jsonData) {
      jsonData = JSON.parse(JSON.stringify(jsonData))
      let schedule = jsonData.schedule,
        events = []
      for (let key in schedule) {
        let detail = schedule[key] || {},
          keyArr = key.split(scheduleKeySep),
          endAt = detail.end || keyArr[0]
        events.push({
          id: key,
          title: keyArr[1],
          start: keyArr[0],
          end: endAt,
        })
      }
      jsonData.events = events
      return jsonData
    }

    function writeDb() {
      json.updated = new Date()
      let schedule = {}
      Object.keys(json.schedule).sort().reverse().forEach((key) => {
        schedule[key] = json.schedule[key]
      })
      json.schedule = schedule
      ipcRenderer.send('writeDb', json)
    }

    function addEvent(e) {
      json.schedule[e.id] = { end: e.end }
      writeDb()
    }

    function removeEvent(eid) {
      delete json.schedule[eid]
      writeDb()
    }

    return {
      readDb: readDb,
      addEvent: addEvent,
      removeEvent: removeEvent,
    }
  })()

  // 拼接对话框中的日期
  function convertLabel(info) {
    let deadline = new Date(info.end.getTime() - 24 * 60 * 60 * 1000)
    if (info.start.toString() === deadline.toString()) {
      return info.startStr
    }
    return (
      info.startStr +
      ' ~ ' +
      deadline.getFullYear() +
      '-' +
      (deadline.getMonth() + 1) +
      '-' +
      deadline.getDate()
    )
  }

  // 选定日期后回调
  function selectDate(info) {
    let label = convertLabel(info)

    prompt({
      title: 'add event',
      label: label,
      type: 'input',
      height: 200,
    })
      .then((eventName) => {
        if (eventName === null || eventName === '' || eventName === undefined) {
          return
        }
        let event = {
          id: info.startStr + scheduleKeySep + eventName,
          title: eventName,
          start: info.startStr,
          end: info.endStr,
        }
        calendar.addEvent(event)
        db.addEvent(event)
      })
      .catch(console.error)
  }

  // 选定事情后回调
  function clickEvent(info) {
    let event = info.event
    prompt({
      title: 'remove event',
      label: convertLabel(event) + ' : ' + event.title,
      type: 'input',
      height: 200,
    })
      .then((confirmation) => {
        if (confirmation === 'y') {
          event.remove()
          db.removeEvent(event.id)
        }
      })
      .catch(console.error)
  }

  // 移动、伸缩事情后回调
  function moveEvent(info) {
    db.removeEvent(info.oldEvent.startStr + scheduleKeySep + info.oldEvent.title)
    db.addEvent({
      id: info.event.startStr + scheduleKeySep + info.event.title,
      title: info.event.title,
      start: info.event.startStr,
      end: info.event.endStr,
    })
  }

  // 创建日历
  let calendar
  document.addEventListener('DOMContentLoaded', function () {
    db.readDb((jsonData) => {
      calendar = new FullCalendar.Calendar(
        document.getElementById('calendar'),
        {
          initialView: 'dayGridMonth',
          contentHeight: 780,
          dayMaxEvents: true,
          events: jsonData.events,
          selectable: true,
          editable: true,
          eventResizableFromStart: true,
          eventDurationEditable: true,
          eventResize: moveEvent,
          eventDrop: moveEvent,
          eventClick: clickEvent,
          select: selectDate,
        }
      )
      calendar.render()
    })
  })
})()
