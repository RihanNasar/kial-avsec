const xlsx = require("xlsx");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Helper: Parse Excel Dates
 * Excel stores dates as serial numbers (e.g., 44562 = Jan 1, 2022).
 * Sometimes it stores them as strings ("12/01/2023").
 */
const parseExcelDate = (value) => {
  if (!value) return null;

  // Case 1: JS Date object (rare but possible)
  if (value instanceof Date) return value;

  // Case 2: Excel Serial Number (e.g., 44562)
  if (typeof value === "number") {
    // Excel base date is Dec 30, 1899
    return new Date(Math.round((value - 25569) * 86400 * 1000));
  }

  // Case 3: String Date (DD-MM-YYYY or DD/MM/YYYY)
  if (typeof value === "string") {
    const cleanStr = value.trim();
    if (cleanStr.includes("-")) {
      const parts = cleanStr.split("-"); // 25-12-2023
      if (parts.length === 3)
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    if (cleanStr.includes("/")) {
      const parts = cleanStr.split("/"); // 25/12/2023
      if (parts.length === 3)
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
  }
  return null; // Invalid date
};

exports.parseEntityFile = async (filePath) => {
  // 1. Read the Excel File
  const workbook = xlsx.readFile(filePath);
  // Assume data is in the first sheet
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert sheet to JSON (Header is Row 1)
  // defval: "" ensures missing cells are empty strings, not undefined
  const data = xlsx.utils.sheet_to_json(sheet, { defval: "" });

  console.log(`Starting Import: Processing ${data.length} rows...`);

  const results = { success: 0, errors: [] };

  // 2. Iterate through every row
  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    // Skip empty rows (check if 'Name of Entity' is missing)
    if (!row["Name of Entity"]) continue;

    try {
      // --- A. Extract Raw Data ---
      const entityName = row["Name of Entity"];
      const category = row["Category"];
      const ascoName = row["CSO/ ASCO Name"];
      const ascoEmail = row["ASCO E-mail ID"];
      const ascoContact = row["ASCO Contact No."];

      // --- B. Handle ASCO User Creation ---
      // If this entity has an ASCO Email, we ensure a User account exists for them.
      let ascoUser = null;
      if (ascoEmail && ascoEmail.includes("@")) {
        // Default password is "kial123"
        const hashedPassword = await bcrypt.hash("kial123", 10);

        // Upsert = Create if new, Update (do nothing) if exists
        ascoUser = await prisma.user.upsert({
          where: { email: ascoEmail },
          update: {}, // Don't change existing user details
          create: {
            email: ascoEmail,
            fullName: ascoName || "ASCO User",
            role: "ENTITY_HEAD",
            passwordHash: hashedPassword,
          },
        });
      }

      // --- C. Create Entity Record ---
      await prisma.entity.create({
        data: {
          name: entityName,
          category: category,

          // Compliance Statuses
          securityClearanceStatus: row["Security Clearance Status"] || null,
          securityProgramStatus: row["Security Programme Status"] || null,
          qcpStatus: row["QCP Status "] || row["QCP Status"] || null, // Handle potential trailing space in header

          // Dates (Using our helper)
          contractValidFrom: parseExcelDate(
            row["Contract validity with KIAL... From"]
          ),
          contractValidTo: parseExcelDate(row["To"]), // CAUTION: Excel parsing often names duplicate columns 'To', 'To_1'. Check this if dates are wrong.

          qcpSubmissionDate: parseExcelDate(row["QCP submission date"]), // If this column exists in your full file

          // ASCO Linkage
          ascoUserId: ascoUser ? ascoUser.id : null,
          ascoName: ascoName,
          ascoContactNo: String(ascoContact || ""),
          ascoEmail: ascoEmail,
          ascoTrainingValidFrom: parseExcelDate(
            row["CSO/ ASCO AvSec Basic/ Induction Training Validity... From"]
          ),
          ascoTrainingValidTo: parseExcelDate(
            row["CSO/ ASCO AvSec Basic/ Induction Training Validity... To"]
          ), // Note: Check generated JSON keys for duplicates if "To" appears twice

          // KIAL PoC Details
          kialPocName: row["Name of PoC at KIAL"],
          kialPocNumber: String(row["Mob No. of PoC at KIAL"] || ""),
          kialPocEmail: row["Email ID of POC at KIAL"],
        },
      });

      results.success++;
    } catch (error) {
      console.error(`Row ${i + 2} Error:`, error.message);
      results.errors.push(
        `Row ${i + 2} (${row["Name of Entity"]}): ${error.message}`
      );
    }
  }

  console.log("Import Complete:", results);
  return results;
};

/**
 * Parse KIAL Staff Excel File
 */
exports.parseKialStaffFile = async (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { defval: "" });

  console.log(`Starting KIAL Staff Import: Processing ${data.length} rows...`);

  // Log sample of first row to help debug column names
  if (data.length > 0) {
    console.log("Excel columns detected:", Object.keys(data[0]));
    console.log("First row sample:", data[0]);
  }

  const results = { success: 0, errors: [] };

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    // Skip empty rows
    if (!row["Name"] && !row["Full Name"] && !row["Staff Name"]) continue;

    try {
      const fullName = row["Name"] || row["Full Name"] || row["Staff Name"];
      const empCode = row["Employee Code"] || row["Emp Code"] || row["Emp. Code"] || row["EmpCode"];
      const email = row["Email"] || row["E-mail ID"] || row["Email ID"];
      const aadhaarNumber = row["Aadhaar Number"] || row["Aadhaar"] || row["AADHAAR"];
      const aepNumber = row["AEP Number"] || row["AEP No"] || row["AEP No."];
      const aepValidFrom = row["AEP Valid From"] || row["AEP Valid from"];
      const aepValidTo = row["AEP Valid To"] || row["AEP Valid to"];
      const phoneNumber = row["Phone Number"] || row["Phone"] || row["Mobile Number"] || row["Contact Number"];
      const department = row["Department"] || null;
      
      // Parse training and compliance dates
      const avsecTrainingValidity = parseExcelDate(row["AvSec Basic / Awareness Training Validity"] || row["AvSec Training Validity"] || row["Training Validity"]);
      const pccValidity = parseExcelDate(row["Police Verification Certificate (PCC) Validity (if present)"] || row["PCC Validity"] || row["Police Verification"]);
      const medicalFitnessValidity = parseExcelDate(row["Medical Fitness Validity (if present)"] || row["Medical Fitness Validity"] || row["Medical Fitness"]);

      // Create user account if email provided
      let user = null;
      if (email && email.includes("@")) {
        const hashedPassword = await bcrypt.hash("kial123", 10);
        user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: {
            email,
            fullName,
            role: "STAFF",
            passwordHash: hashedPassword,
          },
        });
      }

      // Create staff record
      const staff = await prisma.staff.create({
        data: {
          fullName,
          designation: row["Designation"] || null,
          aadhaarNumber: String(aadhaarNumber || ""),
          isKialStaff: true,
          empCode: String(empCode || ""),
          department: department,
          dateOfSuperannuation: parseExcelDate(row["Date of Superannuation"]),
          userId: user ? user.id : null,
          aepNumber: aepNumber || null,
          aepValidFrom: parseExcelDate(aepValidFrom),
          aepValidTo: parseExcelDate(aepValidTo),
          terminals: row["Terminals"] || null,
          airportsGiven: row["Airports Given"] || row["Airports"] || null,
          zones: row["Zones"] ? String(row["Zones"]).split(",").map(z => z.trim()).filter(z => z) : [],
          phoneNumber: phoneNumber || null,
          avsecTrainingValidity: avsecTrainingValidity,
          pccValidity: pccValidity,
          medicalFitnessValidity: medicalFitnessValidity,
        },
      });
      
      // For Security Department staff, create AvSec certificate if training validity exists
      if (department && department.toLowerCase().includes('security') && avsecTrainingValidity) {
        await prisma.certificate.create({
          data: {
            type: "AvSec Basic / Awareness Training",
            validFrom: new Date(), // Current validity
            validTo: avsecTrainingValidity,
            status: "APPROVED",
            staffId: staff.id,
          },
        });
      }

      results.success++;
    } catch (error) {
      console.error(`Row ${i + 2} Error:`, error.message);
      console.error(`Row ${i + 2} Stack:`, error.stack);
      results.errors.push(
        `Row ${i + 2} (${row["Name"] || row["Full Name"] || "Unknown"}): ${error.message}`
      );
    }
  }

  console.log("KIAL Staff Import Complete:", results);
  return results;
};

