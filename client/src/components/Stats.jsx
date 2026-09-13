function Stats() {
  const stats = [
    {
      title: "Lost Items",
      value: "120",
      icon: "📦",
    },
    {
      title: "Found Items",
      value: "95",
      icon: "✅",
    },
    {
      title: "Registered Students",
      value: "850",
      icon: "🎓",
    },
    {
      title: "Returned Items",
      value: "75",
      icon: "🔄",
    },
  ];

  return (
    <section className="stats-section">
      <h2>📊 Portal Statistics</h2>

      <div className="stats-container">
        {stats.map((item, index) => (
          <div className="stat-card" key={index}>
            <div className="icon">{item.icon}</div>

            <h3>{item.value}</h3>

            <p>{item.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Stats;