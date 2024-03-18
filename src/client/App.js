import React from "react";
import Button from '@material-ui/core/Button';

export default function App() {
  const generatePDF = () => {
    console.log("PDF generálása...");
  };
  return (
    <div>
      <Button variant="contained" color="primary" onClick={generatePDF}>
        Generate PDF
      </Button>
    </div>
  );
}
