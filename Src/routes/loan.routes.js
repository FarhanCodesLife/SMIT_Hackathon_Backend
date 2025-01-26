import express from "express";
import { createLoan, addGuarantorToLoan, removeGuarantorFromLoan, getAllLoans, getLoanById, updateLoan, deleteLoan } from "../controllers/loan.controllers.js";

const router = express.Router();

// Route to create a new loan
router.post("/loans", createLoan);

// Route to add a guarantor to a loan
router.post("/loans/add-guarantor", addGuarantorToLoan);

// Route to remove a guarantor from a loan
router.post("/loans/remove-guarantor", removeGuarantorFromLoan);

// Route to get all loans
router.get("/loans", getAllLoans);

// Route to get loan details by ID
router.get("/loans/:id", getLoanById);

// Route to update loan details
router.put("/loans/:id", updateLoan);

// Route to delete a loan
router.delete("/loans/:id", deleteLoan);

export default router;
