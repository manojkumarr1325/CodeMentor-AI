import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        }
    },
    { _id: false }
);

const conversationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        tool: {
            type: String,
            required: true
        },

        title: {
            type: String,
            default: "New Chat"
        },

        language: {
            type: String,
            default: "cpp"
        },

        messages: [messageSchema]
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Conversation", conversationSchema);