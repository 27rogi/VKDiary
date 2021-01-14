import moment from 'moment';

export default {
    getHMMTime(time: string) {
        return moment(time, 'h:mm').format('h:mm');
    }
}
