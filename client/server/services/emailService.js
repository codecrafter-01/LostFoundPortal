const nodemailer = require("nodemailer");

// =====================================
// Email Transporter Initialization
// =====================================
const getTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || "587", 10);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
};

const getFromAddress = () => {
  return process.env.EMAIL_FROM || process.env.EMAIL_USER || '"Vignan Lost & Found Portal" <no-reply@vignan.edu>';
};

/**
 * Returns the admin CC email(s) from .env.
 * Every portal email is also CC'd here so the admin always gets a copy.
 */
const getAdminCC = () => {
  const admin = process.env.ADMIN_NOTIFY_EMAIL;
  return admin && admin.trim() ? admin.trim() : null;
};

// =====================================
// Email Validation - Block Fake Emails
// =====================================
const BLOCKED_DOMAINS = [
  "example.com", "test.com", "fake.com", "invalid.com",
  "mailinator.com", "guerrillamail.com", "tempmail.com",
  "throwaway.email", "yopmail.com", "sharklasers.com",
  "guerrillamailblock.com", "grr.la", "guerrillamail.info",
  "spam4.me", "trashmail.com", "trashmail.me", "dispostable.com",
  "maildrop.cc", "spamgourmet.com", "getairmail.com",
  "fakeinbox.com", "nospam.ze.tc", "bugmenot.com",
  "sample.com", "domain.com", "nomail.com", "noemail.com",
];

/**
 * Returns true only if the email address looks real and valid.
 * Blocks fake/disposable domains and badly formatted emails.
 */
const isRealEmail = (email) => {
  if (!email || typeof email !== "string") return false;

  // Basic RFC 5322 email format check
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) return false;

  const domain = email.trim().toLowerCase().split("@")[1];
  if (!domain) return false;

  // Block known fake/disposable domains
  if (BLOCKED_DOMAINS.includes(domain)) return false;

  // Block obviously fake patterns like 'test@', 'fake@', 'noreply@'
  const localPart = email.trim().toLowerCase().split("@")[0];
  const fakePrefixes = ["test", "fake", "noreply", "no-reply", "donotreply", "dummy", "invalid", "null"];
  if (fakePrefixes.some((prefix) => localPart === prefix)) return false;

  return true;
};

/**
 * Shared HTML Base Wrapper
 */
