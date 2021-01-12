import mongoose from 'mongoose';

export default new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    subjectId: {
        type: Number,
        required: true,
        uniqie: true
    },
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
});
