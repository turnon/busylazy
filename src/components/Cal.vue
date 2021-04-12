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
        initDate: {
            type: String,
            default: "2990-01-01",
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

    mounted() {
        console.log(this.initDate, 123)
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
    },

    // watch: {
    //     initDate: (val) => {
    //         console.log(val)
    //         this.getApi.gotoDate(val)
    //     },
    // },
}
</script>

<style scoped lang="scss">
.year-month {
    display: inline-block;
}

.nav {
    float: right;
    display: inline-block;

    span:hover {
        cursor: pointer;
    }
}
</style>
