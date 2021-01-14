import fs from 'fs';
import { MessageContext } from 'vk-io';
import { BaseCommand } from '../core/classes/BaseCommand';
import { BasePlugin } from '../core/classes/BasePlugin';
import permissions from '../core/database/models/permissions';
import VKClient from '../core/VKClient';

export default class extends BasePlugin {
    commandList: any;

    constructor() {
        super();

        this.commandMiddleware = this.commandMiddleware.bind(this);
    }

    extractArguments(argsToExtract: string, removeFirst?: boolean) {
        const args = argsToExtract.match(/("[^"]*"|'[^']*'|[\S]+)+/g).filter(function (e) {
            return e
        }).map((item) => {
            return item.replace(/["']/g, '')
        });

        if (removeFirst) {
            args.shift();
            return args;
        } else {
            return args;
        }
    }

    async commandMiddleware(context: MessageContext, next: any) {
        const { messagePayload } = context;
        context.state.command = messagePayload && messagePayload.command ? messagePayload.command : null;

        if (context.text === undefined)
            return;

        if (!this.extractArguments(context.text)[0].startsWith('/'))
            return;

        next();
    }

    // Moved to another function to make it easier to maintain without making code bigger.
    validate(input: string, command: BaseCommand) {
        const cmd = this.extractArguments(input)[0].toLowerCase().substring(1);

        if (command.getCommand().toLowerCase() !== cmd) {
            if (command.getAliases()) {
                if (!command.getAliases().includes(cmd)) return false;
            } else return false;
        }

        return true;
    }

    async execute() {
        VKClient.updates.on('message_new', this.commandMiddleware);

        const commandFiles = fs.readdirSync(__dirname + '/commands').filter((file) => file.endsWith('.js'));

        for (const commandFile of commandFiles) {
            import(__dirname + '/commands/' + commandFile).then((res) => {
                VKClient.updates.on('message_new', async (context: MessageContext, next: any) => {
                    const command: BaseCommand = new res.default();

                    if (!this.validate(context.text, command)) return next();

                    // Making sure that user has permissions to execute specific command.
                    // If command has permissionLevel lower than 1 we won't be checking it
                    // to reduce load on the database, because 0 should be number for lowest access.
                    if (command.getPermissionLevel() > 0) {
                        const user: any = await permissions.findOne({ userId: context.senderId }, 'permissionLevel').exec();
                        if (user === null || !command.hasPermissionLevel(user.permissionLevel)) {
                            context.reply('У вас недостаточно прав для вызова данной команды!');
                            return next();
                        }
                    }

                    command.execute(context, this.extractArguments(context.text, true), next);
                });
            }).catch((err) => {
                console.error(err);
            });
        }
    }
}
