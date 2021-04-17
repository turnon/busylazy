<template>
    <div id="app">
        <div>
            <span v-for="l in layout.options" :key="l" @click="changeLayout(l)">
                {{ l }}
            </span>
        </div>

        <div v-if="showCalendars">
            <div v-for="vIdx of calerdarsLayout.vertical" :key="vIdx">
                <div
                    v-for="hIdx of calerdarsLayout.horizon"
                    :key="hIdx"
                    :style="{
                        width: calendarWidth,
                        padding: '1%',
                        display: 'inline-block',
                    }"
                >
                    <Cal
                        :events="events"
                        :seq="incrCalSeq()"
                        :cmd="cmd"
                        @calEvent="handleCalEvent"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Cal from "./components/Cal.vue"
import { ipcRenderer } from "electron"

function eventId(e) {
    return `${e.start}|${e.title}`
}

function scheduleToEvents(schedule) {
    return schedule.map((e) => {
        return {
            id: eventId(e),
            title: e.title,
            start: e.start,
            end: e.end,
        }
    })
}

function dateStr(d) {
    let m = d.getMonth() + 1
    m = m < 10 ? `0${m}` : `${m}`
    return `${d.getFullYear()}-${m}-01`
}

function generateDates(firstDate, times) {
    let dates = [new Date(firstDate)]
    while (times > 0) {
        let lastDate = dates[dates.length - 1]
        if (lastDate.getMonth() == 11) {
            lastDate = new Date(lastDate.getFullYear() + 1, 0, 1)
        } else {
            lastDate = new Date(
                lastDate.getFullYear(),
                lastDate.getMonth() + 1,
                1
            )
        }
        dates.push(lastDate)
        times = times - 1
    }
    dates = dates.map((d) => {
        return dateStr(d)
    })
    return dates
}

let calSeq = 0

let calEventHandler = (function() {
    return {
        navDate(arg) {
            if (arg.dir) {
                let firstDate = new Date(this.dates[0])
                if (arg.dir === "prev") {
                    firstDate.setMonth(firstDate.getMonth() - 1)
                } else if (arg.dir === "next") {
                    firstDate.setMonth(firstDate.getMonth() + 1)
                } else {
                    firstDate = firstDate + 1
                }
                this.dates = generateDates(firstDate, this.dates.length)
                this.cmd = {
                    action: "changeDate",
                    args: this.dates,
                }
                return
            }
        },
    }
})()

export default {
    name: "App",
    components: {
        Cal,
    },
    data() {
        return {
            showCalendars: false,
            calerdarsLayout: {
                horizon: 1,
                vertical: 1,
            },
            dates: [dateStr(new Date())],
            currentHeight: 0,
            layout: {
                options: ["1x1", "2x1", "3x1", "1x2", "2x2", "3x2"],
                current: "1x1",
            },
            cmd: { action: null, args: null },
            calendarWidth: "90%",
            events: [],
        }
    },
    mounted() {
        // 读取数据库
        const readDb = "readDb"
        ipcRenderer.send(readDb, null)
        ipcRenderer.on(readDb, (_, jsonData) => {
            console.log(`${new Date()}: Fetched jsonData`)
            this.events = scheduleToEvents(jsonData.schedule)
            this.cmd = { action: "changeDate", args: this.dates }
            this.reloadCals()
        })

        // 监听窗口高度
        const checkHeight = "checkHeight"
        ;(function loopCheckHeight() {
            setTimeout(loopCheckHeight, 1000)
            ipcRenderer.send(checkHeight, null)
        })()
        ipcRenderer.on(checkHeight, (_, newHeight) => {
            if (this.currentHeight === newHeight) {
                return
            }
            console.log(`${new Date()}: new height ${newHeight}`)

            this.currentHeight = newHeight
            this.cmd = {
                action: "changeHeight",
                args: this.figureOutCalsHeight(),
            }
        })
    },
    methods: {
        figureOutCalsHeight() {
            let verticalCount = this.layout.current.split("x")[1]
            return ((this.currentHeight - 20) * 0.88) / verticalCount
        },
        changeLayout(layoutStr) {
            this.reloadCals(() => {
                this.layout.current = layoutStr
                let layoutArr = layoutStr.split("x"),
                    h = parseInt(layoutArr[0]),
                    v = parseInt(layoutArr[1])
                this.calerdarsLayout.horizon = h
                this.calerdarsLayout.vertical = v
                this.calendarWidth = `${90 / h}%`
                this.dates = generateDates(this.dates[0], h * v)
                this.cmd = [
                    {
                        action: "changeDate",
                        args: this.dates,
                    },
                    {
                        action: "changeHeight",
                        args: this.figureOutCalsHeight(),
                    },
                ]
            })
        },
        handleCalEvent(event) {
            calSeq = 0
            calEventHandler[event.name].call(this, event.arg)
        },
        incrCalSeq() {
            return calSeq++
        },
        reloadCals(fn) {
            this.showCalendars = false
            calSeq = 0
            fn && fn()
            this.$nextTick(() => {
                this.showCalendars = true
            })
        },
    },
}
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
}
</style>
