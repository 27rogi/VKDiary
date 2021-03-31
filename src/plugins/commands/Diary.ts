import moment from 'moment';
import { MessageContext } from 'vk-io';
import { BaseCommand } from '../../core/classes/BaseCommand';
import replacements from '../../core/database/models/replacements';
import schedules from '../../core/database/models/schedules';
import subjects from '../../core/database/models/subjects';
import subjectTimes from '../../core/database/models/subjectTimes';
import Cleaner from '../../core/utils/Cleaner';
import Time from '../../core/utils/Time';

export default class extends BaseCommand {
    constructor() {
        super();
        this.commandData = {
            command: 'расписание',
            aliases: ['дневник', 'уроки', 'расп'],
            permissionLevel: 0,
            local: false,
        };
    }

    async execute(context: MessageContext, args: string[], next: any) {
        let dayOfMonth = moment().date();

        if (args[0] !== undefined) {
            if (Number(args[0]) > 31 || Number(args[0]) <= 0) {
                return context.reply('День может быть только от 1 до 31');
            }

            dayOfMonth = Number(args[0]);
        }

        let weekDay = moment(dayOfMonth, 'DD').day();
        let month = moment().add(1, 'month').month();

        if (dayOfMonth < 7 && !args[1]) {
            if (moment().endOf('month').date() >= 28) {
                month += 1;
                weekDay = moment(`${Number(args[0])} ${month}`, 'DD MM').day();
                await context.send(`Система определила, что вы пытаетесь посмотреть расписание на следующий месяц, если это не так, то укажите текущий самостоятельно используя /расп ${dayOfMonth} ${month - 1}`);
            }
        }

        if (args[1]) {
            if (Number(args[1]) <= 12 && Number(args[1]) > 0) {
                month = Number(args[1]);
                weekDay = moment(`${Number(args[0])} ${month}`, 'DD MM').day();
            } else {
                return context.reply('Месяц может быть только от 1 до 12');
            }
        }

        if (Number.isNaN(weekDay)) {
            return context.reply('В указанном месяце отсутствует число ' + args[0]);
        }

        const isWeekEven = Time.isEvenWeek(moment(`${dayOfMonth} ${month}`, 'DD MM'));

        const message: string[] = [`👌 Расписание уроков на ${moment(`${dayOfMonth} ${month}`, 'DD MM').format('dddd DD MMM')} [${isWeekEven ? 'четн.' : 'нечетн.'}]\n`];

        await Cleaner.cleanAll();

        const currentSchedule = await schedules.find({ subjectDay: weekDay, isEven: isWeekEven }).sort({ subjectTime: 1 }).exec();
        if (currentSchedule.length <= 0) {
            return context.reply('В данный день уроки отсутствуют 🙌😊');
        }

        for (const schedule of currentSchedule) {
            let subject = await subjects.findOne({ subjectId: schedule.subjectId }).exec();

            const replacement = await replacements
                .findOne({
                    replacedSchedule: schedule.scheduleId,
                    date: moment(`${dayOfMonth} ${month}`, 'DD MM').format('DD.MM.YYYY'),
                })
                .exec();

            if (replacement !== null) {
                subject = await subjects.findOne({ subjectId: replacement.replacingSubject }).exec();
                if (replacement.teacher) subject.teacher = replacement.teacher;
                if (replacement.location) subject.location = replacement.location;
            }

            const subjectTime = await subjectTimes.findOne({ timeId: schedule.subjectTime }).exec();
            message.push(`🔸 ${subject.name} (#${subject.subjectId}) ${replacement !== null ? '(Замена)' : ''}`, `⠀⌚ Урок идет с ${subjectTime.timeStarts} по ${subjectTime.timeEnds}`, `⠀🧭 Кабинет: ${subject.location}`, `⠀🧑‍ Преподаватель: ${subject.teacher}`, `⠀🔍 Номер расписания в базе: ${schedule.scheduleId}\n`);
        }

        await context.reply(message.join('\n'));
    }
}
