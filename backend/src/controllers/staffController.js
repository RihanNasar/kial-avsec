const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const AppError = require("../utils/AppError");
const { isExpired, isExpiringSoon } = require("../utils/dateHelpers");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Get staff dashboard (for individual staff member)
 */
exports.getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const staff = await prisma.staff.findUnique({
      where: { userId },
      include: {
        entity: true,
        certificates: true,
        user: true,
      },
    });

    if (!staff) {
      return next(new AppError("Staff profile not found", 404));
    }

    // Add status to each certificate
    const certificatesWithStatus = staff.certificates.map((cert) => ({
      ...cert,
      isExpired: isExpired(cert.validTo),
      isExpiringSoon: isExpiringSoon(cert.validTo, 30),
    }));

    res.json({
      success: true,
      data: {
        ...staff,
        certificates: certificatesWithStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update staff profile
 */
exports.updateMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { fullName, designation, aadhaarNumber, department } = req.body;

    const staff = await prisma.staff.findUnique({
      where: { userId },
    });

    if (!staff) {
      return next(new AppError("Staff profile not found", 404));
    }

    const updated = await prisma.staff.update({
      where: { id: staff.id },
      data: {
        fullName,
        designation,
        aadhaarNumber,
        department,
      },
      include: {
        entity: true,
        certificates: true,
      },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get my certificates
 */
exports.getMyCertificates = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const staff = await prisma.staff.findUnique({
      where: { userId },
    });

    if (!staff) {
      return next(new AppError("Staff profile not found", 404));
    }

    const certificates = await prisma.certificate.findMany({
      where: { staffId: staff.id },
      orderBy: { validTo: "asc" },
    });

    const certificatesWithStatus = certificates.map((cert) => ({
      ...cert,
      isExpired: isExpired(cert.validTo),
      isExpiringSoon: isExpiringSoon(cert.validTo, 30),
    }));

    res.json({
      success: true,
      data: certificatesWithStatus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new certificate (submit for approval)
 */
exports.createCertificate = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, number, issuedBy, validFrom, validTo, documentUrl } = req.body;

    // Get staff profile
    const staff = await prisma.staff.findUnique({
      where: { userId },
    });

    if (!staff) {
      return next(new AppError("Staff profile not found", 404));
    }

    // Create certificate with PENDING status
    const certificate = await prisma.certificate.create({
      data: {
        staffId: staff.id,
        type,
        number,
        issuedBy,
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        documentUrl,
        status: "PENDING",
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: `Certificate created: ${type}`,
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
    const userId = req.user.id;
    const { id } = req.params;
    const { type, number, issuedBy, validFrom, validTo, documentUrl } = req.body;

    // Get staff profile
    const staff = await prisma.staff.findUnique({
      where: { userId },
    });

    if (!staff) {
      return next(new AppError("Staff profile not found", 404));
    }

    // Verify certificate belongs to this staff
    const existing = await prisma.certificate.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return next(new AppError("Certificate not found", 404));
    }

    if (existing.staffId !== staff.id) {
      return next(new AppError("You can only update your own certificates", 403));
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
      message: "Certificate updated and resubmitted for CSO approval",
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
    const userId = req.user.id;
    const { id } = req.params;

    // Get staff profile
    const staff = await prisma.staff.findUnique({
      where: { userId },
    });

    if (!staff) {
      return next(new AppError("Staff profile not found", 404));
    }

    // Verify certificate belongs to this staff
    const certificate = await prisma.certificate.findUnique({
      where: { id: parseInt(id) },
    });

    if (!certificate) {
      return next(new AppError("Certificate not found", 404));
    }

    if (certificate.staffId !== staff.id) {
      return next(new AppError("You can only delete your own certificates", 403));
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
