import moment from 'moment';
import { MongoError } from 'mongodb';
import { MessageContext } from 'vk-io';
import { BaseCommand } from '../../core/classes/BaseCommand';
import replacements from '../../core/database/models/replacements';
import schedules from '../../core/database/models/schedules';
import subjects from '../../core/database/models/subjects';
import Logger from '../../core/utils/Logger';

export default class extends BaseCommand {
    constructor() {
        super();
        this.commandData = {
            command: 'добавитьзамену',
            permissionLevel: 99,
            local: true
        }
    }

    async execute(context: MessageContext, args: string[], next: any) {
        if (args.length > 2) {

            if (await schedules.findOne({ scheduleId: args[0] }).exec() === null) {
                return context.reply(`Расписания с таким номером не существует!`);
            }

            if (await subjects.findOne({ subjectId: args[1] }).exec() === null) {
                return context.reply(`Предмета с таким номером не существует!`);
            }

            const date = moment(args[2], 'DD.MM.YYYY');

            if (Number.isNaN(date.day())) {
                return context.reply(`Ошибка в указании даты!`);
            }

            const replacement = new replacements({
                replacedSchedule: args[0],
                replacingSubject: args[1],
                date: date.format('DD.MM.YYYY'),
            });

            replacement.save((err: MongoError) => {
                if (err) {
                    if (err.code === 11000) {
                        return context.reply('Замена с таким айди уже существует в базе.');
                    }
                    Logger.error(err);
                    return context.reply('Произошла ошибка при добавлении, обратитесь к администратору!');
                }
                return context.reply('Замена добавлена в базу данных!');
            });

        } else {
            return context.reply('Отсутствуют аргументы, используйте /добавитьзамену <намер_расписания> <номер_предмета> <дата_замены>');
        }
    }
}
