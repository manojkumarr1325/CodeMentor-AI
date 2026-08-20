import express from "express";
import { algorithmService } from "../services/algorithmService.js";

const router = express.Router();

router.post("/", async (req, res) => {

    console.log("✅ Algorithm route hit");
    console.log(req.body);

    try {

        const { question, messages } = req.body;

        const answer = await algorithmService(
            question,
            language,
            messages || []
        );

        res.json({ answer });

    } catch (err) {

        console.error("Algorithm Error:", err);
    
        if (err.status === 503 || err?.error?.code === 503) {
            return res.status(503).json({
                answer: "⚠️ Gemini AI is currently overloaded. Please try again in a minute."
            });
        }
    
        res.status(500).json({
            answer: "Internal Server Error"
        });
    
    }

});

export default router;
