import { MongoError } from 'mongodb';
import { MessageContext } from 'vk-io';
import { BasePlugin } from '../core/classes/BasePlugin';
import chats from '../core/database/models/chats';
import VKClient from '../core/VKClient';

export default class Greeter extends BasePlugin {
    constructor() {
        super();
    }

    execute() {
        VKClient.updates.on('chat_invite_user', (context: MessageContext, next: any) => {
            if (context.eventMemberId !== -124550264) return;

            const chat = new chats({
                chatId: context.id,
                doAnnounce: true,
            });

            chat.save((err: MongoError) => {
                if (err) {
                    if (err.code === 11000) {
                        context.send(`🙌 Бот уже был добавлен в беседу ранее, информация в базе сохранена!`);
                        return;
                    }
                    context.send(`⚠ Ошибка добавления беседы в базу данных, свяжитесь с администратором бота для помощи!`);

                    return console.error(err);
                }
                context.send(`
                🙌 Бот успешно добавлен в диалог!
                ⚠ Данный диалог будет добавлен в базу бота для автоматической рассылки предупреждений о начале уроков с подробной информацией, если таковая будет включена в настройках бота

                ⚠ Для правильной работы бота необходимо выдать ему права администратора беседы!

                Для включения клавиатуры бота используйте команду: /help
                `);
            });

        });

        VKClient.updates.on('chat_kick_user', (context: MessageContext, next: any) => {
            if (context.eventMemberId !== -124550264) return;

            chats.deleteMany({
                chatId: context.id,
            })
            .then((res) => {
                console.error(res);
            })
            .catch((err) => {
                console.error(err);
            });

        });
    }
}
