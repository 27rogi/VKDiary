import mongoose from 'mongoose';
import { ISchedules } from './schedules';
import { ISubjects } from './subjects';
const AutoIncrement = require('mongoose-sequence')(mongoose);

export interface IReplacements extends mongoose.Document {
    replacementId: number;
    replacedSchedule: number;
    replacingSubject: number;
    date: string;
    payload?: {
        schedule?: ISchedules;
        subject?: ISubjects;
    };
    teacher?: string;
    location?: number;
}

const replacements = new mongoose.Schema(
    {
        replacementId: Number,
        replacedSchedule: {
            type: Number,
            required: true,
        },
        replacingSubject: {
            type: Number,
            required: true,
        },
        date: {
            type: String,
            required: true,
        },
        teacher: {
            type: String,
        },
        location: {
            type: Number,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

replacements.virtual('payload.schedule', {
    ref: 'Schedules',
    localField: 'replacedSchedule',
    foreignField: 'scheduleId',
    justOne: true,
});

replacements.virtual('payload.subject', {
    ref: 'Subjects',
    localField: 'replacingSubject',
    foreignField: 'subjectId',
    justOne: true,
});

replacements.plugin(AutoIncrement, { inc_field: 'replacementId' });

export default mongoose.model<IReplacements>('Replacements', replacements);
