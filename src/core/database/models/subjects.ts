import mongoose from 'mongoose';
import { IHomeworks } from './homeworks';
const AutoIncrement = require('mongoose-sequence')(mongoose);
export interface ISubjects extends mongoose.Document {
    subjectId: number
    name: string
    location: number
    teacher: string
    created?: Date
    payload?: {
        homeworks?: IHomeworks[]
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
})

subjects.virtual('payload.homeworks', {
    ref: 'Homeworks',
    localField: 'subjectId',
    foreignField: 'subject',
    justOne: false,
});

subjects.plugin(AutoIncrement, { inc_field: 'subjectId' });

export default mongoose.model<ISubjects>('Subjects', subjects);
