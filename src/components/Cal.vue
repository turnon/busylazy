<template>
    <div>
        <div>
            <div class="year-month">{{ yearStr }}/{{ monthStr }}</div>
            <div class="nav">
                <span @click="getApi().prev()">prev</span> /
                <span @click="getApi().today()">today</span> /
                <span @click="getApi().next()">next</span>
            </div>
        </div>

        <div>
            <FullCalendar ref="fullCalendar" :options="calendarOptions" />
        </div>
    </div>
</template>

<script>
import FullCalendar from "@fullcalendar/vue"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"

export default {
    components: {
        FullCalendar,
    },
    props: {
        seq: {
            type: Number,
            default: 0,
        },
        cmd: {
            type: Object,
            default: function() {
                return { action: null, args: null }
            },
        },
        events: {
            type: Array,
            default: function() {
                return [{ title: "11", start: "2021-04-21", end: "2021-04-22" }]
            },
        },
    },
    data() {
        return {
            yearStr: "2999",
            monthStr: "01",
            calendarOptions: {
                plugins: [dayGridPlugin, interactionPlugin],
                events: this.events,
                initialView: "dayGridMonth",
                aspectRatio: 1,
                headerToolbar: false,
                datesSet: this.datesSet,
            },
        }
    },

    methods: {
        datesSet: function() {
            let now = this.getApi().getDate(),
                month = now.getMonth() + 1,
                monthStr = month < 10 ? "0" + month : month
            this.yearStr = now.getFullYear()
            this.monthStr = monthStr
        },
        getApi: function() {
            return this.$refs.fullCalendar.getApi()
        },
        exeCmd: function() {
            console.log(1234, this.cmd, 5678)
            this.cmd.action && this.getApi().gotoDate(this.cmd.args[0])
        },
    },
    mounted() {
        this.exeCmd()
    },
    watch: {
        cmd() {
            this.exeCmd()
        },
    },
}
</script>

<style scoped lang="scss">
.year-month {
    display: inline-block;
}

.nav {
    float: right;
    display: inline;

    span:hover {
        cursor: pointer;
    }
}
</style>
