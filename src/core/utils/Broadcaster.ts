import settings from '../../settings.json';
import chats from '../database/models/chats';
import VKClient from '../VKClient';
import Logger from './Logger';

const removedChatsCache: number[] = [];

export default {
    async broadcastMessage(text: string) {
        const chatsToBroadcast = await chats.find({
            botId: settings.global.groupId
        }).exec();

        removedChatsCache.length = 0;

        for (const chat of chatsToBroadcast) {
            if (chat.doAnnounce) {
                Logger.info('Broadcasting message to channel #' + chat.chatId);
                await VKClient.api.messages.send({
                    message: text,
                    peer_id: chat.chatId,
                    random_id: Math.random()
                }).catch((err) => {
                    if (err.code === 7) {
                        if (!removedChatsCache.includes(chat.chatId)) {
                            Logger.warn('Trying to send message in chat where bot was deleted, clearing info.');
                            chats.deleteOne({ chatId: chat.chatId }).exec();
                            removedChatsCache.push(chat.chatId);
                        }
                    } else Logger.error(err);
                });
            }
        }
    }
}
