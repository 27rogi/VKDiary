import moment from 'moment';
import Time from '../core/utils/Time';

describe('(Время): проверка функций работы с временем', () => {
    test('неделя должна быть четной в дату 09.02.2021, но нечетной в дату 05.02.2021', () => {
        expect(Time.isEvenWeek(moment('09.02.2021', 'DD.MM.YYYY'))).toBe(true);
        expect(Time.isEvenWeek(moment('05.02.2021', 'DD.MM.YYYY'))).toBe(false);
    });
});
