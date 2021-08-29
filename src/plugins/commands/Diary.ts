import moment from 'moment';
import { MessageContext } from 'vk-io';
import { BaseCommand } from '../../core/classes/BaseCommand';
import Time from '../../core/utils/Time';
import MessageBuilder from '../../core/utils/MessageBuilder';

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
        const message = new MessageBuilder({
            header: "Теперь будет еще удобнее!",
            footer: `Ссылка: https://diary.ryzhenkov.space`
        }).setIcon({ header: '🙀', footer: '🔗' });

        message.addLine([
            `Здравствуйте, я хочу объявить о том, что функции дневника полностью переехали на специальный сайт дневника!`,
            `Я понимаю, что сначала это может казаться неудобным, но я работал над проектом 2 месяца и старался сделать максимально полезный и удобный интерфейс.`,
            ``,
            `И да, бот будет дальше оповещать о начале пар, добавлении замен и домашнего задания!`,
        ]);

        await context.reply(message.build());
    }
}
