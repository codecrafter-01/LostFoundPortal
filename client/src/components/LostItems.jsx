function LostItems() {
  const items = [
    {
      name: "Laptop",
      location: "Library",
      date: "03-Aug-2026",
      owner: "Rahul",
      icon: "💻",
    },
    {
      name: "College ID Card",
      location: "Block A",
      date: "02-Aug-2026",
      owner: "Ayesha",
      icon: "🪪",
    },
    {
      name: "Wallet",
      location: "Canteen",
      date: "01-Aug-2026",
      owner: "Arjun",
      icon: "👛",
    },
  ];

  return (
    <section className="items-section">
      <h2>📦 Latest Lost Items</h2>

      <div className="items-container">
        {items.map((item, index) => (
          <div className="item-card" key={index}>
            <div className="item-icon">{item.icon}</div>

            <h3>{item.name}</h3>

            <p>📍 {item.location}</p>

            <p>📅 {item.date}</p>

            <p>👤 {item.owner}</p>

            <button>View Details</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default LostItems;