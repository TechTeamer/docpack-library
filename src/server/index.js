import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
const app = express();
const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV === 'development') {
  console.log('We are in a development environment.');
} else {
  console.log('We are in a production environment.');
}

app.get('/generate-pdf', (req, res) => {
  res.send('Generating PDF...');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
