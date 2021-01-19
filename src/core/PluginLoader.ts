import fs from 'fs';
import { IBasePlugin } from './classes/BasePlugin';
import Logger from './utils/Logger';
import VKClient from './VKClient';

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

    async load() {
        Logger.info(`Started searching plugins in ${this.options.pluginsDir} with extension ${this.options.fileExt}`);
        this.pluginsList = fs.readdirSync(`${this.options.pluginsDir}`).filter((file) => file.endsWith(this.options.fileExt));
        Logger.info(`Found ${this.pluginsList.length} plugins, attempting to load them...`)
        for (const pluginFile of this.pluginsList) {
            import(`${this.options.pluginsDir}/${pluginFile}`).then((res) => {
                const plugin: IBasePlugin = new res.default(VKClient);
                if (typeof plugin.execute !== 'function') return Logger.error(`Pliugin ${pluginFile} can not be loaded!`);
                Logger.info(`Successfully loaded plugin ${pluginFile}`)
                plugin.execute();
            }).catch((err) => {
                Logger.error(err);
            });
        }
    }
}
