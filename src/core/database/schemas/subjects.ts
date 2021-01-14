import mongoose from 'mongoose';
const AutoIncrement = require('mongoose-sequence')(mongoose);

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
