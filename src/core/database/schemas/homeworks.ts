import mongoose from 'mongoose';

export default new mongoose.Schema({
    homeworkId: {
        type: Number,
        required: true,
        unique: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Subjects',
    },
    target: {
        description: {
            type: String,
            required: true,
        },
        files: {
            photos: {
                type: [String],
                required: false,
            },
            documents: {
                type: [String],
                required: false,
            }
        }
    },
    expiresAt: {
        type: Date,
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
});