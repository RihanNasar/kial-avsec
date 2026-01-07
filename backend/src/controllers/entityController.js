const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const AppError = require("../utils/AppError");
const { isExpired, isExpiringSoon } = require("../utils/dateHelpers");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Get entity dashboard (for Entity Head)
 */
exports.getEntityDashboard = async (req, res, next) => {
  try {
    const entityId = req.user.entityId;

    if (!entityId) {
      return next(new AppError("No entity associated with this user", 404));
    }

    const entity = await prisma.entity.findUnique({
      where: { id: entityId },
      include: {
        staffMembers: {
          include: {
            certificates: true,
          },
        },
        ascoUser: true,
      },
    });

    if (!entity) {
      return next(new AppError("Entity not found", 404));
    }

    // Calculate compliance stats
    let expiredCount = 0;
    let expiringSoonCount = 0;
    let validCount = 0;
    let pendingCount = 0;

    entity.staffMembers.forEach((staff) => {
      staff.certificates.forEach((cert) => {
        if (cert.status === "PENDING") {
          pendingCount++;
        } else if (cert.status === "APPROVED") {
          if (isExpired(cert.validTo)) {
            expiredCount++;
          } else if (isExpiringSoon(cert.validTo, 30)) {
            expiringSoonCount++;
          } else {
            validCount++;
          }
        }
      });
    });

    res.json({
      success: true,
      data: {
        entity,
        compliance: {
          expired: expiredCount,
          expiringSoon: expiringSoonCount,
          valid: validCount,
          pending: pendingCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all staff for entity
 */
exports.getMyStaff = async (req, res, next) => {
  try {
    const entityId = req.user.entityId;

    if (!entityId) {
      return next(new AppError("No entity associated with this user", 404));
    }

    const staff = await prisma.staff.findMany({
      where: { entityId },
      include: {
        certificates: true,
        user: true,
      },
      orderBy: { fullName: "asc" },
    });

    res.json({
      success: true,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add or update staff member
 */
exports.upsertStaff = async (req, res, next) => {
  try {
    const entityId = req.user.entityId;
    const { id, ...data } = req.body;

    // Ensure staff belongs to this entity
    data.entityId = entityId;

    let staff;
    if (id) {
      // Verify ownership
      const existing = await prisma.staff.findUnique({
        where: { id: parseInt(id) },
      });

      if (existing.entityId !== entityId) {
        return next(new AppError("You can only edit your own staff", 403));
      }

      staff = await prisma.staff.update({
        where: { id: parseInt(id) },
        data,
        include: { certificates: true },
      });
    } else {
      staff = await prisma.staff.create({
        data,
        include: { certificates: true },
      });
    }

    res.json({
      success: true,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all certificates for entity staff
 */
exports.getMyCertificates = async (req, res, next) => {
  try {
    const entityId = req.user.entityId;

    if (!entityId) {
      return next(new AppError("No entity associated with this user", 404));
    }

    const certificates = await prisma.certificate.findMany({
      where: {
        staff: {
          entityId,
        },
      },
      include: {
        staff: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create certificate for entity staff (submit for approval)
 */
exports.createCertificate = async (req, res, next) => {
  try {
    const entityId = req.user.entityId;
    const { staffId, type, number, issuedBy, validFrom, validTo, documentUrl } = req.body;

    if (!entityId) {
      return next(new AppError("No entity associated with this user", 404));
    }

    // Verify staff belongs to this entity
    const staff = await prisma.staff.findUnique({
      where: { id: parseInt(staffId) },
    });

    if (!staff || staff.entityId !== entityId) {
      return next(new AppError("Staff not found or doesn't belong to your entity", 403));
    }

    // Create certificate with PENDING status
    const certificate = await prisma.certificate.create({
      data: {
        staffId: parseInt(staffId),
        type,
        number,
        issuedBy,
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        documentUrl,
        status: "PENDING",
      },
      include: {
        staff: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: `Certificate created for ${staff.fullName}: ${type}`,
        userId: req.user.id,
        entityType: "Certificate",
        entityId: certificate.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Certificate submitted for CSO approval",
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update certificate (resubmit for approval)
 */
exports.updateCertificate = async (req, res, next) => {
  try {
    const entityId = req.user.entityId;
    const { id } = req.params;
    const { type, number, issuedBy, validFrom, validTo, documentUrl } = req.body;

    if (!entityId) {
      return next(new AppError("No entity associated with this user", 404));
    }

    // Verify certificate belongs to entity staff
    const existing = await prisma.certificate.findUnique({
      where: { id: parseInt(id) },
      include: {
        staff: true,
      },
    });

    if (!existing) {
      return next(new AppError("Certificate not found", 404));
    }

    if (existing.staff.entityId !== entityId) {
      return next(new AppError("You can only update certificates for your entity staff", 403));
    }

    // Update certificate and reset to PENDING
    const updated = await prisma.certificate.update({
      where: { id: parseInt(id) },
      data: {
        type,
        number,
        issuedBy,
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        documentUrl,
        status: "PENDING",
      },
      include: {
        staff: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: `Certificate updated: ${type}`,
        userId: req.user.id,
        entityType: "Certificate",
        entityId: updated.id,
      },
    });

    res.json({
      success: true,
      message: "Certificate updated and resubmitted for approval",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete certificate
 */
exports.deleteCertificate = async (req, res, next) => {
  try {
    const entityId = req.user.entityId;
    const { id } = req.params;

    if (!entityId) {
      return next(new AppError("No entity associated with this user", 404));
    }

    // Verify certificate belongs to entity staff
    const certificate = await prisma.certificate.findUnique({
      where: { id: parseInt(id) },
      include: {
        staff: true,
      },
    });

    if (!certificate) {
      return next(new AppError("Certificate not found", 404));
    }

    if (certificate.staff.entityId !== entityId) {
      return next(new AppError("You can only delete certificates for your entity staff", 403));
    }

    // Delete certificate
    await prisma.certificate.delete({
      where: { id: parseInt(id) },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: `Certificate deleted: ${certificate.type}`,
        userId: req.user.id,
        entityType: "Certificate",
        entityId: certificate.id,
      },
    });

    res.json({
      success: true,
      message: "Certificate deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request certificate renewal
 */
exports.requestCertificateRenewal = async (req, res, next) => {
  try {
    const { certificateId, proposedValidTo, proposedDocUrl } = req.body;

    const certificate = await prisma.certificate.findUnique({
      where: { id: parseInt(certificateId) },
      include: {
        staff: true,
      },
    });

    if (!certificate) {
      return next(new AppError("Certificate not found", 404));
    }

    // Verify staff belongs to this entity
    if (certificate.staff.entityId !== req.user.entityId) {
      return next(new AppError("Unauthorized", 403));
    }

    const updated = await prisma.certificate.update({
      where: { id: parseInt(certificateId) },
      data: {
        proposedValidTo: new Date(proposedValidTo),
        proposedDocUrl,
        status: "PENDING",
      },
    });

    res.json({
      success: true,
      data: updated,
      message: "Renewal request submitted for approval",
    });
  } catch (error) {
    next(error);
  }
};
