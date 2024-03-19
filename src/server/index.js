import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import markdownpdf from 'markdown-pdf';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3001;

app.get('/api/generate-pdf', (req, res) => {
  const docPath = path.resolve(__dirname, './../../public/docs/TEST.md');
  const outputPath = path.resolve(__dirname, './../../public/docs/output.pdf');

  fs.createReadStream(docPath)
    .pipe(markdownpdf())
    .pipe(fs.createWriteStream(outputPath))
    .on('finish', () => {
      console.log('PDF Generated');
      res.download(outputPath, 'output.pdf');
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
