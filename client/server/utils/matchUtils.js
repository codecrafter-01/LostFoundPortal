/**
 * Utility functions for Smart Match calculation on backend.
 * Matches logic in frontend Matches.jsx.
 */

const getWords = (text) => {
  return (text || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 2);
};

const calculateSimilarity = (text1, text2) => {
  const words1 = getWords(text1);
  const words2 = getWords(text2);

  if (words1.length === 0 || words2.length === 0) {
    return 0;
  }

  const commonWords = words1.filter((word) => words2.includes(word));
  const uniqueWords = [...new Set([...words1, ...words2])];

  if (uniqueWords.length === 0) {
    return 0;
  }

  return commonWords.length / uniqueWords.length;
};

const calculateMatchScore = (myReport, otherReport) => {
  if (!myReport || !otherReport) {
    return { score: 0, reasons: [], isMatch: false };
  }

  const myId = (myReport._id || myReport.id || "").toString();
  const otherId = (otherReport._id || otherReport.id || "").toString();

  if (myId && otherId && myId === otherId) {
    return { score: 0, reasons: [], isMatch: false };
  }

  if (myReport.status === "returned" || otherReport.status === "returned") {
    return { score: 0, reasons: [], isMatch: false };
  }

  if (myReport.reportType === otherReport.reportType) {
    return { score: 0, reasons: [], isMatch: false };
  }

  let score = 0;
  const reasons = [];

  // 1. ITEM NAME — 40%
  const myItem = (myReport.itemName || "").toLowerCase().trim();
  const otherItem = (otherReport.itemName || "").toLowerCase().trim();

  if (myItem && otherItem) {
    if (myItem === otherItem) {
      score += 40;
      reasons.push("Same item name");
    } else if (myItem.includes(otherItem) || otherItem.includes(myItem)) {
      score += 30;
      reasons.push("Very similar item name");
    } else {
      const similarity = calculateSimilarity(myItem, otherItem);
      if (similarity >= 0.5) {
        score += 20;
        reasons.push("Similar item name");
      }
    }
  }

  // 2. CATEGORY — 25%
  const myCategory = (myReport.category || "").toLowerCase().trim();
  const otherCategory = (otherReport.category || "").toLowerCase().trim();

  if (myCategory && otherCategory && myCategory === otherCategory) {
    score += 25;
    reasons.push("Same category");
  }

  // 3. LOCATION — 20%
  const myLocation = (myReport.location || "").toLowerCase().trim();
  const otherLocation = (otherReport.location || "").toLowerCase().trim();

  if (myLocation && otherLocation) {
    if (myLocation === otherLocation) {
      score += 20;
      reasons.push("Same location");
    } else if (myLocation.includes(otherLocation) || otherLocation.includes(myLocation)) {
      score += 10;
      reasons.push("Similar location");
    }
  }

  // 4. DESCRIPTION — 15%
  const myDescription = myReport.description || "";
  const otherDescription = otherReport.description || "";

  const descriptionSimilarity = calculateSimilarity(myDescription, otherDescription);

  if (descriptionSimilarity >= 0.5) {
    score += 15;
    reasons.push("Similar description");
  } else if (descriptionSimilarity >= 0.25) {
    score += 8;
    reasons.push("Related description");
  }

  return {
    score,
    reasons,
    isMatch: score >= 50,
  };
};

module.exports = {
  calculateSimilarity,
  calculateMatchScore,
};