/**
 * Parse Entity Staff Excel File
 */
exports.parseEntityStaffFile = async (filePath, entityId) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { defval: "" });

  console.log(`Starting Entity Staff Import for Entity ${entityId}: Processing ${data.length} rows...`);

  const results = { success: 0, errors: [] };

  // Verify entity exists
  const entity = await prisma.entity.findUnique({ where: { id: parseInt(entityId) } });
  if (!entity) {
    throw new Error(`Entity with ID ${entityId} not found`);
  }

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    // Skip empty rows
    if (!row["Name"] && !row["Full Name"] && !row["Staff Name"]) continue;

    try {
      const fullName = row["Name"] || row["Full Name"] || row["Staff Name"];
      const email = row["Email"] || row["E-mail ID"] || row["Email ID"];

      // Create user account if email provided
      let user = null;
      if (email && email.includes("@")) {
        const hashedPassword = await bcrypt.hash("entity123", 10);
        user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: {
            email,
            fullName,
            role: "STAFF",
            passwordHash: hashedPassword,
          },
        });
      }

      // Create staff record
      const staff = await prisma.staff.create({
        data: {
          fullName,
          designation: row["Designation"] || null,
          aadhaarNumber: String(row["Aadhaar Number"] || row["Aadhaar"] || ""),
          isKialStaff: false,
          entityId: parseInt(entityId),
          userId: user ? user.id : null,
          aepNumber: row["AEP Number"] || row["AEP No"] || null,
          aepValidFrom: parseExcelDate(row["AEP Valid From"]),
          aepValidTo: parseExcelDate(row["AEP Valid To"]),
          terminals: row["Terminals"] || null,
          airportsGiven: row["Airports Given"] || row["Airports"] || null,
          zones: row["Zones"] ? String(row["Zones"]).split(",").map(z => z.trim()).filter(z => z) : [],
        },
      });

      // Create certificates if provided
      const certColumns = [
        { name: "AVSEC_BASIC", fromCol: "Training Valid From", toCol: "Training Valid To" },
        { name: "PCC", fromCol: "PCC Valid From", toCol: "PCC Valid To" },
        { name: "MEDICAL", fromCol: "Medical Valid From", toCol: "Medical Valid To" },
      ];

      for (const cert of certColumns) {
        const validFrom = parseExcelDate(row[cert.fromCol]);
        const validTo = parseExcelDate(row[cert.toCol]);

        if (validFrom || validTo) {
          await prisma.certificate.create({
            data: {
              type: cert.name,
              validFrom,
              validTo,
              status: "APPROVED",
              staffId: staff.id,
            },
          });
        }
      }

      results.success++;
    } catch (error) {
      console.error(`Row ${i + 2} Error:`, error.message);
      results.errors.push(
        `Row ${i + 2} (${row["Name"] || row["Full Name"] || "Unknown"}): ${error.message}`
      );
    }
  }

  console.log("Entity Staff Import Complete:", results);
  return results;
};
