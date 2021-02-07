import { MongoError } from 'mongodb';
import { MessageContext } from 'vk-io';
import { BasePlugin } from '../core/classes/BasePlugin';
import chats from '../core/database/models/chats';
import Logger from '../core/utils/Logger';
import VKClient from '../core/VKClient';
import settings from '../settings.json';
export default class Greeter extends BasePlugin {
    constructor() {
        super();
    }

    execute() {
        VKClient.updates.on('chat_invite_user', async (context: MessageContext, next: any) => {
            if (context.eventMemberId !== settings.global.groupId) return;
            Logger.info(`Invited in chat #${context.$groupId}, adding chat to database`);

            if (
                (await chats
                    .findOne({
                        botId: context.eventMemberId,
                        chatId: context.peerId,
                    })
                    .exec()) !== null
            ) {
                Logger.info(`Bot already has information about this chat`);
                return context.send(`🙌 Бот уже был добавлен в беседу ранее, информация в базе сохранена!`);
            }

            const chat = new chats({
                botId: context.eventMemberId,
                chatId: context.peerId,
                doAnnounce: true,
            });

            chat.save(async (err: MongoError) => {
                if (err) {
                    if (err.code === 11000) {
                        return context.send(`🙌 Бот уже был добавлен в беседу ранее, информация в базе сохранена!`);
                    }
                    return context.send(`⚠ Ошибка добавления беседы в базу данных, свяжитесь с администратором бота для помощи!`);
                }
                await context.send(`
                🙌 Бот успешно добавлен в диалог!
                ⚠ Данный диалог будет добавлен в базу бота для автоматической рассылки предупреждений о начале уроков с подробной информацией, если таковая будет включена в настройках бота

                ⚠ Для правильной работы бота необходимо выдать ему права администратора беседы!

                Для включения клавиатуры бота используйте команду: /help
                `);
            });
        });

        VKClient.updates.on('chat_kick_user', (context: MessageContext, next: any) => {
            Logger.info(`User was deleted from chat #${context.$groupId}, checking if this user is me`);
            if (context.eventMemberId !== settings.global.groupId) return;

            chats
                .deleteMany({
                    chatId: context.id,
                    botId: context.eventMemberId,
                })
                .catch((err) => {
                    Logger.error(err);
                });
        });
    }
}
