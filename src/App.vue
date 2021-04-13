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
            this.$nextTick(() => {
                this.showCalendars = true
            })
        }
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
