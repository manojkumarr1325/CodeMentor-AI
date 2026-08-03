import express from "express";
import { registerUser, loginUser } from "../services/authService.js";

const router = express.Router();

/*
=========================
POST /auth/signup
=========================
*/
router.post("/signup", async (req, res) => {

    try {

        const { username, email, password } = req.body;

        if (!username || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });

        }

        const user = await registerUser(
            username,
            email,
            password
        );

        res.status(201).json({
            success: true,
            message: "Account created successfully.",
            user
        });

    } catch (err) {

        res.status(400).json({
            success: false,
            message: err.message
        });

    }

});

/*
=========================
POST /auth/login
=========================
*/
router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const result = await loginUser(email, password);

        res.json({
            success: true,
            message: "Login successful.",
            ...result
        });

    } catch (err) {

        res.status(401).json({
            success: false,
            message: err.message
        });

    }

});

export default router;