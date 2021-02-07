import { MongoError } from 'mongodb';
import { MessageContext } from 'vk-io';
import { BaseCommand } from '../../core/classes/BaseCommand';
import subjectTimes from '../../core/database/models/subjectTimes';
import Logger from '../../core/utils/Logger';
import TimeConverter from '../../core/utils/TimeConverter';

export default class extends BaseCommand {
    constructor() {
        super();
        this.commandData = {
            command: 'добавитьвремя',
            permissionLevel: 99,
            local: true,
        };
    }

    async execute(context: MessageContext, args: string[], next: any) {
        if (args.length > 1) {
            const subjectTime = new subjectTimes({
                timeStarts: TimeConverter.getHMMTime(args[0]),
                timeEnds: TimeConverter.getHMMTime(args[1]),
            });

            subjectTime.save((err: MongoError) => {
                if (err) {
                    if (err.code === 11000) {
                        return context.reply('Время с таким айди уже существует в базе.');
                    }
                    Logger.error(err);
                    return context.reply('Произошла ошибка при добавлении, обратитесь к администратору!');
                }
                return context.reply('Время успешно добавлено в базу данных!');
            });
        } else {
            return context.reply('Отсутствуют аргументы, используйте /добавитьвремя <начало> <конец>');
        }
    }
}
