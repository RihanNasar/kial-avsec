const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const AppError = require("../utils/AppError");
const { isExpired, isExpiringSoon } = require("../utils/dateHelpers");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Get dashboard statistics for CSO
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Total counts
    const totalEntities = await prisma.entity.count();
    const totalStaff = await prisma.staff.count();
    const totalCertificates = await prisma.certificate.count();

    // Expiry analysis
    const allCertificates = await prisma.certificate.findMany({
      where: { status: "APPROVED" },
      include: {
        staff: {
          include: {
            entity: true,
          },
        },
      },
    });

    let expiredCount = 0;
    let expiringSoonCount = 0;
    let validCount = 0;

    allCertificates.forEach((cert) => {
      if (isExpired(cert.validTo)) {
        expiredCount++;
      } else if (isExpiringSoon(cert.validTo, 30)) {
        expiringSoonCount++;
      } else {
        validCount++;
      }
    });

    // Pending approvals
    const pendingApprovals = await prisma.certificate.count({
      where: { status: "PENDING" },
    });

    // Recent activities
    const recentLogs = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { timestamp: "desc" },
      include: {
        user: true,
      },
    });

    res.json({
      success: true,
      data: {
        totals: {
          entities: totalEntities,
          staff: totalStaff,
          certificates: totalCertificates,
        },
        compliance: {
          expired: expiredCount,
          expiringSoon: expiringSoonCount,
          valid: validCount,
        },
        pendingApprovals,
        recentActivities: recentLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all entities with their compliance status
 */
exports.getAllEntities = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.entity.count();

    const entities = await prisma.entity.findMany({
      skip,
      take: limit,
      include: {
        ascoUser: true,
        staffMembers: {
          include: {
            certificates: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Add compliance status to each entity
    const entitiesWithStatus = entities.map((entity) => {
      let expired = 0;
      let expiringSoon = 0;
      let valid = 0;

      // Check entity-level dates
      if (isExpired(entity.contractValidTo)) expired++;
      else if (isExpiringSoon(entity.contractValidTo, 30)) expiringSoon++;

      if (isExpired(entity.securityClearanceTo)) expired++;
      else if (isExpiringSoon(entity.securityClearanceTo, 30)) expiringSoon++;

      if (isExpired(entity.securityProgramTo)) expired++;
      else if (isExpiringSoon(entity.securityProgramTo, 30)) expiringSoon++;

      // Check staff certificates
      entity.staffMembers.forEach((staff) => {
        staff.certificates.forEach((cert) => {
          if (cert.status !== "APPROVED") return;
          if (isExpired(cert.validTo)) expired++;
          else if (isExpiringSoon(cert.validTo, 30)) expiringSoon++;
          else valid++;
        });
      });

      return {
        ...entity,
        complianceStatus: {
          expired,
          expiringSoon,
          valid,
          overallStatus:
            expired > 0 ? "RED" : expiringSoon > 0 ? "AMBER" : "GREEN",
        },
      };
    });

    res.json({
      success: true,
      data: entitiesWithStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all staff members with their details
 */
exports.getAllStaff = async (req, res, next) => {
  try {
    const { entityId, search } = req.query;

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const where = {};
    if (entityId) where.entityId = parseInt(entityId);
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { empCode: { contains: search, mode: "insensitive" } },
        { aadhaarNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count with same filters
    const total = await prisma.staff.count({ where });

    const staff = await prisma.staff.findMany({
      where,
      skip,
      take: limit,
      include: {
        entity: true,
        certificates: true,
        user: true,
      },
      orderBy: { fullName: "asc" },
    });

    res.json({
      success: true,
      data: staff,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single entity by ID with all details
 */
exports.getEntity = async (req, res, next) => {
  try {
    const { id } = req.params;

    const entity = await prisma.entity.findUnique({
      where: { id: parseInt(id) },
      include: {
        ascoUser: true,
        certificates: {
          orderBy: { validTo: "asc" },
        },
        staffMembers: {
          include: {
            certificates: {
              orderBy: { validTo: "asc" },
            },
            user: true,
          },
          orderBy: { fullName: "asc" },
        },
      },
    });

    if (!entity) {
      return next(new AppError("Entity not found", 404));
    }

    res.json({
      success: true,
      data: entity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create entity certificate
 */
exports.createEntityCertificate = async (req, res, next) => {
  try {
    const { entityId, type, validFrom, validTo, docUrl } = req.body;

    const certificate = await prisma.entityCertificate.create({
      data: {
        entityId: parseInt(entityId),
        type,
        validFrom: validFrom ? new Date(validFrom) : null,
        validTo: validTo ? new Date(validTo) : null,
        docUrl: docUrl || null,
        status: "APPROVED",
      },
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        action: `Created entity certificate: ${type} for entity ID ${entityId}`,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Entity certificate created successfully",
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create or update entity
 */
exports.upsertEntity = async (req, res, next) => {
  try {
    const { id, ...data } = req.body;

    let entity;
    if (id) {
      entity = await prisma.entity.update({
        where: { id: parseInt(id) },
        data,
        include: { ascoUser: true },
      });
    } else {
      entity = await prisma.entity.create({
        data,
        include: { ascoUser: true },
      });
    }

    // Log action
    await prisma.auditLog.create({
      data: {
        action: id
          ? `Updated entity: ${entity.name}`
          : `Created entity: ${entity.name}`,
        userId: req.user.id,
      },
    });

    res.json({
      success: true,
      data: entity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete entity
 */
exports.deleteEntity = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Cascade delete: staff and certificates
    const entity = await prisma.entity.findUnique({
      where: { id: parseInt(id) },
      include: {
        staffMembers: true,
      },
    });

    if (!entity) {
      return next(new AppError("Entity not found", 404));
    }

    // Delete certificates for all staff
    for (const staff of entity.staffMembers) {
      await prisma.certificate.deleteMany({
        where: { staffId: staff.id },
      });
    }

    // Delete staff members
    await prisma.staff.deleteMany({
      where: { entityId: parseInt(id) },
    });

    // Delete entity
    await prisma.entity.delete({
      where: { id: parseInt(id) },
    });

    await prisma.auditLog.create({
      data: {
        action: `Deleted entity: ${entity.name} with ${entity.staffMembers.length} staff`,
        userId: req.user.id,
      },
    });

    res.json({
      success: true,
      message: "Entity and associated staff deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete staff member
 */
exports.deleteStaff = async (req, res, next) => {
  try {
    const { id } = req.params;

    const staff = await prisma.staff.findUnique({
      where: { id: parseInt(id) },
    });

    if (!staff) {
      return next(new AppError("Staff member not found", 404));
    }

    // Delete certificates
    await prisma.certificate.deleteMany({
      where: { staffId: parseInt(id) },
    });

    // Delete staff
    await prisma.staff.delete({
      where: { id: parseInt(id) },
    });

    await prisma.auditLog.create({
      data: {
        action: `Deleted staff: ${staff.fullName}`,
        userId: req.user.id,
      },
    });

    res.json({
      success: true,
      message: "Staff member deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get pending approvals
 */
exports.getPendingApprovals = async (req, res, next) => {
  try {
    const pendingCertificates = await prisma.certificate.findMany({
      where: { status: "PENDING" },
      include: {
        staff: {
          include: {
            entity: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });

    res.json({
      success: true,
      data: pendingCertificates,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve or reject certificate
 */
exports.approveCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return next(new AppError("Invalid status", 400));
    }

    const certificate = await prisma.certificate.findUnique({
      where: { id: parseInt(id) },
      include: {
        staff: {
          include: {
            entity: {
              include: {
                ascoUser: true,
              },
            },
          },
        },
      },
    });

    if (!certificate) {
      return next(new AppError("Certificate not found", 404));
    }

    // Update certificate
    const updateData = {
      status,
    };

    if (status === "APPROVED") {
      updateData.validFrom = certificate.proposedValidTo
        ? new Date()
        : certificate.validFrom;
      updateData.validTo = certificate.proposedValidTo || certificate.validTo;
      updateData.docUrl = certificate.proposedDocUrl || certificate.docUrl;
      updateData.proposedValidTo = null;
      updateData.proposedDocUrl = null;
    }

    const updatedCertificate = await prisma.certificate.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    // Log action
    await prisma.auditLog.create({
      data: {
        action: `${status} certificate ${certificate.type} for ${certificate.staff.fullName}`,
        userId: req.user.id,
      },
    });

    // Send notification email
    const emailService = require("../services/emailService");
    if (certificate.staff.entity?.ascoEmail) {
      await emailService.sendApprovalNotification(
        certificate.staff.entity.ascoEmail,
        certificate.staff.fullName,
        certificate.type,
        status
      );
    }

    res.json({
      success: true,
      data: updatedCertificate,
    });
  } catch (error) {
    next(error);
  }
};
