import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema(
  {
    title: {
        type: String, 
        required: true 
    },
    description: {
      type: String
    },
    date: {
        type: Date,
        required: true
    },
    duration: {
      type: Number,
      required: true
    },
    organizer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    participants: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" }
    }],
    eventLink: {
        type: String,
        required: true
    },
    status: {
      type: String,
      enum: ["pending", "approved", "canceled"],
      default: "pending",
    },
    password: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

export default mongoose.model("Event", EventSchema);
