<template>
    <div>
        <div>
            <div class="year-month">{{ yearStr }}/{{ monthStr }}</div>

            <div class="nav">
                <span
                    v-for="action in ['prev', 'today', 'next']"
                    :key="action"
                    @click="
                        emitEvent({
                            name: 'navDate',
                            arg: { dir: action, seq: seq },
                        })
                    "
                >
                    {{ action }}
                </span>
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

let cmdExecutor = (function() {
    return {
        changeDate(dates) {
            this.getApi().gotoDate(dates[this.seq])
        },
    }
})()

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
        emitEvent: function(arg) {
            this.$emit("calEvent", arg)
        },
        exeCmd: function() {
            this.cmd.action &&
                cmdExecutor[this.cmd.action].call(this, this.cmd.args)
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
