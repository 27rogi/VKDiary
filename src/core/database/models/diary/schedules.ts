import { dbMemor } from '../../MongooseClient';
import mongoose from 'mongoose';
import toJSON from '../../plugins/toJSON';
const increment = require('mongoose-sequence')(mongoose);

export interface ISchedules extends mongoose.Document {
    [x: string]: any;
    scheduleId: number;
    weekDate: string;
    days?: {
        [key: string]: any;
    };
}

const replacementSchema = new mongoose.Schema({
    subjectId: {
        type: Number,
        required: true,
    },
    teacher: {
        type: String,
        required: false,
    },
    location: {
        type: String,
        required: false,
    },
});

const scheduleSubjectsSchema = new mongoose.Schema(
    {
        subjectId: {
            type: Number,
            required: true,
            trim: true,
        },
        bellId: {
            type: Number,
            required: true,
            trim: true,
        },
        replacement: {
            type: replacementSchema,
            required: false,
        },
    },
    {
        toJSON: {
            virtuals: true,
        },
    }
);

const scheduleDaySchema = new mongoose.Schema({
    subjects: [scheduleSubjectsSchema],
});

const scheduleDaysSchema = new mongoose.Schema({
    1: {
        type: scheduleDaySchema,
    },
    2: {
        type: scheduleDaySchema,
    },
    3: {
        type: scheduleDaySchema,
    },
    4: {
        type: scheduleDaySchema,
    },
    5: {
        type: scheduleDaySchema,
    },
    6: {
        type: scheduleDaySchema,
    },
    7: {
        type: scheduleDaySchema,
    },
});

const scheduleSchema = new mongoose.Schema({
    scheduleId: Number,
    weekDate: {
        type: String,
        required: true,
    },
    days: {
        type: scheduleDaysSchema,
        required: true,
    },
});

// use automatic incrementation for easier accessibility
scheduleSchema.plugin(increment, { inc_field: 'scheduleId' });

scheduleSchema.virtual('subject', {
    ref: 'Subjects',
    localField: 'subjectId',
    foreignField: 'subjectId',
    justOne: true,
});

scheduleSchema.virtual('bell', {
    ref: 'Bells',
    localField: 'bellId',
    foreignField: 'bellId',
    justOne: true,
});

scheduleSchema.virtual('replacements', {
    ref: 'Replacements',
    localField: 'scheduleId',
    foreignField: 'replacedSchedule',
    justOne: false,
});

scheduleSchema.virtual('homeworks', {
    ref: 'Homeworks',
    localField: 'subjectId',
    foreignField: 'subjectId',
    justOne: false,
});

/**
 * @typedef Schedule
 */
const Schedule = dbMemor.model<ISchedules>('Schedules', scheduleSchema, 'schedules');

export default Schedule;
