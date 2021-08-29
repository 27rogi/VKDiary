import Logger from "./Logger";

export interface IMessageOptions {
    header?: string;
    body?: string | string[];
    footer?: string;
}

export interface IconOptions {
    header?: string;
    footer?: string;
}

export default class MessageBuilder {
    protected message: IMessageOptions = {
        header: null,
        body: null,
        footer: null,
    };

    constructor(options: IMessageOptions) {
        (options.header) ? this.message.header = options.header : null;
        (options.body) ? this.message.body = options.body : null;
        (options.footer) ? this.message.footer = options.footer : null;
    }

    build() {
        if (!Array.isArray(this.message.body)) this.message.body = [this.message.body];

        const message = [];
        if (this.message.header) message.push(`${this.message.header}\n\n`);
        if (this.message.body) message.push(this.message.body.join('\n'));
        if (this.message.footer) message.push(`\n\n${this.message.footer}`);

        return message.join('');
    }

    setIcon(icon: IconOptions) {
        if (icon.header && this.message.header) {
            this.message.header = `${icon.header} ${this.message.header}`
        }
        if (icon.footer && this.message.footer) {
            this.message.footer = `${icon.footer} ${this.message.footer}`
        }
        return this;
    }

    addLine(line: string | string[]) {
        if (!this.message.body) this.message.body = []

        if (Array.isArray(line)) line = line.join('\n');
        if (!Array.isArray(this.message.body)) this.message.body = [this.message.body];
        this.message.body.push(line);
        
        return this;
    }

    setBody(body: string | [string]) {
        if (!Array.isArray(body)) this.message.body = [body];
        else this.message.body = body;
        return this;
    }

}
