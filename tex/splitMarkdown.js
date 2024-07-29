import fs from "fs";
import path from "path";
import {writeFileSync} from "node:fs";

// Function to read the markdown file
function readMarkdownFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// Function to write content to a file
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function replaceCodeBlockWithMinted(segment) {
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  return segment.replace(codeBlockRegex, (match, lang, code) => {
    lang = lang || 'shell'; // Default to "shell" if no language is specified
    return `\\begin{minted}[breaklines,breaksymbolleft=\\quad]{${lang}}\n${code}\\end{minted}`;
  });
}

/**
 *
 * @param filenames {string[]}
 * @returns {string}
 */
function generateTex(filenames) {
  const markTemp = (fname) => `\\markdownInput{${fname}}`;
  const textTemp = (fname) => `\\input{${fname}}`;
  return filenames.map(name => name.endsWith(".md") ? markTemp(name):textTemp(name)).join("\n")
}

// Function to split markdown content and save to separate files
function splitMarkdownContent(content, inpFileName, outputDir) {
  const codeBlockRegex = /(```[\s\S]*?```)/g;
  let segments = content.split(codeBlockRegex);
  const paths = []
  let counter = 0;
  segments.forEach(segment => {
    let fileName;
    if (segment.startsWith('```')) {
      segment = replaceCodeBlockWithMinted(segment);
      fileName = `code_block_${counter}.tex`;
    } else {
      fileName = `text_segment_${counter}.md`;
    }
    const fPath = path.join(outputDir, inpFileName, fileName.replace(".tex", ""))
    paths.push(fPath)
    writeFile(path.join(outputDir, inpFileName, fileName), segment);
    counter++;
  });
  writeFileSync(path.join(outputDir, inpFileName + ".tex"), generateTex(paths))
}

// Main function to execute the splitting process
function main(inputFilePath, outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  const z = path.join(outputDir,path.basename(inputFilePath))
  if (!fs.existsSync(z)) {
    fs.mkdirSync(z);
  }
  const content = readMarkdownFile(inputFilePath);
  splitMarkdownContent(content, path.basename(inputFilePath), outputDir);
}

// Replace with your actual input markdown file path and desired output directory
const inputFilePath = 'usermanualhu.md';
const outputDir = 'output/';

main(inputFilePath, outputDir);
