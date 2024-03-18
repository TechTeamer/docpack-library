require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV === 'development') {
  console.log('Fejlesztési környezetben vagyunk.');
  // Itt konfiguráld a DEV specifikus beállításokat
} else {
  console.log('Termelési környezetben vagyunk.');
  // Itt konfiguráld a PROD specifikus beállításokat
}

app.get('/generate-pdf', (req, res) => {
  // Itt generáld a PDF-et
  res.send('PDF generálása...');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
