import mongoose from 'mongoose';
const AutoIncrement = require('mongoose-sequence')(mongoose);

export interface ISubjects {
    subjectId: number,
    name: {
        type: string,
    },
    location: {
        type: number,
    },
    teacher: {
        type: string,
    },
    created?: {
        type: Date,
    }
}

export default new mongoose.Schema({
    subjectId: Number,
    name: {
        type: String,
    },
    location: {
        type: Number,
    },
    teacher: {
        type: String,
    },
    created: {
        type: Date,
        default: Date.now
    }
}).plugin(AutoIncrement, {inc_field: 'subjectId'});
