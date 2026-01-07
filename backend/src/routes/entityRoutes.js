const express = require("express");
const router = express.Router();
const entityController = require("../controllers/entityController");
const { restrictTo } = require("../middleware/roleMiddleware");

// Dashboard for Entity Head
router.get(
  "/dashboard",
  restrictTo("ENTITY_HEAD"),
  entityController.getEntityDashboard
);

// Staff Management
router.get("/staff", restrictTo("ENTITY_HEAD"), entityController.getMyStaff);
router.post("/staff", restrictTo("ENTITY_HEAD"), entityController.upsertStaff);
router.put(
  "/staff/:id",
  restrictTo("ENTITY_HEAD"),
  entityController.upsertStaff
);

// Certificate Management - Full CRUD
router.get(
  "/certificates",
  restrictTo("ENTITY_HEAD"),
  entityController.getMyCertificates
);
router.post(
  "/certificates",
  restrictTo("ENTITY_HEAD"),
  entityController.createCertificate
);
router.put(
  "/certificates/:id",
  restrictTo("ENTITY_HEAD"),
  entityController.updateCertificate
);
router.delete(
  "/certificates/:id",
  restrictTo("ENTITY_HEAD"),
  entityController.deleteCertificate
);

// Certificate Renewal Requests
router.post(
  "/certificates/renew",
  restrictTo("ENTITY_HEAD"),
  entityController.requestCertificateRenewal
);

module.exports = router;
