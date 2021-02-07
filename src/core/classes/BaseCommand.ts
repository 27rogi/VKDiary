import { MessageContext } from 'vk-io';

export interface ICommandData {
    command: string;
    permissionLevel: number;
    aliases?: string[];
    local?: boolean;
}

export interface IBaseCommand {
    getCommand(): string;
    getAliases(): string[] | null;
    getPermissionLevel(): number;
    hasPermissionLevel(number: number): boolean;

    middleware(context: MessageContext, args: string[]): () => boolean | Promise<boolean>;
    execute(context: MessageContext, args: string[], next: any): void | Promise<void>;
}

export class BaseCommand {
    protected commandData: ICommandData;

    getCommand() {
        return this.commandData.command.toLowerCase();
    }

    getAliases() {
        if (this.commandData.aliases) {
            return this.commandData.aliases;
        } else return null;
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

    middleware(context: MessageContext, args: string[]) {
        return true;
    }

    execute(context: MessageContext, args: string[], next: any) {
        return;
    }
}
