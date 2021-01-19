import moment from 'moment';
import { MongoError } from 'mongodb';
import { MessageContext } from 'vk-io';
import { BaseCommand } from '../../core/classes/BaseCommand';
import homeworks from '../../core/database/models/homeworks';
import subjects from '../../core/database/models/subjects';
import Logger from '../../core/utils/Logger';
import VKClient from '../../core/VKClient';

export default class extends BaseCommand {
    constructor() {
        super();
        this.commandData = {
            command: 'домашка',
            aliases: ['дз', 'задания'],
            permissionLevel: 0,
            local: true
        }
    }


    async execute(context: MessageContext, args: string[], next: any) {

        if (args[0] === 'добавить') {
            if (args.length > 3 && !Number.isNaN(Number(args[1]))) {
                const subject = await subjects.findOne({ subjectId: args[1] }).exec();

                const homeworkDeadline = moment(args[2], 'DD.MM.YYYY');
                if (Number.isNaN(homeworkDeadline.date())) {
                    return context.reply('Ошибка при введении даты, пример правильного использования - 14.01.21');
                }

                if (subject === null) {
                    return context.reply('Предмет с таким идентификатором отсутствует в базе!');
                }

                if (context.text.indexOf('\n\n') === -1) {
                    return context.reply('Неправильное оформление описания задания, внимательно посмотрите пример его оформления.');
                }

                const desc = context.text.substring(context.text.indexOf('\n\n') + 2);
                if (desc === '') {
                    return context.reply('Не удалось обнаружить описание, внимательно посмотрите пример его оформления.');
                }

                const target: { [item: string]: any } = {
                    description: desc,
                };

                if (context.attachments.length > 0) {
                    target.attachments = [];
                    for (const attachment of context.attachments) {
                        target.attachments.push(attachment.toString());
                    }
                    target.attachments = target.attachments.join(',');
                }

                const homework = new homeworks({
                    subject: args[1],
                    target,
                    deadline: homeworkDeadline.format('DD.MM.YYYY'),
                    creatorId: context.senderId
                });

                homework.save((err: MongoError, item) => {
                    if (err) {
                        if (err.code === 11000) {
                            return context.reply('Задание с таким идентификатором существует в базе, видимо это ошибка!');
                        }
                        Logger.error(err);
                        return context.reply('Произошла ошибка при добавлении, обратитесь к администратору!');
                    }
                    return context.reply('Предмет успешно добавлен в базу данных!');
                });

            } else {
                context.reply([
                    '🔸 Используйте: /дз добавить <номер_предмета> <дата_сдачи>\n\n<описание>\n\n',
                    '📝 Пример: /дз добавить 1 17.01.2021\n\nНужно сделать работу в вижуал студии!'
                ].join('\n'));
            }
        } else if (args[0] === 'удалить') {
            if (args.length > 1 && !Number.isNaN(Number(args[1]))) {
                const homework = await homeworks.findOne({ homeworkId: args[1] }).exec();

                if (homework === null) {
                    return context.reply('Предмет с таким идентификатором отсутствует в базе!');
                }

                homework.delete().then((res) => {
                    return context.reply(`Удалено задание с идентификатором ${res.homeworkId}`);
                });
            } else {
                context.reply('Указанный идентификатор неправилен');
            }
        } else {
            let homeworkDate = moment(Date.now());

            if (args[0] !== undefined) {
                homeworkDate = moment(args[0], 'DD.MM.YYYY');
            }

            const homeworkList = await homeworks.find().sort({ homeworkId: 1 }).exec();
            const availableHomeworks: any = [];

            homeworkList.forEach(async (homework: any) => {
                const dateDiff = moment(homework.deadline, 'DD.MM.YYYY').diff(homeworkDate, 'days');
                if (dateDiff > -1 && dateDiff < 7) {
                    availableHomeworks.push(homework);
                }
            })

            if (availableHomeworks.length <= 0) {
                return context.reply('Домашних заданий на ближайшее время не найдено! :)');
            }

            for (const homework of availableHomeworks) {
                const subject: any = await subjects.findOne({ subjectId: homework.subject }).exec();
                const vkUser = (await VKClient.api.users.get({
                    user_ids: homework.creatorId,
                }))[0];

                context.send([
                    `🤓 Домашнее задание по предмету ${subject.name}`,
                    ``,
                    `⌚ Необходимо сдать до ${homework.deadline}`,
                    `👥 Добавил: ${vkUser.first_name} ${vkUser.last_name}`,
                    `📝 Описание: ${homework.target.description}`,
                ].join('\n'));

                if (homework.target.attachments) {
                    await context.send({
                        message: '🔸 Прикрепленные документы:',
                        attachment: homework.target.attachments
                    })
                }
            }
        }
    }
}
