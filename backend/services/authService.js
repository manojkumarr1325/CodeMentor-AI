import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ================= Register =================

export async function registerUser(
    username,
    email,
    password
) {

    const existingUser = await User.findOne({

        email: email.toLowerCase()

    });

    if (existingUser) {

        throw new Error("Email already registered.");

    }

    const hashedPassword =
        await bcrypt.hash(password, 10);

    const user = await User.create({

        username,

        email: email.toLowerCase(),

        password: hashedPassword

    });

    return {

        id: user._id,

        username: user.username,

        email: user.email

    };

}

// ================= Login =================

export async function loginUser(
    email,
    password
) {

    const user = await User.findOne({

        email: email.toLowerCase()

    });

    if (!user) {

        throw new Error(
            "Invalid email or password."
        );

    }

    const validPassword =
        await bcrypt.compare(
            password,
            user.password
        );

    if (!validPassword) {

        throw new Error(
            "Invalid email or password."
        );

    }

    const token = jwt.sign(

        {

            id: user._id,

            username: user.username,

            email: user.email

        },

        process.env.JWT_SECRET,

        {

            expiresIn: "7d"

        }

    );

    return {

        token,

        user: {

            id: user._id,

            username: user.username,

            email: user.email

        }

    };

}