import moment from 'moment';
import { MessageContext } from 'vk-io';
import { BaseCommand } from '../../core/classes/BaseCommand';
import { ISubjects } from '../../core/database/models/subjects';
import Search from '../../core/utils/Search';

export default class extends BaseCommand {
    constructor() {
        super();
        this.commandData = {
            command: 'предмет',
            aliases: ['предм', 'пр'],
            permissionLevel: 0,
            local: true
        }
    }

    async execute(context: MessageContext, args: string[], next: any) {
        if (args.length > 0) {
            const searchQuery: number | string = args[0];
            let subject: ISubjects = await Search.findSubject(args[0]);

            if(subject === null) return context.reply('⚠ Предмет с таким именем или идентификатором не найден!');
            subject = await subject.populate('payload.schedules payload.homeworks').execPopulate();

            const message = [];
            message.push(
                `🔸 ${subject.name} (#${subject.subjectId})`,
                `▪ Преподаватель: ${subject.teacher}`,
                `▪ Кабинет: ${subject.location}`,
                ``
            )

            if (subject.payload.schedules.length > 0) {
                const subjectSchedules: string[] = [];
                const sortedSchedules = subject.payload.schedules.sort((x, y) => (x.isEven === y.isEven) ? 0 : x.isEven ? -1 : 1);
                for (const item of sortedSchedules) {
                    const schedule = await item.populate('payload.time').execPopulate();
                    subjectSchedules
                        .push(`${moment(`${schedule.subjectDay} ${schedule.payload.time.timeStarts}`, 'd HH:mm')
                        .format('dddd в HH:mm')} (${schedule.isEven ? 'четная' : 'нечетная'}|#${schedule.scheduleId})`);
                }

                message.push(`⌚ Дни недели: ${subjectSchedules.join(', ')}`);
            }

            const homeworkNumbers: number[] = [];
            subject.payload.homeworks.forEach((homework) => {
                homeworkNumbers.push(homework.homeworkId);
            })

            if (homeworkNumbers.length > 0) {
                message.push(
                    `\n⚠ Номера домашних заданий по предмету: #${homeworkNumbers.join(', #')}`,
                    `Для просмотра домашнего задания используйте /дз <номер_задания>`
                );
            }

            return context.send(message.join('\n'));

        } else {
            context.reply('⚠ Вы не указали название или идентификатор предмета');
        }
    }
}
