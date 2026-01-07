const transporter = require("../config/mailer");
const { format } = require("date-fns");

/**
 * Send expiry alert email to ASCO
 */
async function sendExpiryAlert(entity, expiringItems) {
  if (!entity.ascoEmail) {
    console.log(`No email found for entity: ${entity.name}`);
    return;
  }

  const itemsList = expiringItems
    .map((item) => {
      return `- ${item.type}: ${item.staffName} - Expires on ${format(
        new Date(item.validTo),
        "dd-MM-yyyy"
      )}`;
    })
    .join("\n");

  const mailOptions = {
    from: process.env.SMTP_FROM || "noreply@kial.avsec.com",
    to: entity.ascoEmail,
    subject: `URGENT: Certificates Expiring Soon for ${entity.name}`,
    text: `Dear ${entity.ascoUser?.fullName || "ASCO"},

The following certificates for your entity "${entity.name}" are expiring soon:

${itemsList}

Please take immediate action to renew these certificates.

Regards,
KIAL AVSEC Team`,
    html: `
      <p>Dear <strong>${entity.ascoUser?.fullName || "ASCO"}</strong>,</p>
      <p>The following certificates for your entity "<strong>${
        entity.name
      }</strong>" are expiring soon:</p>
      <ul>
        ${expiringItems
          .map(
            (item) =>
              `<li><strong>${item.type}</strong>: ${
                item.staffName
              } - Expires on <strong>${format(
                new Date(item.validTo),
                "dd-MM-yyyy"
              )}</strong></li>`
          )
          .join("")}
      </ul>
      <p>Please take immediate action to renew these certificates.</p>
      <p>Regards,<br><strong>KIAL AVSEC Team</strong></p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Expiry alert sent to ${entity.ascoEmail}`);
  } catch (error) {
    console.error(`Failed to send email to ${entity.ascoEmail}:`, error);
  }
}

/**
 * Send approval notification
 */
async function sendApprovalNotification(
  email,
  staffName,
  certificateType,
  status
) {
  if (!email) return;

  const statusText = status === "APPROVED" ? "approved" : "rejected";
  const mailOptions = {
    from: process.env.SMTP_FROM || "noreply@kial.avsec.com",
    to: email,
    subject: `Certificate ${statusText.toUpperCase()}: ${certificateType}`,
    text: `The certificate renewal request for ${staffName} (${certificateType}) has been ${statusText}.`,
    html: `
      <p>The certificate renewal request for <strong>${staffName}</strong> (<strong>${certificateType}</strong>) has been <strong>${statusText}</strong>.</p>
      <p>Regards,<br><strong>KIAL AVSEC Team</strong></p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Approval notification sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error);
  }
}

module.exports = {
  sendExpiryAlert,
  sendApprovalNotification,
};
