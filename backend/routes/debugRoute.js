import express from "express";
import { debugCode } from "../services/debugService.js";

const router = express.Router();


router.post("/", async (req, res) => {

    console.log("===== DEBUG ROUTE =====");
    console.log(req.body);


    try {

        const { code, language, messages = [] } = req.body;


        console.log("Code:", code);
        console.log("Language:", language);


        if (!code) {
            return res.status(400).json({
                answer: "Code is required."
            });
        }


        const answer = await debugCode(
            code,
            language,
            messages
        );


        console.log("AI Response received.");


        res.json({
            answer
        });


    } catch (err) {

        console.error("DEBUG ROUTE ERROR:");
        console.error(err);


        res.status(500).json({
            answer: err.message
        });

    }

});


export default router;