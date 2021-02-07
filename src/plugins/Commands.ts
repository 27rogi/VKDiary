import fs from 'fs';
import { MessageContext } from 'vk-io';
import { BaseCommand } from '../core/classes/BaseCommand';
import { BasePlugin } from '../core/classes/BasePlugin';
import permissions from '../core/database/models/permissions';
import Logger from '../core/utils/Logger';
import VKClient from '../core/VKClient';

export default class extends BasePlugin {
    commandList: any;

    constructor() {
        super();

        this.commandMiddleware = this.commandMiddleware.bind(this);
    }

    extractArguments(argsToExtract: string, removeFirst?: boolean) {
        const args = argsToExtract
            .match(/("[^"]*"|'[^']*'|[\S]+)+/g)
            .filter(function (e) {
                return e;
            })
            .map((item) => {
                return item.replace(/["']/g, '');
            });

        if (removeFirst) {
            args.shift();
            return args;
        } else {
            return args;
        }
    }

    commandMiddleware(context: MessageContext, next: any) {
        const payload = context.messagePayload;

        if (context.text === undefined) return;

        if (payload === undefined) {
            if (!this.extractArguments(context.text)[0].startsWith('/')) return;
        }

        next();
    }

    payloadMiddleware(context: MessageContext, next: any) {
        const payload = context.messagePayload;
        if (payload === undefined) return next();

        context.text = '/' + payload.command;

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
        VKClient.updates.on('message_new', this.payloadMiddleware);

        Logger.info(`Loading commands from "/commands" folder...`);
        const commandFiles = fs.readdirSync(__dirname + '/commands').filter((file) => file.endsWith('.js'));

        Logger.info(`Attempting to load ${commandFiles.length} commands...`);
        for (const commandFile of commandFiles) {
            await import(__dirname + '/commands/' + commandFile)
                .then((res) => {
                    Logger.info(`Command from file ${commandFile} was registered`);
                    VKClient.updates.on('message_new', async (context: MessageContext, next: any) => {
                        const command: BaseCommand = new res.default();

                        if (!this.validate(context.text, command)) return next();

                        // Making sure that user has permissions to execute specific command.
                        // If command has permissionLevel lower than 1 we won't be checking it
                        // to reduce load on the database, because 0 should be number for lowest access.
                        if (command.getPermissionLevel() > 0) {
                            const user = await permissions.findOne({ userId: context.senderId.toString() }, 'permissionLevel').exec();
                            if (user === null || !command.hasPermissionLevel(user.permissionLevel)) {
                                await context.reply('У вас недостаточно прав для вызова данной команды!');
                                return next();
                            }
                        }

                        if (command.isLocal()) {
                            if (!context.isDM) {
                                await context.reply('Данная команда доступна только в личных сообщениях.');
                                return next();
                            }
                        }

                        command.execute(context, this.extractArguments(context.text, true), next);
                    });
                })
                .catch((err) => {
                    Logger.error(err);
                });
        }

        // Handle wrongly typed commands in DMs, all processing must be done before this listener.
        VKClient.updates.on('message_new', async (context, next) => {
            if (context.isDM) {
                await context.reply('⚠ Такой команды нет, используйте /помощь для справки');
            }
        });
    }
}
