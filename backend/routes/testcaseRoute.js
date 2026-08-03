import express from "express";
import { generateTestcases } from "../services/testcaseService.js";

const router = express.Router();

router.post("/", async (req, res) => {

    try {

        const { problem } = req.body;

        if (!problem) {

            return res.status(400).json({
                answer: "Problem statement is required."
            });

        }

        const answer = await generateTestcases(problem);

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