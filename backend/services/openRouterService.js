import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

console.log(
    "OpenRouter Key Loaded:",
    process.env.OPENROUTER_API_KEY ? "YES" : "NO"
);

const client = new OpenAI({

    apiKey: process.env.OPENROUTER_API_KEY,

    baseURL: "https://openrouter.ai/api/v1"

});

const MODEL = "deepseek/deepseek-chat";

export async function callOpenRouter(messages = []) {

    try {

        const response =
            await client.chat.completions.create({

                model: MODEL,

                messages,

                max_tokens: 2048,

                temperature:0.3

            });

        return response.choices[0].message.content;

    }

    catch(err){

        console.error("========== OPENROUTER ERROR ==========");
        console.error(err);

        throw err;

    }

}