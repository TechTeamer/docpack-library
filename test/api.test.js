import path from 'path';
import fs from 'fs';
import { expect } from 'chai';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

let pdfParse;
import('pdf-parse').then(module => {
  pdfParse = module.default;
}).catch(err => console.error(err));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Server', () => {
  describe('Output Path', () => {
    it('should resolve the correct output path', () => {
      const outputPath = path.resolve(__dirname, './../../public/docs/output.pdf');
      const expectedPath = '/workspace/public/docs/output.pdf';

      expect(outputPath).to.equal(expectedPath);
    });

    it('should check if the output file exists', () => {
      const outputPath = path.resolve(__dirname, './../public/docs/output.pdf');

      expect(fs.existsSync(outputPath)).to.be.true;
    });
  });
});
