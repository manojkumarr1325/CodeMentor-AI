import {connectDB} from "./config/database.js";

//import dns from "dns";

//dns.setDefaultResultOrder("ipv4first");
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import solveRoute from "./routes/solveRoute.js";
import debugRoute from "./routes/debugRoute.js";
import complexityRoute from "./routes/complexityRoute.js";
import testcaseRoute from "./routes/testcaseRoute.js";
import titleRoute from "./routes/titleRoute.js";
import authRoute from "./routes/authRoute.js";
import algorithmRoute from "./routes/algorithmRoute.js";
import conversationRoute from "./routes/conversationRoute.js";

const app = express();


app.use(cors({

    origin: [
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        process.env.FRONTEND_URL
    ],

    credentials: true

}));

app.use(express.json({ limit: "5mb" }));

app.use("/solve", solveRoute);

app.use("/debug", debugRoute);

app.use("/complexity", complexityRoute);

app.use("/testcases", testcaseRoute);

app.use("/title",titleRoute);

app.use("/auth", authRoute);

app.use("/algorithm", algorithmRoute);

app.use("/conversation", conversationRoute);

app.get("/", (req, res) => {

    res.send("🚀 CodeMentor AI Backend Running");

});

app.get("/health",(req,res)=>{

    res.json({

        status:"OK",

        service:"CodeMentor AI",

        environment:
        process.env.NODE_ENV || "development",

        aiProvider:
        process.env.AI_PROVIDER || "unknown"

    });

});


const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(
    `🚀 Server running on port ${PORT}`
);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
}

startServer();
