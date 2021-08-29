import { dbMemor } from "../../MongooseClient";
import mongoose from 'mongoose';
import toJSON from '../../plugins/toJSON';
const increment = require('mongoose-sequence')(mongoose);

export interface ISchedules extends mongoose.Document {
    [x: string]: any;
    scheduleId: number;
    subjectId: number;
    bellId: number;
    weekDay: number;
    isEvem: boolean;
    homeworks?: {
        [key: string]: any;
    };
    replacements?: {
        [key: string]: any;
    };
    subject?: {
        [key: string]: any;
    };
    bell?: {
        [key: string]: any;
    };
}

const scheduleSchema = new mongoose.Schema(
{
    scheduleId: Number,
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
    weekDay: {
        type: Number,
        min: 1,
        max: 7,
        required: true,
    },
    isEven: {
        type: Boolean,
        required: true,
    },
},
    {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
    }
);


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
