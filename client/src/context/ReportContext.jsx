import { createContext, useState, useEffect } from "react";

export const ReportContext = createContext();

function ReportProvider({ children }) {

  const [lostReports, setLostReports] = useState(() => {
    const saved = localStorage.getItem("lostReports");
    return saved ? JSON.parse(saved) : [];
  });

  const [foundReports, setFoundReports] = useState(() => {
    const saved = localStorage.getItem("foundReports");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(
      "lostReports",
      JSON.stringify(lostReports)
    );
  }, [lostReports]);

  useEffect(() => {
    localStorage.setItem(
      "foundReports",
      JSON.stringify(foundReports)
    );
  }, [foundReports]);

  const addLostReport = (report) => {
    setLostReports((prev) => [...prev, report]);
  };

  const addFoundReport = (report) => {
    setFoundReports((prev) => [...prev, report]);
  };

  const deleteLostReport = (index) => {
    setLostReports((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const deleteFoundReport = (index) => {
    setFoundReports((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  return (
    <ReportContext.Provider
      value={{
        lostReports,
        foundReports,
        addLostReport,
        addFoundReport,
        deleteLostReport,
        deleteFoundReport,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
}

export default ReportProvider;