import fs from 'fs';
import { IBasePlugin } from './classes/BasePlugin';
import Logger from './utils/Logger';
import VKClient from './VKClient';
export interface PluginLoaderOptions {
    pluginsDir?: string;
    fileExt?: string;
}

export default class PluginLoader {
    pluginsList: IBasePlugin[] = [];
    private options: PluginLoaderOptions = {};

    constructor(pluginsDir: string, fileExt: string) {
        this.options.pluginsDir = pluginsDir;
        this.options.fileExt = fileExt;
    }

    load() {
        Logger.info(`Started searching plugins in ${this.options.pluginsDir} with extension ${this.options.fileExt}`);
        const files = fs.readdirSync(`${this.options.pluginsDir}`).filter((file) => file.endsWith(this.options.fileExt));

        Logger.info(`Found ${files.length} plugins, attempting to load them...`);
        for (const pluginFile of files) {
            import(`${this.options.pluginsDir}/${pluginFile}`)
                .then((res) => {
                    const plugin: IBasePlugin = new res.default(VKClient);
                    if (typeof plugin.execute !== 'function') return Logger.error(`Pliugin ${pluginFile} can not be loaded!`);
                    Logger.info(`Successfully loaded plugin ${pluginFile}`);
                    plugin.execute();
                })
                .catch((err) => {
                    Logger.error(err);
                });
        }
    }
}
