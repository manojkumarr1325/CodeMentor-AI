import express from "express";
import { generateTitle } from "../services/titleService.js";

const router = express.Router();

router.post("/", async (req,res)=>{

    try{

        const {question}=req.body;

        const title=await generateTitle(question);

        res.json({title:title.trim()});

    }

    catch(err){

        res.status(500).json({

            title:"New Chat"

        });

    }

});

export default router;