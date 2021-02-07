import mongoose from 'mongoose';
import { IReplacements } from './replacements';
import { ISubjects } from './subjects';
import { ISubjectTimes } from './subjectTimes';
const AutoIncrement = require('mongoose-sequence')(mongoose);

export interface ISchedules extends mongoose.Document {
    scheduleId: number;
    subjectId: number;
    subjectTime: number;
    subjectDay: number;
    isEven: boolean;
    created?: Date;
    payload?: {
        time?: ISubjectTimes;
        subject?: ISubjects;
        replacement?: IReplacements;
    };
}

const schedules = new mongoose.Schema(
    {
        scheduleId: Number,
        subjectId: {
            type: Number,
            required: true,
        },
        subjectTime: {
            type: Number,
            required: true,
        },
        subjectDay: {
            type: Number,
            min: 1,
            max: 7,
            required: true,
        },
        isEven: {
            type: Boolean,
            required: true,
        },
        created: {
            type: Date,
            default: Date.now,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

schedules.virtual('payload.time', {
    ref: 'SubjectTimes',
    localField: 'subjectTime',
    foreignField: 'timeId',
    justOne: true,
});

schedules.virtual('payload.subject', {
    ref: 'Subjects',
    localField: 'subjectId',
    foreignField: 'subjectId',
    justOne: true,
});

schedules.virtual('payload.replacement', {
    ref: 'Replacements',
    localField: 'scheduleId',
    foreignField: 'replacedSchedule',
    justOne: true,
});

schedules.plugin(AutoIncrement, { inc_field: 'scheduleId' });

export default mongoose.model<ISchedules>('Schedules', schedules);
