;(function () {
  const { ipcRenderer, remote } = require('electron')
  const prompt = require('electron-prompt')

  //数据库交互
  let db = (function () {
    let json = null

    function readDb(callback) {
      const readDb = 'readDb'
      ipcRenderer.send(readDb, null)
      ipcRenderer.on(readDb, (event, jsonData) => {
        json = jsonData
        callback(JSON.parse(JSON.stringify(jsonData)))
      })
    }

    function writeDb() {
      json.updated = new Date()
      ipcRenderer.send('writeDb', json)
    }

    function addEvent(e) {
      json.schedule.push({ title: e.title, start: e.startStr || e.start, end: e.endStr || e.end })
      writeDb()
    }

    function removeEvent(e) {
      json.schedule = json.schedule.filter((oldE) => {
        return !(oldE.title === e.title && oldE.start === e.startStr)
      })
      writeDb()
    }

    function addPending(e) {
      json.pending.push({ title: e.title })
      writeDb()
    }

    function removePending(e) {
      json.pending = json.pending.filter((oldE) => {
        return oldE.title !== e.title
      })
      writeDb()
    }

    return {
      readDb: readDb,
      addEvent: addEvent,
      removeEvent: removeEvent,
      addPending: addPending,
      removePending: removePending,
    }
  })()

  function eventId(e) {
    return `${e.start}|${e.title}`
  }

  // 渲染日期
  function datesSet(info) {
    let now = calendar.getDate(),
      month = now.getMonth() + 1,
      monthStr = month < 10 ? '0' + month : month
    document.getElementById('year').innerText = now.getFullYear()
    document.getElementById('month').innerText = monthStr
  }

  // 创建日历
  let calendar
  function createCalendar(jsonData) {
    // 拼接对话框中的日期
    function convertLabel(info) {
      let deadline = new Date(info.end.getTime() - 24 * 60 * 60 * 1000)
      if (info.start.toString() === deadline.toString()) {
        return info.startStr
      }
      return `${info.startStr} ~ ${deadline.getFullYear()}-${deadline.getMonth() + 1}-${deadline.getDate()}`
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
            title: eventName,
            start: info.startStr,
            end: info.endStr,
          }
          db.addEvent(event)
          event.id = eventId(event)
          calendar.addEvent(event)
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
            db.removeEvent(event)
          }
        })
        .catch(console.error)
    }

    // 移动、伸缩事情后回调
    function moveEvent(info) {
      db.removeEvent(info.oldEvent)
      db.addEvent(info.event)
    }

    let buttons = ['prev', 'today', 'next'],
      events = jsonData.schedule.map((e) => {
        return {
          id: eventId(e),
          title: e.title,
          start: e.start,
          end: e.end,
        }
      })

    calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
      initialView: 'dayGridMonth',
      headerToolbar: false,
      contentHeight: 780,
      dayMaxEvents: true,
      events: events,
      selectable: true,
      editable: true,
      droppable: true,
      eventResizableFromStart: true,
      eventDurationEditable: true,
      eventResize: moveEvent,
      eventDrop: moveEvent,
      eventClick: clickEvent,
      select: selectDate,
      datesSet: datesSet,
    })
    calendar.render()
    // 跳转日期
    buttons.forEach((action) => {
      document.getElementById('go' + action).addEventListener('click', () => {
        console.log(action)
        calendar[action]()
      })
    })
  }

  // 创建暂存区
  let pending
  function createPending(jsonData) {
    const start = '2999-01-01',
      end = '2999-01-02'

    let events = jsonData.pending.map((e) => {
      return {
        title: e.title,
        start: start,
        end: end,
      }
    })

    // 选定日期后回调
    function selectDate(info) {
      prompt({
        title: 'add pending',
        type: 'input',
        height: 200,
      })
        .then((eventName) => {
          if (eventName === null || eventName === '' || eventName === undefined) {
            return
          }
          let event = {
            title: eventName,
            start: info.startStr,
            end: info.endStr,
          }
          db.addPending(event)
          event.id = eventId(event)
          pending.addEvent(event)
        })
        .catch(console.error)
    }

    // 选定事情后回调
    function clickEvent(info) {
      let event = info.event
      prompt({
        title: 'remove pending',
        label: event.title,
        type: 'input',
        height: 200,
      })
        .then((confirmation) => {
          if (confirmation === 'y') {
            event.remove()
            db.removePending(event)
          }
        })
        .catch(console.error)
    }

    pending = new FullCalendar.Calendar(document.getElementById('pending'), {
      initialView: 'dayGrid',
      headerToolbar: false,
      dayHeaders: false,
      contentHeight: 480,
      dayMaxEvents: true,
      dayCount: 1,
      events: events,
      selectable: true,
      editable: true,
      droppable: true,
      select: selectDate,
      eventClick: clickEvent,
    })
    pending.render()
    pending.gotoDate(start)
  }

  // 初始化页面
  document.addEventListener('DOMContentLoaded', function () {
    db.readDb((jsonData) => {
      createCalendar(jsonData)
      createPending(jsonData)
    })
  })
})()
