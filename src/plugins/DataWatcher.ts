import { BasePlugin } from '../core/classes/BasePlugin';
import homeworks from '../core/database/schemas/homeworks';

export default class extends BasePlugin {
    async execute() {
        homeworks.post('save', () => {
            console.log('wtf')
        });

        // homeworks.post('save', async (item, next) => {
        //     console.log('saved!');
        //     const subject: any = await subjects.findOne({
        //         subjectId: item.subject
        //     }).exec();

        //     const vkUser = (await VKClient.api.users.get({
        //         user_ids: item.creatorId,
        //     }))[0];

        //     Broadcaster.broadcastMessage([
        //         `💥 Добавлено новое домашнее задание!`,
        //         ``,
        //         `Предмет: ${subject.name}`,
        //         `Добавил: ${vkUser.first_name} ${vkUser.last_name}`,
        //         `Номер в базе: ${item.homeworkId}`
        //     ].join('\n'));

        //     return next();
        // });

        // replacements.post('save', async (item, next) => {
        //     console.log('saved!');
        //     const subject: any = await subjects.findOne({
        //         subjectId: item.replacingSubject
        //     }).exec();

        //     const schedule: any = await schedules.findOne({ scheduleId: item.replacedSchedule }).exec();
        //     const subjectTime: any = await subjectTimes.findOne({timeId: schedule.subjectTime}).exec();

        //     const date = moment(item.date, 'DD.MM.YYYY');

        //     Broadcaster.broadcastMessage([
        //         `❗ На ${date.format('DD mmmm')} в ${subjectTime.timeStarts} назначена замена предметом ${subject.name}`,
        //     ].join('\n'));

        //     return next();
        // });

        // homeworks.post('update', async ([err, res, next]) => {
        //     const subject: any = await subjects.findOne({
        //         subjectId: res.subject
        //     }).exec();

        //     const vkUser = (await VKClient.api.users.get({
        //         user_ids: res.creatorId,
        //     }))[0];

        //     Broadcaster.broadcastMessage([
        //         `🏗 Домашнее задание изменено!`,
        //         ``,
        //         `Предмет: ${subject.name}`,
        //         `Добавил: ${vkUser.first_name} ${vkUser.last_name}`,
        //         `Номер в базе: ${res.homeworkId}`
        //     ].join('\n'));

        //     return next(err);
        // });

    }
}
