import { MessageContext, VK } from 'vk-io';

export interface ICommandData {
    command: string;
    aliases?: string[];
    permissionLevel: Int8Array;
}

export interface IBaseCommand {
    commandData: ICommandData;
    vk: VK;

    new(commandData: ICommandData, vk: VK): any;

    getCommand(): string;
    getAliases(): string[] | null;
    getPermissionLevel(): Int8Array;
    hasPermissionLevel(number: Int8Array): boolean;

    execute(context: MessageContext, next: any): void | Promise<void>;
}

export class BaseCommand {
    protected commandData: ICommandData;
    vk: VK;

    constructor(commandData: ICommandData, vk: VK) {
        this.vk = vk;
        this.commandData = commandData;
    }

    getCommand() {
        return this.commandData.command.toLowerCase();
    }

    getAliases() {
        if (this.commandData.aliases) {
            return this.commandData.aliases
        } else
            return null;
    }

    getPermissionLevel() {
        return this.commandData.permissionLevel;
    }

    hasPermissionLevel(number: Int8Array) {
        return number >= this.commandData.permissionLevel;
    }

    execute(context: MessageContext, next: any) {
        return;
    }
}
