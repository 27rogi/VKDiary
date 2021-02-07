import Agenda from 'agenda';
import moment from 'moment';
import mongoose from 'mongoose';
import { BasePlugin } from '../core/classes/BasePlugin';
import schedules from '../core/database/models/schedules';
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
        const currentJobs = await this.agenda.jobs({ name: /^schedule / });

        for (const job of currentJobs) {
            const schedule = await schedules
                .findOne({
                    scheduleId: Number(job.attrs.name.split(/^schedule /).pop()),
                })
                .exec();
            if (schedule === null) {
                Logger.error(`Job ${job.attrs.name} was removed because it uses scheduleId that doesn't exist anymore.`);
                await job.remove();
                continue;
            }
        }

        const availableSchedules = await schedules.find().exec();

        for (const schedule of availableSchedules) {
            const jobName = `schedule ${schedule.scheduleId}`;

            this.agenda.define(jobName, async (job, done) => {
                let subject = (await schedule.populate('payload.subject').execPopulate()).payload.subject;

                const replacement = (await schedule.populate('payload.replacement').execPopulate()).payload.replacement;
                if (replacement !== null) {
                    if (!moment(replacement.date, 'DD.MM.YYYY').isSame(moment(), 'days')) return;

                    Logger.info(`Found replacement for #${subject.subjectId} to #${replacement.replacingSubject}`);
                    subject = (await replacement.populate('payload.subject').execPopulate()).payload.subject;

                    if (replacement.teacher) subject.teacher = replacement.teacher;
                    if (replacement.location) subject.location = replacement.location;
                }

                if (schedule.isEven !== Time.isEvenWeek(moment())) {
                    return;
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

            const subjectTime = await subjectTimes.findOne({ timeId: schedule.subjectTime }).exec();
            const hM = moment(subjectTime.timeStarts, 'HH:mm').subtract({ minute: 5 }).format('H:m').split(':');

            await this.agenda.every(`${hM[1]} ${hM[0]} * * ${schedule.subjectDay}`, jobName);
        }
    }

    async reload() {
        await this.agenda.stop();
        await this.execute();
    }

    async execute() {
        await this.createJobs();
        await Cleaner.cleanAll();
        const jobs = await this.agenda.jobs({ name: /^schedule / });
        Logger.info(`Registered ${jobs.length} schedules.`);
    }
}
