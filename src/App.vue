<template>
    <div id="app">
        <Cal :events="events" v-if="readEvents" />
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
