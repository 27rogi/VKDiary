import { Keyboard, KeyboardBuilder, VK } from 'vk-io';
import { BaseCommand, ICommandData } from './BaseCommand';

export class KeyboardCommand extends BaseCommand {
    protected keyboard: KeyboardBuilder;
    
    constructor(commandData: ICommandData, vk: VK) {
        super(commandData, vk);
        this.keyboard = Keyboard.builder();
    }

    execute() {
        return;
    }
}
