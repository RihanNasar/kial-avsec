const express = require("express");
const router = express.Router();
const approvalController = require("../controllers/approvalController");
const { restrictTo } = require("../middleware/roleMiddleware");

// Get pending approvals
router.get(
  "/pending",
  restrictTo("CSO"),
  approvalController.getPendingApprovals
);

// Get approval history
router.get(
  "/history",
  restrictTo("CSO"),
  approvalController.getApprovalHistory
);

// Approve or reject certificate
router.put("/:id", restrictTo("CSO"), approvalController.approveCertificate);

module.exports = router;
