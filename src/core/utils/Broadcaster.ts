import settings from '../../settings.json';
import chats from '../database/models/chats';
import VKClient from '../VKClient';
import Logger from './Logger';

export default {
    async broadcastMessage(text: string) {
        const chatsToBroadcast: any = await chats.find({
            botId: settings.global.groupId
        }).exec();

        for (const chat of chatsToBroadcast) {
            if (chat.doAnnounce) {
                Logger.info('Broadcasting message to channel #' + chat.chatId);
                VKClient.api.messages.send({
                    message: text,
                    peer_id: chat.chatId,
                    random_id: Math.random()
                })
            }
        }
    }
}
