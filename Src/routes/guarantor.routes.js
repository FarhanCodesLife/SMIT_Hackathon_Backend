import express from "express";
import {
  createGuarantor,
  getAllGuarantors,
  getGuarantorById,
  updateGuarantor,
  deleteGuarantor,
  getGuarantorsForLoan,
} from "../controllers/guarantor.controlers.js";

const router = express.Router();

// Create a new guarantor
router.post("/guarantors", createGuarantor);

// Get all guarantors
router.get("/guarantors", getAllGuarantors);

// Get a single guarantor by ID
router.get("/guarantors/:id", getGuarantorById);

// Update a guarantor's details
router.put("/guarantors/:id", updateGuarantor);

// Delete a guarantor by ID
router.delete("/guarantors/:id", deleteGuarantor);

// Get guarantors for a specific loan
router.get("/guarantors/loan/:loanId", getGuarantorsForLoan);

export default router;
