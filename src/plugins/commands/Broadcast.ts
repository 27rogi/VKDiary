import { MessageContext } from 'vk-io';
import { BaseCommand } from '../../core/classes/BaseCommand';
import Broadcaster from '../../core/utils/Broadcaster';

export default class extends BaseCommand {
    constructor() {
        super();
        this.commandData = {
            command: 'объявить',
            permissionLevel: 99,
            local: false,
        };
    }

    async execute(context: MessageContext, args: string[], next: any) {
        if (args.length > 0) {
            await Broadcaster.broadcastMessage(args[0]);
        } else {
            return context.reply('Отсутствуют аргументы, используйте /добавитьвремя <начало> <конец>');
        }
    }
}
