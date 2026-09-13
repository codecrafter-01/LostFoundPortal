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

    const mailOptions = {
      from: getFromAddress(),
      to: user.email,
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

    const mailOptions = {
      from: getFromAddress(),
      to: recipientUser.email,
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

    const mailOptions = {
      from: getFromAddress(),
      to: user.email,
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

module.exports = {
  sendReportCreatedEmail,
  sendSmartMatchEmail,
  sendReturnedEmail,
};
