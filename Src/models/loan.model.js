import mongoose from "mongoose";

const loanSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
    },
    subcategory: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    loanPeriod: {
        type: String,
        required: true,
    },
    guarantors: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Guarantor",
        }
    ]
});

export default mongoose.model("Loan", loanSchema);
