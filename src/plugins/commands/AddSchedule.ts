import { MongoError } from 'mongodb';
import { MessageContext } from 'vk-io';
import { BaseCommand } from '../../core/classes/BaseCommand';
import schedules from '../../core/database/models/schedules';
import subjects from '../../core/database/models/subjects';
import TimeConverter from '../../core/TimeConverter';


export default class extends BaseCommand {
    constructor() {
        super();
        this.commandData = {
            command: 'addschedule',
            permissionLevel: 99
        }
    }

    async execute(context: MessageContext, args: string[], next: any) {
        if (args.length > 3) {

            if (!(await subjects.findOne({ subjectId: args[0] }).exec())) {
                return context.reply('Предмета с таким идентификатором нет в базе данных.');
            }

            const schedule = new schedules({
                subjectId: Number(args[0]),
                subjectStarts: TimeConverter.getHMMTime(args[1]),
                subjectEnds: TimeConverter.getHMMTime(args[2]),
                isEven: Boolean(args[3])
            });

            schedule.save((err: MongoError, item: any) => {
                if (err) {
                    if (err.code === 11000) {
                        return context.reply('Расписание с таким subjectId уже существует в базе.');
                    }
                    console.log(err);
                    return context.reply('Произошла ошибка при добавлении, обратитесь к администратору!');
                }

                return context.reply('Предмет успешно добавлен в базу данных!');
            });

        } else {
            return context.reply('Отсутствуют аргументы, используйте /addschedule <subjectId> <start> <end> <even?>');
        }
    }
}
