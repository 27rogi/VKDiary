import mongoose from 'mongoose';
const AutoIncrement = require('mongoose-sequence')(mongoose);

export default new mongoose.Schema({
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
    }
}).plugin(AutoIncrement, {inc_field: 'replacementId'});;
