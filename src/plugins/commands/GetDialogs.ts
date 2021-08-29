import settings from '../../settings.json';
import { MessageContext } from 'vk-io';
import { BaseCommand } from '../../core/classes/BaseCommand';
import { dbDiary } from '../../core/database/MongooseClient';
import replacements from '../../core/database/models/diary/replacements';
import Logger from '../../core/utils/Logger';
import VKClient from '../../core/VKClient';

export default class extends BaseCommand {
    constructor() {
        super();
        this.commandData = {
            command: 'диалоги',
            permissionLevel: 99,
            local: false,
        };
    }

    async execute(context: MessageContext, args: string[], next: any) {
        await VKClient.api.messages.getConversations({
            group_id: -settings.client.groupId,
        }).then((res) => {
            res.items.forEach((item) => {
                Logger.info(item.conversation.peer.type);
            })
        }).catch((err) => Logger.error(err))
        Logger.info(await replacements.find({}));
    }
}
