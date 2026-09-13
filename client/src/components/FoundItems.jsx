function FoundItems() {
  const items = [
    {
      name: "Water Bottle",
      location: "Sports Ground",
      date: "04-Aug-2026",
      reportedBy: "Priya",
      icon: "🥤",
    },
    {
      name: "Calculator",
      location: "Engineering Block",
      date: "03-Aug-2026",
      reportedBy: "Ahmed",
      icon: "🧮",
    },
    {
      name: "House Keys",
      location: "Parking Area",
      date: "02-Aug-2026",
      reportedBy: "Sneha",
      icon: "🔑",
    },
  ];

  return (
    <section className="items-section found-section">
      <h2>✅ Latest Found Items</h2>

      <div className="items-container">
        {items.map((item, index) => (
          <div className="item-card found-card" key={index}>
            <div className="item-icon">{item.icon}</div>

            <h3>{item.name}</h3>

            <p>📍 {item.location}</p>

            <p>📅 {item.date}</p>

            <p>👤 {item.reportedBy}</p>

            <button>Claim Item</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FoundItems;