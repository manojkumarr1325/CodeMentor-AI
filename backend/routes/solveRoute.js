import express from "express";
import { solveProblem } from "../services/solveService.js";

const router = express.Router();

router.post("/", async (req, res) => {

    try {

        const {

            problem,
            language,
            messages = []

        } = req.body;

        if (!problem) {

            return res.status(400).json({

                answer: "Problem statement is required."

            });

        }

        const answer = await solveProblem(

            problem,
            language,
            messages

        );
        console.log("========== USER INPUT ==========");
        console.log(problem);
        console.log("================================");

        res.json({

            answer

        });

    }

    catch (err) {

        console.error("===== SOLVE ROUTE ERROR =====");
        console.error(err);

        res.status(500).json({
            answer: err.message
        });

    }

});

export default router;