import { Keyboard, KeyboardBuilder } from 'vk-io';
import { BaseCommand } from './BaseCommand';

export class KeyboardCommand extends BaseCommand {
    protected keyboard: KeyboardBuilder;

    constructor() {
        super();
        this.keyboard = Keyboard.builder();
    }

    execute() {
        return;
    }
}
