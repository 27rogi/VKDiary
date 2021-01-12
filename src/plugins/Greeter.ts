import { MessageContext, VK } from 'vk-io';
import { BasePlugin } from '../core/classes/BasePlugin';

export default class Greeter extends BasePlugin {
    constructor(vk: VK) {
        super(vk);
    }

    execute() {
        this.vk.updates.on('chat_invite_user', (context: MessageContext, next: any) => {
            if (context.eventMemberId !== -124550264) return;

            // add group to database

            context.send(`
            🙌 Бот успешно добавлен в диалог!
            ⚠ Данный диалог будет добавлен в базу бота для автоматической рассылки предупреждений о начале уроков с подробной информацией, если таковая будет включена в настройках бота

            Для включения клавиатуры бота используйте команду: /help
            `);
        });

        this.vk.updates.on('chat_kick_user', (context: MessageContext, next: any) => {
            if (context.eventMemberId !== -124550264) return;
            // remove from database
        });
    }
}
