import mongoose from 'mongoose';
const AutoIncrement = require('mongoose-sequence')(mongoose);

export interface ISubjectTimes extends mongoose.Document {
    timeId: number,
    timeStarts: string
    timeEnds: string
    created: string
};

const subjectTimes = new mongoose.Schema({
    timeId: Number,
    timeStarts: {
        type: String,
        required: true
    },
    timeEnds: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
}).plugin(AutoIncrement, {inc_field: 'timeId'});

export default mongoose.model<ISubjectTimes>('SubjectTimes', subjectTimes);
