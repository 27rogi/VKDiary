import fs from 'fs';
import { vk } from '../vkdiary';
import { IBasePlugin } from './classes/BasePlugin';

export interface PluginLoaderOptions {
    [key: string]: string
}

export default class PluginLoader {
    pluginsList: any[];
    private options: PluginLoaderOptions = {};

    constructor(pluginsDir: string, fileExt: string) {
        this.options.pluginsDir = pluginsDir;
        this.options.fileExt = fileExt;
    }

    load() {
        this.pluginsList = fs.readdirSync(`${this.options.pluginsDir}`).filter((file) => file.endsWith(this.options.fileExt));
        for (const pluginFile of this.pluginsList) {
            import(`${this.options.pluginsDir}/${pluginFile}`).then((res) => {
                const plugin: IBasePlugin = new res.default(vk);
                plugin.execute();
            }).catch((err) => {
                console.error(err);
            });
        }
    }
}
