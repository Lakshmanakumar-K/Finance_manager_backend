import express from "express"
import { userModel } from "../model/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

export const usersRouter = express.Router();

usersRouter.post("/signup", async (req, res) => {
    let { name, email, phone, password } = req.body;
    const userExist = await userModel.findOne({ $or: [{ email }, { phone }] });
    if (userExist) {
        res.status(403).json({ msg: "User already exist" })
    }
    else {
        try {
            bcrypt.hash(password, 10, async (err, hash) => {
                if (err) {
                    res.status(400).json({ msg: `Error - ${err}` });
                }
                else {
                    console.log(hash);
                    password = hash;
                    const user = new userModel({ name, email, phone, password });
                    const savedUser = await user.save();
                    res.status(201).json({ msg: "user Registered successfully, please try to login now" });
                }
            });
        }
        catch (e) {
            res.status(500).json({ msg: `server error - ${e}` });
        }
    }
});

usersRouter.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email }, { __v: 0 });

    if (user == null) {
        res.status(400).json({ msg: "user not exist or entered invalid mailId" });
    }
    else {
        const userObj = user.toObject();
        bcrypt.compare(password, userObj.password, (err, result) => {
            if (err) {
                res.status(400).json({ msg: `Error - ${err}` });
            }
            else if (result) {
                delete userObj.password;
                const token = jwt.sign(userObj, process.env.JWT_SECRET, {
                    expiresIn: "1d",
                });
                res.status(200).json({ msg: "User logged in successfully", userObj, token });
            } else {
                res.status(400).json({ msg: "Incorrect password " });
            }
        });
    }
})

