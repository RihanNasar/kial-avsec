const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const { addDays } = require("date-fns");
const { sendExpiryAlert } = require("./emailService");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Check for expiring certificates and send alerts
 */
async function checkExpiringCertificates() {
  console.log("Running expiry check job...");

  try {
    const thirtyDaysFromNow = addDays(new Date(), 30);

    // Find all certificates expiring in the next 30 days
    const expiringCertificates = await prisma.certificate.findMany({
      where: {
        validTo: {
          lte: thirtyDaysFromNow,
          gte: new Date(),
        },
        status: "APPROVED",
      },
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

    // Group by entity
    const entitiesMap = new Map();

    for (const cert of expiringCertificates) {
      if (!cert.staff.entity) continue;

      const entityId = cert.staff.entity.id;

      if (!entitiesMap.has(entityId)) {
        entitiesMap.set(entityId, {
          entity: cert.staff.entity,
          items: [],
        });
      }

      entitiesMap.get(entityId).items.push({
        type: cert.type,
        staffName: cert.staff.fullName,
        validTo: cert.validTo,
      });
    }

    // Send emails for each entity
    for (const [entityId, data] of entitiesMap) {
      await sendExpiryAlert(data.entity, data.items);
    }

    console.log(
      `Expiry check completed. ${entitiesMap.size} entities notified.`
    );
  } catch (error) {
    console.error("Error in expiry check job:", error);
  }
}

/**
 * Start cron jobs
 */
function startCronJobs() {
  // Run every day at 9 AM
  cron.schedule("0 9 * * *", checkExpiringCertificates);

  // For testing: Run every minute (comment out in production)
  // cron.schedule("* * * * *", checkExpiringCertificates);

  console.log("Cron jobs started");
}

module.exports = {
  startCronJobs,
  checkExpiringCertificates,
};
