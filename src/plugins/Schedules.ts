import Agenda from 'agenda';
import moment from 'moment';
import mongoose, { Query } from 'mongoose';
import { BasePlugin } from '../core/classes/BasePlugin';
import schedules, { ISchedules } from '../core/database/models/schedules';
import subjectTimes from '../core/database/models/subjectTimes';
import Broadcaster from '../core/utils/Broadcaster';
import Cleaner from '../core/utils/Cleaner';
import Logger from '../core/utils/Logger';
import Time from '../core/utils/Time';

export default class extends BasePlugin {
    agenda: Agenda;

    constructor() {
        super();
        this.agenda = new Agenda().mongo(mongoose.connection.db);
    }

    async createJobs() {
        const currentJobs = await this.agenda.jobs({ name: /^schedule_time / });

        for (const job of currentJobs) {
            const times = await subjectTimes
                .findOne({
                    timeId: Number(job.attrs.name.split(/^schedule_time /).pop()),
                })
                .exec();
            if (times === null) {
                Logger.error(`Job ${job.attrs.name} was removed because it uses timeId that doesn't exist anymore.`);
                await job.remove();
                continue;
            }
        }

        const availableSubjectTimes = await subjectTimes.find().exec();

        for (const time of availableSubjectTimes) {
            const jobName = `schedule_time ${time.timeId}`;

            this.agenda.define(jobName, async (job, done) => {
                let schedule: ISchedules | Query<ISchedules, ISchedules> = schedules.findOne({
                    subjectTime: time.timeId,
                    subjectDay: moment().isoWeekday(),
                    isEven: Time.isEvenWeek(moment()),
                });
                if ((await schedule.exec()) === null) return Logger.warn(`Schedule for job ${jobName} not found!`);
                const payload = (await (await schedule.populate('payload.subject payload.replacement')).execPopulate()).payload;

                schedule = await schedule.exec();

                let subject = payload.subject;
                if (payload.replacement !== null) {
                    if (!moment(payload.replacement.date, 'DD.MM.YYYY').isSame(moment(), 'days')) return;

                    Logger.info(`Found replacement for #${subject.subjectId} to #${payload.replacement.replacingSubject}`);
                    subject = (await payload.replacement.populate('payload.subject').execPopulate()).payload.subject;

                    if (payload.replacement.teacher) subject.teacher = payload.replacement.teacher;
                    if (payload.replacement.location) subject.location = payload.replacement.location;
                }

                Logger.info(`Sending notification about subject #${subject.subjectId}...`);

                const message = [`⌚ Через 5 минут начнется ${subject.name}`, ``, `🧭 Кабинет: ${subject.location}`, `🧑‍ Преподаватель: ${subject.teacher}`];

                const subjectHomeworks = (await subject.populate('payload.homeworks').execPopulate()).payload.homeworks;
                const homeworkNumbers: number[] = [];
                subjectHomeworks.forEach((homework) => {
                    if (homework.deadline === moment().format('DD.MM.YYYY')) {
                        homeworkNumbers.push(homework.homeworkId);
                    }
                });

                if (homeworkNumbers.length > 0) {
                    message.push(`\n⚠ По этому предмету было необходимо сделать домашнее задание #${homeworkNumbers.join(', #')}`, `Для просмотра домашнего задания используйте /дз ${subject.subjectId}`);
                }

                await Broadcaster.broadcastMessage(message.join(`\n`));
                done();
            });

            await this.agenda.start();

            const schedule = await schedules
                .findOne({
                    subjectTime: time.timeId,
                    subjectDay: moment().isoWeekday(),
                })
                .exec();
            const hM = moment(time.timeStarts, 'HH:mm').subtract({ minute: 5 }).format('H:m').split(':');

            await this.agenda.every(`${hM[1]} ${hM[0]} * * *`, jobName);
        }
    }

    async reload() {
        await this.agenda.stop();
        await this.execute();
    }

    async execute() {
        await this.createJobs();
        await Cleaner.cleanAll();
        const jobs = await this.agenda.jobs({ name: /^schedule_time / });
        Logger.info(`Registered ${jobs.length} schedules.`);
    }
}
