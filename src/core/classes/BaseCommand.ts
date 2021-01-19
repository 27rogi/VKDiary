import { MessageContext } from 'vk-io';

export interface ICommandData {
    command: string;
    aliases?: string[];
    permissionLevel: number;
    local?: boolean;
}

export interface IBaseCommand {
    getCommand(): string;
    getAliases(): string[] | null;
    getPermissionLevel(): number;
    hasPermissionLevel(number: number): boolean;

    execute(context: MessageContext, args: string[], next: any): void | Promise<void>;
}

export class BaseCommand {
    protected commandData: ICommandData;

    getCommand() {
        return this.commandData.command.toLowerCase();
    }

    getAliases() {
        if (this.commandData.aliases) {
            return this.commandData.aliases
        } else
            return null;
    }

    isLocal() {
        return this.commandData.local;
    }

    getPermissionLevel() {
        return this.commandData.permissionLevel;
    }

    hasPermissionLevel(number: number) {
        return number >= this.commandData.permissionLevel;
    }

    execute(context: MessageContext, args: string[], next: any) {
        return;
    }
}
