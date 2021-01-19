import mongoose from 'mongoose';
const AutoIncrement = require('mongoose-sequence')(mongoose);

export default new mongoose.Schema({
    homeworkId: Number,
    subject: {
        type: Number,
        required: true,
    },
    target: {
        description: {
            type: String,
            required: true,
        },
        attachments: {
            type: String,
            required: false,
        }
    },
    deadline: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    creatorId: {
        type: Number,
        required: true,
    }
}).plugin(AutoIncrement, {inc_field: 'homeworkId'});
