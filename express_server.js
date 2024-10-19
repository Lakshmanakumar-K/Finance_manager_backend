import express from "express"
import { connectViaMongoose } from "./db_utils/mongoose.js"
import { usersRouter } from "./routes/auth.js"
import cors from "cors"
import { transactionsRouter } from "./routes/transactions.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();


const server = express();
const PORT = 3000;

server.use(express.json());
server.use(cors());

const verifyAuthorization = (req, res, next) => {

    const token = req.headers["auth-token"];

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedPayload) => {
            if (err) {
                console.log(err);
                res.status(403).json({ msg: "Invalid Token" });
            } else {
                next();
            }
        });
    } else {
        res.status(403).json({ msg: "Unauthorized" });
    }
};

server.use("/auth", usersRouter);
server.use("/transactions", verifyAuthorization, transactionsRouter);

await connectViaMongoose();

server.listen(PORT, () => {
    console.log("server listening on port 3000")
});