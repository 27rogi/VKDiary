import settings from '../../settings.json';
import chats from '../database/models/chats';
import VKClient from '../VKClient';
import Logger from './Logger';

export default {
    async broadcastMessage(text: string) {
        const chatsToBroadcast = await chats
            .find({
                botId: settings.client.groupId,
            })
            .exec();

        for (const chat of chatsToBroadcast) {
            if (chat.doAnnounce) {
                Logger.info('Broadcasting message to channel #' + chat.chatId);
                await VKClient.api.messages
                    .send({
                        message: text,
                        peer_id: chat.chatId,
                        random_id: Math.random(),
                    })
                    .catch(async (err) => {
                        if (err.code === 7) {
                            Logger.warn(`Trying to send message in chat #${chat.chatId} where bot was deleted.`);
                        } else Logger.error(err);
                    });
            }
        }
    },
};
