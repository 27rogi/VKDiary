import { MongoError } from 'mongodb';
import { MessageContext } from 'vk-io';
import { BaseCommand } from '../../core/classes/BaseCommand';
import schedules from '../../core/database/models/schedules';
import subjects from '../../core/database/models/subjects';
import Logger from '../../core/utils/Logger';
import Schedules from '../Schedules';


export default class extends BaseCommand {
    constructor() {
        super();
        this.commandData = {
            command: 'добавитьрасписание',
            permissionLevel: 99,
            local: true
        }
    }

    async execute(context: MessageContext, args: string[], next: any) {
        if (args.length > 3) {

            if (!(await subjects.findOne({ subjectId: Number(args[0]) }).exec())) {
                return context.reply('Предмета с таким идентификатором нет в базе данных.');
            }

            if (Number(args[2]) > 7 || Number(args[3]) < 1) {
                return context.reply('Укажите диапазон дня от 1 до 7');
            }

            const schedule = new schedules({
                subjectId: Number(args[0]),
                subjectTime: Number(args[1]),
                subjectDay: Number(args[2]),
                isEven: (args[3] === 'true')
            });

            schedule.save(async (err: MongoError, item) => {
                if (err) {
                    if (err.code === 11000) {
                        return context.reply('Расписание с таким subjectId уже существует в базе.');
                    }
                    Logger.error(err);
                    return context.reply('Произошла ошибка при добавлении, обратитесь к администратору!');
                }

                await new Schedules().reload();

                return context.reply('Предмет успешно добавлен в базу данных!');
            });

        } else {
            return context.reply('Отсутствуют аргументы, используйте /addschedule <subjectId> <subjectTime> <day(1-7)> <even?>');
        }
    }
}
