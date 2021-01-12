import fs from 'fs';
import { MessageContext, VK } from 'vk-io';
import { BasePlugin } from '../core/classes/BasePlugin';

export default class extends BasePlugin {
    commandList: any;

    constructor(vk: VK) {
        super(vk);
    }

    async commandMiddleware(context: MessageContext, next: any) {
        const { messagePayload } = context;
        context.state.command = messagePayload && messagePayload.command ? messagePayload.command : null;

        if (context.text === undefined)
            return;

        if (!context.text.startsWith('/'))
            return;

        next();
    }

    execute() {
        this.vk.updates.on('message_new', this.commandMiddleware);

        const commandFiles = fs.readdirSync(__dirname + '/commands').filter((file) => file.endsWith('.js'));

        for (const commandFile of commandFiles) {
            import(__dirname + '/commands/' + commandFile).then((res) => {
                this.vk.updates.on('message_new', (context: MessageContext, next: any) => {
                    new res.default().execute();
                });
            }).catch((err) => {
                console.error(err);
            });
        }
    }
}
