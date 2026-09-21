export default function CampusHelpdeskModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="helpdesk-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="helpdesk-modal" onClick={(e) => e.stopPropagation()}>
        <div className="helpdesk-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "30px" }}>🏛️</span>
            <div>
              <h2 style={{ margin: 0, fontSize: "19px", color: "#0f172a", fontWeight: "800" }}>
                Campus Support &amp; Security Desk
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#64748b" }}>
                Official autonomous college drop-off and collection centers
              </p>
            </div>
          </div>
          <button className="helpdesk-modal-close" onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </div>

        <div className="helpdesk-modal-body">
          {/* Centers Grid */}
          <div className="helpdesk-centers-grid">
            {/* Center 1 */}
            <div className="helpdesk-center-card">
              <div className="helpdesk-center-icon">🛡️</div>
              <div className="helpdesk-center-info">
                <h4>Main Security Office (Gate 1)</h4>
                <p className="helpdesk-meta">📍 Main Campus Entrance | Ext: <strong>101</strong></p>
                <p className="helpdesk-hours">⏰ Mon–Sat: 8:00 AM – 6:00 PM (Emergency 24/7)</p>
                <span className="helpdesk-tag">Keys, Electronics, Helmets &amp; Wallets</span>
              </div>
            </div>

            {/* Center 2 */}
            <div className="helpdesk-center-card">
              <div className="helpdesk-center-icon">📚</div>
              <div className="helpdesk-center-info">
                <h4>Central Library Circulation Desk</h4>
                <p className="helpdesk-meta">📍 Library 1st Floor Counter | Ext: <strong>204</strong></p>
                <p className="helpdesk-hours">⏰ Mon–Sat: 8:00 AM – 7:30 PM</p>
                <span className="helpdesk-tag">Books, Calculators, Notebooks &amp; Pens</span>
              </div>
            </div>

            {/* Center 3 */}
            <div className="helpdesk-center-card">
              <div className="helpdesk-center-icon">🏛️</div>
              <div className="helpdesk-center-info">
                <h4>Admin Office / Dean Student Affairs</h4>
                <p className="helpdesk-meta">📍 A-Block Room 102 | Ext: <strong>108</strong></p>
                <p className="helpdesk-hours">⏰ Mon–Fri: 9:00 AM – 4:45 PM</p>
                <span className="helpdesk-tag">College ID Cards, Hall Tickets &amp; Valuables</span>
              </div>
            </div>

            {/* Center 4 */}
            <div className="helpdesk-center-card">
              <div className="helpdesk-center-icon">🔬</div>
              <div className="helpdesk-center-info">
                <h4>Department Staff Rooms &amp; Labs</h4>
                <p className="helpdesk-meta">📍 Respective Dept Block | Respective HOD</p>
                <p className="helpdesk-hours">⏰ College Hours: 8:45 AM – 4:30 PM</p>
                <span className="helpdesk-tag">Lab Coats, Component Kits &amp; Manuals</span>
              </div>
            </div>
          </div>

          {/* Official Instructions */}
          <div className="helpdesk-policy-box">
            <h4 style={{ margin: "0 0 8px", fontSize: "14px", color: "#065f46" }}>
              📋 Official Autonomous College Collection Guidelines:
            </h4>
            <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "#047857", lineHeight: "1.6" }}>
              <li>
                <strong>Bring Your College ID Card:</strong> You must present your original student ID card when collecting any deposited item.
              </li>
              <li>
                <strong>Physical Register Signature:</strong> You will be required to sign the campus custody ledger acknowledging receipt.
              </li>
              <li>
                <strong>Custody Period:</strong> Unclaimed items remain with Security/Library for 30 days before being transferred to the Central Dean's Office.
              </li>
            </ul>
          </div>
        </div>

        <div className="helpdesk-modal-footer">
          <button className="helpdesk-modal-done" onClick={onClose}>
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
