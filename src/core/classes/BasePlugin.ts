
export interface IPluginData {
    name: string;
    version: string | number;
}

export interface IBasePlugin {
    data: IPluginData;

    execute(): void | Promise<void>;
}

export class BasePlugin {
    data: IPluginData;

    execute() {
        return;
    }
}
