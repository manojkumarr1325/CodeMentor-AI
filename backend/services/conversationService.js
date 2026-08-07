import Conversation from "../models/Conversation.js";

// ================= Save / Update =================

export async function saveConversation(data) {

    const {
        conversationId,
        user,
        tool,
        title,
        language,
        messages
    } = data;

    // Update existing conversation
    if (conversationId) {

        const updated = await Conversation.findOneAndUpdate(
            {
                _id: conversationId,
                user
            },
            {
                tool,
                title,
                language,
                messages
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (updated) {
            return updated;
        }
    }

    // Create new conversation
    return await Conversation.create({
        user,
        tool,
        title,
        language,
        messages
    });

}

// ================= User History =================

export async function getUserConversations(userId, tool = null) {

    const query = {
        user: userId
    };

    if (tool) {
        query.tool = tool;
    }

    return await Conversation.find(query)
        .sort({
            updatedAt: -1
        });

}

// ================= Get One =================

export async function getConversationById(id, userId) {

    return await Conversation.findOne({
        _id: id,
        user: userId
    });

}

// ================= Delete =================

export async function deleteConversation(id, userId) {

    return await Conversation.findOneAndDelete({
        _id: id,
        user: userId
    });

}

// ================= Clear All =================

export async function clearHistory(userId) {

    return await Conversation.deleteMany({
        user: userId
    });

}
