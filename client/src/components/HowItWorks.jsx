function HowItWorks() {
  const steps = [
    {
      icon: "📝",
      title: "Report Item",
      description: "Students report a lost or found item using the portal.",
    },
    {
      icon: "🔍",
      title: "Verification",
      description: "The information is verified by the admin.",
    },
    {
      icon: "📢",
      title: "Notification",
      description: "The owner is notified when a matching item is found.",
    },
    {
      icon: "🤝",
      title: "Return Item",
      description: "The owner collects the item safely from the campus office.",
    },
  ];

  return (
    <section className="how-section">
      <h2>⚙️ How It Works</h2>

      <div className="how-container">
        {steps.map((step, index) => (
          <div className="how-card" key={index}>
            <div className="how-icon">{step.icon}</div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;