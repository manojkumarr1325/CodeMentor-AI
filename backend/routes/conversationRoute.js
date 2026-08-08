import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
    saveConversation,
    getUserConversations,
    getConversationById,
    deleteConversation,
    clearHistory
} from "../services/conversationService.js";

const router = express.Router();

// ================= Save =================

router.post("/save", authMiddleware, async (req, res) => {

    try {

        const conversation = await saveConversation({

            conversationId: req.body.conversationId,

            user: req.user.id,

            tool: req.body.tool,

            title: req.body.title,

            language: req.body.language,

            messages: req.body.messages

        });

        res.status(201).json(conversation);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });

    }

});

// ================= History =================

router.get("/history", authMiddleware, async (req, res) => {

    try {

        const tool = req.query.tool || null;

        const history =
            await getUserConversations(
                req.user.id,
                tool
            );

        res.json(history);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });

    }

});

// ================= Get One =================

router.get("/:id", authMiddleware, async (req, res) => {

    try {

        const conversation =
            await getConversationById(
                req.params.id,
                req.user.id
            );

        if (!conversation) {

            return res.status(404).json({
                message: "Conversation not found"
            });

        }

        res.json(conversation);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });

    }

});

// ================= Delete =================

router.delete("/clear", authMiddleware, async (req, res) => {
    try {
        await clearHistory(req.user.id);

        res.json({
            message: "History cleared successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: error.message
        });
    }
});

router.delete("/:id", authMiddleware, async (req, res) => {

    try {

        const deleted =
            await deleteConversation(
                req.params.id,
                req.user.id
            );

        if (!deleted) {

            return res.status(404).json({
                message: "Conversation not found"
            });

        }

        res.json({
            message: "Conversation deleted"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });

    }

});

export default router;


// ================= Clear All =================

router.delete("/clear", authMiddleware, async (req, res) => {

    try {

        await clearHistory(req.user.id);

        res.json({
            message: "History cleared successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });

    }

});
