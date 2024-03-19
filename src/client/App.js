import React, { useState, useEffect } from "react";
import Button from './components/Button.js';

export default function App() {
  const [serverUrl, setServerUrl] = useState('');

  useEffect(() => {
    setServerUrl(process.env.REACT_APP_SERVER_URL);
  }, []);

  const generatePDF = () => {
    console.log("PDF generálása...");
    if (serverUrl) {
      window.open(`${serverUrl}/api/generate-pdf`);
    } else {
      console.error('A szerver URL-je nincs beállítva.');
    }
  };

  return (
    <div>
      <Button onClick={generatePDF}>
        Generate PDF
      </Button>
    </div>
  );
}
