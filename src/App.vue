<template>
    <div id="app">
        <div>
            <span v-for="l in layoutOptions" :key="l" @click="changeLayout(l)">
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
                        :initialDate="getInitialDate()"
                        :events="events"
                        v-if="readEvents"
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

function dateStr(date) {
    date = date === undefined ? new Date() : date
    let month = date.getMonth() + 1,
        monthStr = month < 10 ? "0" + month : month
    console.log(`${date.getFullYear()}-${monthStr}-01`, 555)
    return `${date.getFullYear()}-${monthStr}-01`
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
    console.log(dates)
    return dates
}

let initialDateIdx = 0

export default {
    name: "App",
    components: {
        Cal,
    },
    data() {
        return {
            showCalendars: true,
            calerdarsLayout: {
                horizon: 1,
                vertical: 1,
            },
            layoutOptions: ["1x1", "2x1", "3x1", "1x2", "2x2", "3x2"],
            calendarWidth: "90%",
            initialDates: [dateStr()],
            // initialDateIdx: 0,
            readEvents: false,
            events: [],
        }
    },
    mounted() {
        const readDb = "readDb"
        ipcRenderer.send(readDb, null)
        ipcRenderer.on(readDb, (_, jsonData) => {
            console.log(`${new Date()}: Fetched jsonData`)
            this.events = scheduleToEvents(jsonData.schedule)
            this.readEvents = true
        })
    },
    methods: {
        changeLayout(layoutStr) {
            this.showCalendars = false
            let layoutArr = layoutStr.split("x")
            this.calerdarsLayout.horizon = parseInt(layoutArr[0])
            this.calerdarsLayout.vertical = parseInt(layoutArr[1])
            this.calendarWidth = `${90 / layoutArr[0]}%`
            this.initialDates = generateDates(
                this.initialDates[0],
                layoutArr[0] * layoutArr[1] - 1
            )
            initialDateIdx = 0
            this.$nextTick(() => {
                this.showCalendars = true
            })
        },
        getInitialDate() {
            let d = this.initialDates[initialDateIdx]
            initialDateIdx = initialDateIdx + 1

            // console.log(d, initialDateIdx, this.initialDates)
            return d
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
