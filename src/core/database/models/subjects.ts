import mongoose from 'mongoose';
import { IHomeworks } from './homeworks';
import { ISchedules } from './schedules';
const AutoIncrement = require('mongoose-sequence')(mongoose);
export interface ISubjects extends mongoose.Document {
    subjectId: number
    name: string
    location: number
    teacher: string
    created?: Date
    payload?: {
        homeworks?: IHomeworks[],
        schedules?: ISchedules[],
    }
};

const subjects = new mongoose.Schema({
    subjectId: Number,
    name: {
        type: String,
        required: true,
    },
    location: {
        type: Number,
        required: true,
    },
    teacher: {
        type: String,
        required: true,
    },
    created: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

subjects.virtual('payload.homeworks', {
    ref: 'Homeworks',
    localField: 'subjectId',
    foreignField: 'subject',
    justOne: false,
});

subjects.virtual('payload.schedules', {
    ref: 'Schedules',
    localField: 'subjectId',
    foreignField: 'subjectId',
    justOne: false,
});

subjects.plugin(AutoIncrement, { inc_field: 'subjectId' });

export default mongoose.model<ISubjects>('Subjects', subjects);
