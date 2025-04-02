import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    
   availability: [
    {
      day: { type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
      date: { type: Date },
      slots: [{ startTime: String, endTime: String }], // Multiple slots per day
    },
  ],
    
    createdEvents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event"
    }],

    attendingEvents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event"
    }],
    photoUrl:{
        type: String
    }

}, { timestamps: true });

export default mongoose.model("User", userSchema);
