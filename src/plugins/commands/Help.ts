import { MessageContext } from 'vk-io';
import { BaseCommand } from '../../core/classes/BaseCommand';

export default class extends BaseCommand {
    constructor() {
        super();
        this.commandData = {
            command: 'помощь',
            aliases: ['help'],
            permissionLevel: 0,
            local: false
        }
    }

    async execute(context: MessageContext, args: string[], next: any) {
        if (!context.isDM) {
            context.send([
                `🔮 Справка по доступным командам в беседе`,
                ``,
                `/помощь — Показать справку по командам в беседе`,
                `/расписание <день_месяца?> <номер_месяца?> — Показать справку по командам в беседе`,
            ].join('\n'));
        } else {

        }
    }
}
