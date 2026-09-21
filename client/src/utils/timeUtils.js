/**
 * Formats a time string (e.g. "14:30" or "09:15") to a readable 12-hour format ("2:30 PM", "9:15 AM").
 * Gracefully handles undefined, empty, or already formatted strings.
 */
export const formatTime = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return "";
  const trimmed = timeStr.trim();
  if (!trimmed) return "";

  // If already contains AM or PM, return as is
  if (/am|pm/i.test(trimmed)) {
    return trimmed;
  }

  const parts = trimmed.split(":");
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1].slice(0, 2);
    if (!isNaN(hours)) {
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12;
      return `${formattedHours}:${minutes} ${ampm}`;
    }
  }

  return trimmed;
};
