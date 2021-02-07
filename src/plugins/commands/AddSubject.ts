import { MongoError } from 'mongodb';
import { MessageContext } from 'vk-io';
import { BaseCommand } from '../../core/classes/BaseCommand';
import subjects from '../../core/database/models/subjects';
import Logger from '../../core/utils/Logger';

export default class extends BaseCommand {
    constructor() {
        super();
        this.commandData = {
            command: 'добавитьурок',
            permissionLevel: 99,
            local: true,
        };
    }

    async execute(context: MessageContext, args: string[], next: any) {
        if (args.length > 2) {
            const subject = new subjects({
                name: args[0],
                location: args[1],
                teacher: args[2],
            });

            subject.save((err: MongoError) => {
                if (err) {
                    if (err.code === 11000) {
                        return context.reply('Предмет с таким subjectId уже существует в базе.');
                    }
                    Logger.error(err);
                    return context.reply('Произошла ошибка при добавлении, обратитесь к администратору!');
                }
                return context.reply('Предмет успешно добавлен в базу данных!');
            });
        } else {
            return context.reply('Отсутствуют аргументы, используйте /addsubject <name> <location> <teacher>');
        }
    }
}
