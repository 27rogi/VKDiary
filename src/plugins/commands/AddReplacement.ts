import moment from 'moment';
import { MongoError } from 'mongodb';
import { MessageContext } from 'vk-io';
import { BaseCommand } from '../../core/classes/BaseCommand';
import replacements from '../../core/database/models/replacements';
import schedules from '../../core/database/models/schedules';
import { ISubjects } from '../../core/database/models/subjects';
import subjectTimes from '../../core/database/models/subjectTimes';
import Broadcaster from '../../core/utils/Broadcaster';
import Logger from '../../core/utils/Logger';
import Search from '../../core/utils/Search';
import Schedules from '../Schedules';

export default class extends BaseCommand {
    constructor() {
        super();
        this.commandData = {
            command: 'добавитьзамену',
            permissionLevel: 99,
            local: true,
        };
    }

    async execute(context: MessageContext, args: string[], next: any) {
        if (args.length > 2) {
            if ((await schedules.findOne({ scheduleId: Number(args[0]) }).exec()) === null) {
                return context.reply(`Расписания с таким номером не существует!`);
            }

            const subject: ISubjects = await Search.findSubject(args[1]);
            if (subject === null) return context.reply('Предмет с таким номером или именем не найден в базе!');

            const date = moment(args[2], 'DD.MM.YYYY');

            if (Number.isNaN(date.day())) {
                return context.reply(`Ошибка в указании даты!`);
            }

            const replacement = new replacements({
                replacedSchedule: args[0],
                replacingSubject: subject.subjectId,
                date: date.format('DD.MM.YYYY'),
            });

            if (args[3] !== undefined) replacement.location = Number(args[3]);
            if (args[4] !== undefined) replacement.teacher = args[4];

            replacement.save(async (err: MongoError, item) => {
                if (err) {
                    if (err.code === 11000) {
                        return context.reply('Замена с таким айди уже существует в базе.');
                    }
                    Logger.error(err);
                    return context.reply('Произошла ошибка при добавлении, обратитесь к администратору!');
                }

                await new Schedules().reload();

                const subject = (await item.populate('payload.subject').execPopulate()).payload.subject;
                const schedule = (await item.populate('payload.schedule').execPopulate()).payload.schedule;
                const subjectTime = await subjectTimes.findOne({ timeId: schedule.subjectTime }).exec();
                const date = moment(item.date, 'DD.MM.YYYY');

                await Broadcaster.broadcastMessage([`❗ На ${date.format('DD MMMM')} в ${subjectTime.timeStarts} назначена замена предметом ${subject.name}`].join('\n'));

                return context.reply('Замена добавлена в базу данных!');
            });
        } else {
            return context.reply('Отсутствуют аргументы, используйте /добавитьзамену <номер_расписания> <номер_заменяющего_предмета> <дата_замены> <номер_кабинета?> <учитель?> ');
        }
    }
}