const wrapHtmlTemplate = (title, contentHtml) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: #f4f6f9;
        margin: 0;
        padding: 20px;
        color: #333333;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
      .header {
        background: linear-gradient(135deg, #1e1b4b 0%, #311042 100%);
        color: #ffffff;
        padding: 24px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
        letter-spacing: 0.5px;
      }
      .header p {
        margin: 4px 0 0 0;
        font-size: 13px;
        opacity: 0.9;
      }
      .content {
        padding: 30px 24px;
      }
      .greeting {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 16px;
        color: #111827;
      }
      .intro {
        font-size: 15px;
        line-height: 1.5;
        color: #4b5563;
        margin-bottom: 20px;
      }
      .details-card {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 20px;
      }
      .badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
      }
      .badge-lost {
        background-color: #fee2e2;
        color: #991b1b;
      }
      .badge-found {
        background-color: #dcfce7;
        color: #166534;
      }
      .badge-returned {
        background-color: #e0e7ff;
        color: #3730a3;
      }
      .footer {
        background-color: #f1f5f9;
        color: #64748b;
        text-align: center;
        padding: 16px;
        font-size: 12px;
        border-top: 1px solid #e2e8f0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🎓 Vignan Lost & Found Portal</h1>
        <p>Official Campus Notification</p>
      </div>
      <div class="content">
        ${contentHtml}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Vignan Lost & Found Student Portal. All rights reserved.</p>
        <p>This is an automated campus email. Please do not reply directly.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

// =====================================
// 1. Send Report Created Email
// =====================================
const sendReportCreatedEmail = async (user, report) => {
  try {
    // Skip sending to fake/invalid emails
    if (!isRealEmail(user.email)) {
      console.log(`⚠️ [EmailService] Skipping Report Created email — fake/invalid email: ${user.email}`);
      return false;
    }

    const transporter = getTransporter();
    if (!transporter) {
      console.log("ℹ️ [EmailService] EMAIL_USER / EMAIL_PASSWORD not set in .env. Skipping email.");
      return false;
    }

    const isLost = report.reportType === "lost";
    const subject = "Vignan Lost & Found Report Submitted Successfully";

    const contentHtml = `
      <div class="greeting">Hello ${user.name || "Vignan Student"},</div>
      <p class="intro">
        Your <strong>${report.reportType.toUpperCase()}</strong> report has been successfully submitted to Vignan Lost & Found Portal.
      </p>

      <div class="details-card">
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px;">
          <tr>
            <td width="130" style="font-weight: 600; color: #475569;">Student Name:</td>
            <td style="color: #1e293b;">${user.name || "N/A"}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #475569;">Item Name:</td>
            <td style="color: #1e293b;"><strong>${report.itemName}</strong></td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #475569;">Report Type:</td>
            <td>
              <span class="badge ${isLost ? "badge-lost" : "badge-found"}">
                ${report.reportType.toUpperCase()}
              </span>
            </td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #475569;">Category:</td>
            <td style="color: #1e293b;">${report.category}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #475569;">Location:</td>
            <td style="color: #1e293b;">${report.location}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #475569;">Date:</td>
            <td style="color: #1e293b;">${report.date}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #475569;">Status:</td>
            <td style="color: #1e293b;">${report.status.toUpperCase()}</td>
          </tr>
        </table>
      </div>

      <p class="intro">
        We will notify you automatically if our Smart Match system finds a report matching your item.
      </p>
    `;

    const html = wrapHtmlTemplate(subject, contentHtml);

    const adminCC = getAdminCC();
    const mailOptions = {
      from: getFromAddress(),
      to: user.email,
      ...(adminCC && adminCC !== user.email ? { cc: adminCC } : {}),
      subject: subject,
      html: html,
      text: `Hello ${user.name},\n\nYour ${report.reportType.toUpperCase()} report for "${report.itemName}" has been successfully submitted to Vignan Lost & Found Portal.\nCategory: ${report.category}\nLocation: ${report.location}\nDate: ${report.date}\nStatus: ${report.status}\n\nThank you,\nVignan Lost & Found Student Portal`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [EmailService] Report Created email sent to ${user.email} (MessageId: ${info.messageId})`);
    return true;

  } catch (error) {
    console.error("❌ [EmailService] Failed to send Report Created email:", error.message);
    return false;
  }
};

// =====================================
// 2. Send Smart Match Notification Email
// =====================================
const sendSmartMatchEmail = async (recipientUser, targetReport, matchedReport, score, reasons) => {
  try {
    // Skip sending to fake/invalid emails
    if (!isRealEmail(recipientUser.email)) {
      console.log(`⚠️ [EmailService] Skipping Smart Match email — fake/invalid email: ${recipientUser.email}`);
      return false;
    }

    const transporter = getTransporter();
    if (!transporter) {
      console.log("ℹ️ [EmailService] EMAIL_USER / EMAIL_PASSWORD not set in .env. Skipping Smart Match email.");
      return false;
    }

    const subject = `Possible Match Found for Your ${targetReport.reportType === "lost" ? "Lost" : "Found"} Item - Vignan Portal`;

    const contentHtml = `
      <div class="greeting">Hello ${recipientUser.name || "Vignan Student"},</div>
      <p class="intro">
        🎯 <strong>Great news!</strong> Vignan Smart Match system detected a <strong>${score}% match</strong> for your report.
      </p>

      <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px;">
        <strong style="color: #1e40af;">Matching Reasons:</strong>
        <ul style="margin: 6px 0 0 20px; padding: 0; color: #1e3a8a; font-size: 14px;">
          ${reasons.map((r) => `<li>${r}</li>`).join("")}
        </ul>
      </div>

      <h3>📦 Your Reported Item</h3>
      <div class="details-card">
        <table width="100%" cellpadding="4" cellspacing="0" style="font-size: 14px;">
          <tr>
            <td width="130" style="font-weight: 600; color: #475569;">Item Name:</td>
            <td style="color: #1e293b;"><strong>${targetReport.itemName}</strong></td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #475569;">Type:</td>
            <td style="color: #1e293b;">${targetReport.reportType.toUpperCase()}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #475569;">Category:</td>
            <td style="color: #1e293b;">${targetReport.category}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #475569;">Location:</td>
            <td style="color: #1e293b;">${targetReport.location}</td>
          </tr>
        </table>
      </div>

      <h3>🤝 Matching Item Reported</h3>
      <div class="details-card">
        <table width="100%" cellpadding="4" cellspacing="0" style="font-size: 14px;">
          <tr>
            <td width="130" style="font-weight: 600; color: #475569;">Matching Item:</td>
            <td style="color: #1e293b;"><strong>${matchedReport.itemName}</strong></td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #475569;">Type:</td>
            <td style="color: #1e293b;">${matchedReport.reportType.toUpperCase()}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #475569;">Category:</td>
            <td style="color: #1e293b;">${matchedReport.category}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #475569;">Location:</td>
            <td style="color: #1e293b;">${matchedReport.location}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #475569;">Description:</td>
            <td style="color: #1e293b;">${matchedReport.description}</td>
          </tr>
        </table>
      </div>

      <p class="intro" style="text-align: center; margin-top: 24px;">
        Please log in to <strong>Vignan Lost & Found Portal</strong> to view full details and contact the user.
      </p>
    `;

    const html = wrapHtmlTemplate(subject, contentHtml);

    const adminCC = getAdminCC();
    const mailOptions = {
      from: getFromAddress(),
      to: recipientUser.email,
      ...(adminCC && adminCC !== recipientUser.email ? { cc: adminCC } : {}),
      subject: subject,
      html: html,
      text: `Hello ${recipientUser.name},\n\nA possible match (${score}%) was found for your item "${targetReport.itemName}".\nMatching Item: "${matchedReport.itemName}"\nCategory: ${matchedReport.category}\nLocation: ${matchedReport.location}\n\nPlease log in to Vignan Lost & Found Portal to review.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [EmailService] Smart Match email sent to ${recipientUser.email} (MessageId: ${info.messageId})`);
    return true;

  } catch (error) {
    console.error("❌ [EmailService] Failed to send Smart Match email:", error.message);
    return false;
  }
};

// =====================================
// 3. Send Returned Item Email
// =====================================
const sendReturnedEmail = async (user, report) => {
  try {
    // Skip sending to fake/invalid emails
    if (!isRealEmail(user.email)) {
      console.log(`⚠️ [EmailService] Skipping Returned email — fake/invalid email: ${user.email}`);
      return false;
    }

    const transporter = getTransporter();
    if (!transporter) {
      console.log("ℹ️ [EmailService] EMAIL_USER / EMAIL_PASSWORD not set in .env. Skipping email.");
      return false;
    }

    const subject = "Your Item Has Been Marked as Returned - Vignan Portal";

    const returnedDateStr = report.returnedAt
      ? new Date(report.returnedAt).toLocaleString()
      : new Date().toLocaleString();

    const contentHtml = `
      <div class="greeting">Hello ${user.name || "Vignan Student"},</div>
      <p class="intro">
        🎉 Your <strong>${report.reportType.toUpperCase()}</strong> report for <strong>"${report.itemName}"</strong> has been successfully marked as <strong>RETURNED</strong>.
      </p>

      <div class="details-card">
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px;">
          <tr>
            <td width="130" style="font-weight: 600; color: #475569;">Item Name:</td>
            <td style="color: #1e293b;"><strong>${report.itemName}</strong></td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #475569;">Report Type:</td>
            <td style="color: #1e293b;">${report.reportType.toUpperCase()}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #475569;">Status:</td>
            <td>
              <span class="badge badge-returned">RETURNED</span>
            </td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #475569;">Returned Date:</td>
            <td style="color: #1e293b;">${returnedDateStr}</td>
          </tr>
        </table>
      </div>

      <p class="intro">
        Thank you for using Vignan Lost & Found Portal to help keep our campus connected!
      </p>
    `;

    const html = wrapHtmlTemplate(subject, contentHtml);

    const adminCC = getAdminCC();
    const mailOptions = {
      from: getFromAddress(),
      to: user.email,
      ...(adminCC && adminCC !== user.email ? { cc: adminCC } : {}),
      subject: subject,
      html: html,
      text: `Hello ${user.name},\n\nYour ${report.reportType.toUpperCase()} item "${report.itemName}" has been marked as RETURNED on ${returnedDateStr}.\n\nThank you,\nVignan Lost & Found Student Portal`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [EmailService] Returned Item email sent to ${user.email} (MessageId: ${info.messageId})`);
    return true;

  } catch (error) {
    console.error("❌ [EmailService] Failed to send Returned Item email:", error.message);
    return false;
  }
};

// =====================================
// 4. Send Welcome Email (on Registration)
// =====================================
const sendWelcomeEmail = async (user) => {
  try {
    // Skip fake/invalid emails
    if (!isRealEmail(user.email)) {
      console.log(`⚠️ [EmailService] Skipping Welcome email — fake/invalid email: ${user.email}`);
      return false;
    }

    const transporter = getTransporter();
    if (!transporter) {
      console.log("ℹ️ [EmailService] EMAIL_USER / EMAIL_PASSWORD not set in .env. Skipping Welcome email.");
      return false;
    }

    const subject = "Welcome to Vignan Lost & Found Portal! 🎓";

    const contentHtml = `
      <div class="greeting">Welcome, ${user.name || "Vignan Student"}! 🎉</div>
      <p class="intro">
        You have successfully registered on the <strong>Vignan Lost &amp; Found Student Portal</strong>.
        Your campus is now smarter, safer, and more connected!
      </p>

      <div class="details-card">
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px;">
          <tr>
            <td width="130" style="font-weight: 600; color: #475569;">Name:</td>
            <td style="color: #1e293b;">${user.name}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #475569;">Email:</td>
            <td style="color: #1e293b;">${user.email}</td>
          </tr>
        </table>
      </div>

      <p class="intro">
        🔔 <strong>How notifications work:</strong><br/>
        Whenever a matching lost/found item is detected, you will automatically receive an email at this address.
        Make sure to check your inbox regularly!
      </p>

      <p class="intro" style="text-align: center; margin-top: 20px;">
        Thank you for joining Vignan Lost &amp; Found Portal. Together, we make our campus a better place! 🌟
      </p>
    `;

    const html = wrapHtmlTemplate(subject, contentHtml);

    const adminCC = getAdminCC();
    const mailOptions = {
      from: getFromAddress(),
      to: user.email,
      ...(adminCC && adminCC !== user.email ? { cc: adminCC } : {}),
      subject: subject,
      html: html,
      text: `Welcome ${user.name}!\n\nYou have successfully registered on Vignan Lost & Found Student Portal.\nYou will receive email notifications whenever a match is found for your lost/found items.\n\nThank you,\nVignan Lost & Found Student Portal`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [EmailService] Welcome email sent to ${user.email} (MessageId: ${info.messageId})`);
    return true;

  } catch (error) {
    console.error("❌ [EmailService] Failed to send Welcome email:", error.message);
    return false;
  }
};

// =====================================
// 5. Send Status Update Email
// =====================================
const sendStatusUpdateEmail = async (user, report) => {
  try {
    if (!isRealEmail(user.email)) {
      console.log(`⚠️ [EmailService] Skipping Status Update email — fake/invalid email: ${user.email}`);
      return false;
    }

    const transporter = getTransporter();
    if (!transporter) {
      console.log("ℹ️ [EmailService] EMAIL_USER / EMAIL_PASSWORD not set in .env. Skipping Status Update email.");
      return false;
    }

    const subject = `Your Report Status Has Been Updated — Vignan Lost & Found Portal`;

    const statusLabel = report.status === "returned" ? "RETURNED ✅" : report.status.toUpperCase();
    const statusColor = report.status === "returned" ? "#16a34a" : "#6366f1";

    const contentHtml = `
      <div class="greeting">Hello ${user.name || "Vignan Student"},</div>
      <p class="intro">
        📋 Your <strong>${report.reportType.toUpperCase()}</strong> report has been updated with a new status.
      </p>

      <div class="details-card">
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px;">
          <tr>
            <td width="130" style="font-weight: 600; color: #475569;">Item Name:</td>
            <td style="color: #1e293b;"><strong>${report.itemName}</strong></td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #475569;">Report Type:</td>
            <td style="color: #1e293b;">${report.reportType.toUpperCase()}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #475569;">Category:</td>
            <td style="color: #1e293b;">${report.category}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #475569;">Location:</td>
            <td style="color: #1e293b;">${report.location}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #475569;">New Status:</td>
            <td>
              <span style="
                display: inline-block;
                padding: 4px 12px;
                border-radius: 9999px;
                font-size: 13px;
                font-weight: 700;
                background-color: ${statusColor}22;
                color: ${statusColor};
                border: 1px solid ${statusColor}44;
              ">${statusLabel}</span>
            </td>
          </tr>
          ${report.returnedAt ? `
          <tr>
            <td style="font-weight: 600; color: #475569;">Completed On:</td>
            <td style="color: #1e293b;">${new Date(report.returnedAt).toLocaleString()}</td>
          </tr>` : ""}
        </table>
      </div>

      <p class="intro">
        Please log in to <strong>Vignan Lost &amp; Found Portal</strong> to view full details of your report.
      </p>
    `;

    const html = wrapHtmlTemplate(subject, contentHtml);

    const adminCC = getAdminCC();
    const mailOptions = {
      from: getFromAddress(),
      to: user.email,
      ...(adminCC && adminCC !== user.email ? { cc: adminCC } : {}),
      subject: subject,
      html: html,
      text: `Hello ${user.name},\n\nYour ${report.reportType.toUpperCase()} report for "${report.itemName}" has been updated.\nNew Status: ${statusLabel}\n\nPlease log in to Vignan Lost & Found Portal to view details.\n\nThank you,\nVignan Lost & Found Student Portal`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [EmailService] Status Update email sent to ${user.email} (MessageId: ${info.messageId})`);
    return true;

  } catch (error) {
    console.error("❌ [EmailService] Failed to send Status Update email:", error.message);
    return false;
  }
};

// =====================================
// 6. Send New Claim Received Email (to Finder)
// =====================================
const sendNewClaimReceivedEmail = async (finder, report, claim) => {
  try {
    if (!isRealEmail(finder.email)) {
      return false;
    }

    const transporter = getTransporter();
    if (!transporter) return false;

    const subject = `🔐 New Ownership Claim for Your Found "${report.itemName}" - Vignan Portal`;

    const contentHtml = `
      <div class="greeting">Hello ${finder.name || "Vignan Student"},</div>
      <p class="intro">
        A student has submitted a <strong>Proof of Ownership Claim</strong> for the <strong>"${report.itemName}"</strong> you reported found.
      </p>

      <div class="details-card">
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px;">
          <tr>
            <td width="140" style="font-weight: 600; color: #475569;">Claimant Name:</td>
            <td style="color: #1e293b;"><strong>${claim.claimantName}</strong></td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #475569;">Claimant Email:</td>
            <td style="color: #1e293b;">${claim.claimantEmail}</td>
          </tr>
          ${claim.contactPhone ? `
          <tr>
            <td style="font-weight: 600; color: #475569;">Contact Phone:</td>
            <td style="color: #1e293b;">${claim.contactPhone}</td>
          </tr>` : ""}
          ${report.verificationQuestion ? `
          <tr>
            <td style="font-weight: 600; color: #475569;">Your Question:</td>
            <td style="color: #6366f1;"><em>"${report.verificationQuestion}"</em></td>
          </tr>` : ""}
          <tr>
            <td style="font-weight: 600; color: #475569; vertical-align: top;">Their Proof Answer:</td>
            <td style="color: #0f172a; background: #f1f5f9; padding: 10px; border-radius: 8px;">
              <strong>"${claim.proofAnswer}"</strong>
            </td>
          </tr>
        </table>
      </div>

      <p class="intro">
        Please log in to your <strong>Vignan Lost &amp; Found Portal</strong>, go to <strong>My Reports</strong>, and either <strong>Approve</strong> or <strong>Reject</strong> this claim based on their proof answer.
      </p>
    `;

    const html = wrapHtmlTemplate(subject, contentHtml);

    const adminCC = getAdminCC();
    const mailOptions = {
      from: getFromAddress(),
      to: finder.email,
      ...(adminCC && adminCC !== finder.email ? { cc: adminCC } : {}),
      subject: subject,
      html: html,
      text: `Hello ${finder.name},\n\nA student (${claim.claimantName}) claimed your found item "${report.itemName}".\nProof Answer: "${claim.proofAnswer}"\n\nPlease log in to review the claim.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [EmailService] Claim Received email sent to finder ${finder.email} (MessageId: ${info.messageId})`);
    return true;

  } catch (error) {
    console.error("❌ [EmailService] Failed to send Claim Received email:", error.message);
    return false;
  }
};

// =====================================
// 7. Send Claim Status Update Email (to Claimant)
// =====================================
const sendClaimStatusEmail = async (claimant, report, status, finder) => {
  try {
    if (!isRealEmail(claimant.email)) {
      return false;
    }

    const transporter = getTransporter();
    if (!transporter) return false;

    const isApproved = status === "approved";
    const subject = isApproved
      ? `🎉 Claim Approved for "${report.itemName}" - Vignan Portal`
      : `Update on Your Claim for "${report.itemName}" - Vignan Portal`;

    const contentHtml = isApproved ? `
      <div class="greeting">Congratulations ${claimant.name || "Student"},! 🎉</div>
      <p class="intro">
        The finder has <strong>APPROVED</strong> your Proof of Ownership claim for <strong>"${report.itemName}"</strong>!
      </p>

      <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 14px; margin-bottom: 20px; border-radius: 6px;">
        <strong style="color: #065f46; font-size: 15px;">Finder Contact Details (Released):</strong>
        <p style="margin: 6px 0 0; color: #047857; font-size: 14px;">
          <strong>Finder Name:</strong> ${finder?.name || "Fellow Vignan Student"}<br />
          <strong>Finder Email:</strong> <a href="mailto:${finder?.email}" style="color: #059669; font-weight: bold;">${finder?.email}</a>
        </p>
      </div>

      <div class="details-card">
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px;">
          <tr>
            <td width="130" style="font-weight: 600; color: #475569;">Item Name:</td>
            <td style="color: #1e293b;"><strong>${report.itemName}</strong></td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #475569;">Location Found:</td>
            <td style="color: #1e293b;">${report.location}</td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #475569;">Status:</td>
            <td>
              <span class="badge" style="background: #dcfce7; color: #166534;">CLAIM VERIFIED & APPROVED</span>
            </td>
          </tr>
        </table>
      </div>

      <p class="intro">
        Please contact the finder to coordinate a safe meeting place on campus to collect your item.
      </p>
    ` : `
      <div class="greeting">Hello ${claimant.name || "Student"},</div>
      <p class="intro">
        Your ownership claim for the found item <strong>"${report.itemName}"</strong> was reviewed by the finder, but the provided proof details could not be verified.
      </p>

      <div class="details-card">
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 14px;">
          <tr>
            <td width="130" style="font-weight: 600; color: #475569;">Item Name:</td>
            <td style="color: #1e293b;"><strong>${report.itemName}</strong></td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #475569;">Status:</td>
            <td>
              <span class="badge" style="background: #fee2e2; color: #991b1b;">CLAIM NOT VERIFIED</span>
            </td>
          </tr>
        </table>
      </div>

      <p class="intro">
        If you believe this was an error, please verify your item description or submit a formal Lost report on the portal.
      </p>
    `;

    const html = wrapHtmlTemplate(subject, contentHtml);

    const adminCC = getAdminCC();
    const mailOptions = {
      from: getFromAddress(),
      to: claimant.email,
      ...(adminCC && adminCC !== claimant.email ? { cc: adminCC } : {}),
      subject: subject,
      html: html,
      text: isApproved
        ? `Your claim for "${report.itemName}" was approved! Contact finder at ${finder?.email}.`
        : `Your claim for "${report.itemName}" could not be verified by the finder.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [EmailService] Claim Status email sent to claimant ${claimant.email} (MessageId: ${info.messageId})`);
    return true;

  } catch (error) {
    console.error("❌ [EmailService] Failed to send Claim Status email:", error.message);
    return false;
  }
};

module.exports = {
  sendReportCreatedEmail,
  sendSmartMatchEmail,
  sendReturnedEmail,
  sendWelcomeEmail,
  sendStatusUpdateEmail,
  sendNewClaimReceivedEmail,
  sendClaimStatusEmail,
};

