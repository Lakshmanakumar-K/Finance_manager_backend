import express from "express"
import { transactionModel } from "../model/Transactions.js"

export const transactionsRouter = express.Router();

transactionsRouter.post("/", async (req, res) => {
    const { userId, amount, type, category, date, others } = req.body;
    const transObj = new transactionModel({ userId, amount, type, category, date, others });
    try {
        const savedTransaction = await transObj.save();
        // const transaction = savedTransaction.toObject();
        // const {_id,__v,...rest}= transaction;
        res.status(200).json({ msg: "Transaction added successfully" });
    }
    catch (e) {
        res.status(500).json({ msg: `server error - ${e}` });
    }
});

transactionsRouter.get("/:id", async (req, res) => {
    const userId = req.params.id;
    try {
        const transactions = await transactionModel.find({ userId }, { __v: 0 });
        res.status(200).json(transactions);
    }
    catch (e) {
        res.status(500).json({ msg: `server error -${e}` });
    }
});

transactionsRouter.post("/filter/year", async (req, res) => {
    const { year, userId } = req.body;
    try {
        const transactions = await transactionModel.find({ userId, date: { $regex: year } }, { __v: 0 });
        if (transactions.length == 0) {
            res.status(400).json({ msg: `no transactions updated on year ${year}` });
        }
        else {
            res.status(201).json(transactions);
        }
    }
    catch (e) {
        res.status(500).json({ msg: `server error - ${e}` });
    }
});

transactionsRouter.post("/filter/year/month", async (req, res) => {
    const { year, month, userId } = req.body;
    try {
        const transactions = await transactionModel.find({ userId, date: { $regex: `${year}-${month}` } }, { __v: 0 });
        if (transactions.length == 0) {
            res.status(400).json({ msg: `no transactions updated on month ${month}` });
        }
        else {
            res.status(201).json(transactions);
        }
    }
    catch (e) {
        res.status(500).json({ msg: `server error - ${e}` });
    }
});

transactionsRouter.post("/filter/custom", async (req, res) => {
    const { fromdate, todate, userId } = req.body;
    try {
        const transactions = await transactionModel.find({ userId, date: { $gte: fromdate, $lte: todate } }, { __v: 0 }, { sort: { date: 1 } });
        console.log(transactions);
        if (transactions.length == 0) {
            res.status(400).json({ msg: `no transactions updated for timeperiod ${fromdate} to ${todate}` });
        }
        else {
            res.status(201).json(transactions);
        }
    }
    catch (e) {
        res.status(500).json({ msg: `server error - ${e}` });
    }
});

transactionsRouter.post("/update", async (req, res) => {
    const { _id, userId, ...userDetails } = req.body;
    try {
        await transactionModel.updateOne({ _id, userId }, { ...userDetails });
        res.status(200).json({ msg: "Transaction updated sucessfully" });
    }
    catch (e) {
        res.status(500).json({ msg: `server error - ${e}` });
    }
});

transactionsRouter.post("/delete", async (req, res) => {
    const { _id, userId } = req.body;
    try {
        await transactionModel.deleteOne({ _id, userId });
        res.status(200).json({ msg: "Transaction deleted sucessfully" });
    }
    catch (e) {
        res.status(500).json({ msg: `server error - ${e}` });
    }
});

transactionsRouter.post("/aggregate",async (req,res)=>{
    const { userId } = req.body;
    const total = await transactionModel.aggregate([{
        $match: { userId },
      },
      {
        $group: {
          _id: "$type",
          totalAmount: {
            $sum: "$amount",
          },
        },
      },
      {
        $project: {
          type: "$_id",
          totalAmount: 1,
          _id: 0,
        },
      },]);
      res.status(200).json(total);
})