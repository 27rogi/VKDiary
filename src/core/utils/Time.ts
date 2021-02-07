import moment, { Moment } from 'moment';

export default {
    getTinyTime(time: string) {
        return moment(time, 'HH:mm').format('HH:mm');
    },
    isEvenWeek(date: Moment) {
        return Math.abs(date.week() - moment('01 09', 'DD MM').week()) % 2 === 1;
    },
};
