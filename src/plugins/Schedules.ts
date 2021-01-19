import Agenda from 'agenda';
import moment from 'moment';
import mongoose from 'mongoose';
import { BasePlugin } from '../core/classes/BasePlugin';
import homeworks from '../core/database/models/homeworks';
import replacements from '../core/database/models/replacements';
import schedules from '../core/database/models/schedules';
import subjects from '../core/database/models/subjects';
import subjectTimes from '../core/database/models/subjectTimes';
import Broadcaster from '../core/utils/Broadcaster';
import Logger from '../core/utils/Logger';

export default class extends BasePlugin {
    agenda: Agenda;

    constructor() {
        super();
        this.agenda = new Agenda().mongo(mongoose.connection.db);
    }

    async createJobs() {
        const currentJobs = await this.agenda.jobs({ name: /^schedule / });

        for (const job of currentJobs) {
          const schedule = await schedules.findOne({ scheduleId: job.attrs.name.split(/^schedule /).pop() }).exec();
            if (schedule === null) {
                Logger.error(`Job ${job.attrs.name} was removed because it uses scheduleId that doesn't exist anymore.`);
                job.remove();
                continue;
            }
        }

        const availableSchedules: any = await schedules.find().exec();

        for (const schedule of availableSchedules) {

            const jobName = `schedule ${schedule.scheduleId}`;

            const subjectTime: any = await subjectTimes.findOne({ timeId: schedule.subjectTime }).exec();
            const hM = moment(subjectTime.timeStarts, 'HH:mm').subtract({minute: 5}).format('HH:mm').split(':');

            this.agenda.define(jobName, async (job, done) => {
                let subject: any = await subjects.findOne({ subjectId: schedule.subjectId }).exec();

                const replacement: any = await replacements.findOne({ replacedSchedule: schedule.scheduleId }).exec();
                if (replacement !== null) {
                    Logger.info(`Found replacement for #${subject.subjectId} to #${replacement.replacingSubject}`);
                    subject = await subjects.findOne({
                        subjectId: replacement.replacingSubject,
                        date: moment(Date.now()).format('DD.MM.YYYY')
                    }).exec();
                }

                Logger.info(`Sending notification about subject #${subject.subjectId}...`);

                const message = [
                    `⌚ Через 5 минут начнется ${subject.name}`,
                    ``,
                    `🧭 Кабинет: ${subject.location}`,
                    `🧑‍ Преподаватель: ${subject.teacher}`
                ];

                const homework: any = await homeworks.find({ subject: subject.subjectId, deadline: moment().format('DD.MM.YYYY') }).exec();
                if (homework.length > 0) {
                    message.push(`\n💥 По этому предмету было необходимо сделать домашнее задание!`);
                }

                Broadcaster.broadcastMessage(message.join(`\n`));
                done();
            });

            await this.agenda.start();

            this.agenda.every(`*/3 * * * ${schedule.subjectDay}`, jobName);
        }
    }

    async execute() {
        await this.createJobs();
        const jobs = await this.agenda.jobs({ name: /^schedule / });
        Logger.info(`Registered ${jobs.length} schedules.`)
    }
}
