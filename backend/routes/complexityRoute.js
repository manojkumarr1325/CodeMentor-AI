import express from "express";
import { analyzeComplexity } from "../services/complexityService.js";

const router = express.Router();

router.post("/", async (req, res) => {

    try {

        const {
            code,
            language,
            messages = []
        } = req.body;

        if (!code) {

            return res.status(400).json({
                answer: "Code is required."
            });

        }

        const answer = await analyzeComplexity(
            code,
            language,
            messages
        );

        res.json({ answer });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({
            answer: err.message
        });

    }

});

export default router;