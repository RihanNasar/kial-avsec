const router = require("express").Router();
const upload = require("../middleware/uploadMiddleware");
const importController = require("../controllers/importController");
const adminController = require("../controllers/adminController");
const approvalController = require("../controllers/approvalController");
const { restrictTo } = require("../middleware/roleMiddleware");
const {
  paginationQuery,
  idParam,
  handleValidationErrors,
} = require("../middleware/validationMiddleware");

// Dashboard
router.get("/dashboard", restrictTo("CSO"), adminController.getDashboardStats);

// Entity Management
router.get(
  "/entities",
  restrictTo("CSO"),
  paginationQuery,
  handleValidationErrors,
  adminController.getAllEntities
);
router.get(
  "/entities/:id",
  restrictTo("CSO"),
  idParam,
  handleValidationErrors,
  adminController.getEntity
);
router.post("/entities", restrictTo("CSO"), adminController.upsertEntity);
router.put("/entities/:id", restrictTo("CSO"), adminController.upsertEntity);
router.delete("/entities/:id", restrictTo("CSO"), adminController.deleteEntity);

// Entity Certificates
router.post(
  "/entity-certificates",
  restrictTo("CSO"),
  adminController.createEntityCertificate
);

// Staff Management
router.get(
  "/staff",
  restrictTo("CSO"),
  paginationQuery,
  handleValidationErrors,
  adminController.getAllStaff
);
router.delete("/staff/:id", restrictTo("CSO"), adminController.deleteStaff);

// Certificate Management (CSO Full Access)
router.get(
  "/certificates",
  restrictTo("CSO"),
  approvalController.getAllCertificates
);
router.post(
  "/certificates",
  restrictTo("CSO"),
  approvalController.createCertificate
);
router.put(
  "/certificates/:id",
  restrictTo("CSO"),
  approvalController.updateCertificate
);
router.delete(
  "/certificates/:id",
  restrictTo("CSO"),
  approvalController.deleteCertificate
);

// Approvals
router.get(
  "/approvals/pending",
  restrictTo("CSO"),
  approvalController.getPendingApprovals
);
router.get(
  "/approvals/history",
  restrictTo("CSO"),
  approvalController.getApprovalHistory
);
router.put(
  "/approvals/:id",
  restrictTo("CSO"),
  approvalController.approveCertificate
);

// Data Import
router.post(
  "/import/entities",
  restrictTo("CSO"),
  upload.single("file"),
  importController.uploadEntityReport
);

router.post(
  "/import/kial-staff",
  restrictTo("CSO"),
  upload.single("file"),
  importController.uploadKialStaff
);

router.post(
  "/import/entity-staff/:entityId",
  restrictTo("CSO"),
  upload.single("file"),
  importController.uploadEntityStaff
);

module.exports = router;
