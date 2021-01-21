import { MessageContext } from 'vk-io';
import { BaseCommand } from '../../core/classes/BaseCommand';

export default class extends BaseCommand {
    constructor() {
        super();
        this.commandData = {
            command: 'предмет',
            permissionLevel: 0,
            local: true
        }
    }

    async execute(context: MessageContext, args: string[], next: any) {

    }
}
