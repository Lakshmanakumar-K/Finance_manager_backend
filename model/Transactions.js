import { Schema, model } from "mongoose"

const transactionSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    others: {
        type: String,
        required: false,
    },
});

export const transactionModel = new model("transaction",transactionSchema,"transactions");