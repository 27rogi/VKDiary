import { VK } from 'vk-io';

export interface IPluginData {
    name: string;
    version: string | number;
}

export interface IBasePlugin {
    vk: VK;
    data: IPluginData;

    new(vk: VK): any;

    execute(): void | Promise<void>;
}

export class BasePlugin {
    vk: VK;
    data: IPluginData;

    constructor(vk: VK) {
        this.vk = vk;
    }

    execute() {
        return;
    }
}
