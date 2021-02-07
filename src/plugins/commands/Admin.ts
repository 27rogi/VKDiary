import { MessageContext } from 'vk-io';
import { BaseCommand } from '../../core/classes/BaseCommand';
import schedules from '../../core/database/models/schedules';
import subjects from '../../core/database/models/subjects';

export default class extends BaseCommand {
    constructor() {
        super();
        this.commandData = {
            command: 'админка',
            aliases: ['а'],
            permissionLevel: 99,
            local: true,
        };
    }

    async execute(context: MessageContext, args: string[], next: any) {
        if (args.length > 0) {
            switch (args[0]) {
                case 'предметы': {
                    const subjectList = await subjects.find().sort({ subjectId: 1 }).populate('payload.homeworks').exec();
                    await context.send(`Список предметов (сорт. 0-9)`);

                    for (const subject of subjectList) {
                        const message = [];
                        message.push(`🔸 ${subject.name} (id: ${subject.subjectId})`, `место: ${subject.location}`, `учитель: ${subject.teacher}`, `уроки: ${subject.payload.homeworks.length > 0 ? 'yes' : 'no'}\n`);
                        await context.send(message.join('\n'));
                    }
                    break;
                }
                case 'расписание': {
                    const scheduleList = await schedules.find().sort({ scheduleId: 1 }).populate('payload.subject payload.replacement payload.time').exec();
                    await context.send(`Список расписаний (сорт. 0-9)`);

                    for (const schedule of scheduleList) {
                        const message = [];
                        message.push(`🔸 ${schedule.payload.subject.name} (# распис.: ${schedule.scheduleId})`, `день предмета: ${schedule.subjectDay}`, `четный?: ${schedule.isEven}`, `время: ${schedule.payload.time.timeId} (${schedule.payload.time.timeStarts}-${schedule.payload.time.timeEnds})`);
                        if (schedule.payload.replacement !== null) {
                            message.push(
                                `- 💥 номер замены: ${schedule.payload.replacement.replacementId} -`,
                                `заменяет расписание №${schedule.payload.replacement.replacedSchedule}`,
                                `заменяющий предмет ${schedule.payload.replacement.replacingSubject}`,
                                `дата замены ${schedule.payload.replacement.date}`,
                                `кабинет ${schedule.payload.replacement.location}`,
                                `учитель ${schedule.payload.replacement.teacher}`
                            );
                        }
                        await context.send(message.join('\n'));
                    }
                    break;
                }
                default: {
                    return context.reply('Такого параметра нет!');
                }
            }
        } else {
            return context.reply('Отсутствуют аргументы, используйте /добавитьвремя <начало> <конец>');
        }
    }
}
