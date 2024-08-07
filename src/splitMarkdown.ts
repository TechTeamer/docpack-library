import fs from "fs";
import {formatMermaid} from "./mermaid.formatter.js";
import {formatCode} from "./code.formatter.js";
import {formatMarkdown} from "./markdown.formatter.js";
import {generateTable} from "./table.formatter.js";
import {formatImage} from "./image.formatter.js";
import * as console from "node:console";
import {writeFileSync} from "node:fs";
import path from "node:path";

// Function to read the markdown file
function readMarkdownFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// Function to write content to a file
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

// Function to replace ```{lang} with \begin{minted}[breaklines]{lang} and closing ``` with \end{minted}
// If no language is specified, defaults to "shell"
function replaceCodeBlockWithMinted(segment) {
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  return segment.replace(codeBlockRegex, (match, lang, code) => {
    lang = lang || 'shell'; // Default to "shell" if no language is specified
    return `\\begin{minted}[breaklines,breaksymbolleft=\\quad]{${lang}}\n${code}\\end{minted}`;
  });
}

// Function to split markdown content line by line
function splitMarkdownContent(content: string) {
  const lines = content.split('\n');
  const segments: { type: string; content: string; } [] = [];

  let currentSegment: string[] = [];
  let currentType = 'text';
  let insideCodeBlock = false;
  let insideTable = false;

  lines.forEach(line => {
    if (line.startsWith('```')) {
      if (insideCodeBlock) {
        // End of code block
        currentSegment.push(line);
        segments.push({
          type: 'code',
          content: replaceCodeBlockWithMinted(currentSegment.join('\n'))
        });
        currentSegment = [];
        insideCodeBlock = false;
      } else {
        // Start of code block
        if (currentSegment.length > 0) {
          segments.push({
            type: currentType,
            content: currentSegment.join('\n')
          });
          currentSegment = [];
        }
        insideCodeBlock = true;
        currentSegment.push(line);
      }
    } else if (line.startsWith('![')) {
      // Image line
      if (currentSegment.length > 0) {
        segments.push({
          type: currentType,
          content: currentSegment.join('\n')
        });
        currentSegment = [];
      }
      segments.push({
        type: 'image',
        content: line
      });
      currentType = 'text';
    } else if (line.startsWith('|') && line.endsWith('|') && line.length > 1) {
      // Table line
      if (!insideTable) {
        if (currentSegment.length > 0) {
          segments.push({
            type: currentType,
            content: currentSegment.join('\n')
          });
          currentSegment = [];
        }
        insideTable = true;
      }
      currentSegment.push(line);
    } else {
      // Regular text line
      if (insideTable) {
        segments.push({
          type: 'table',
          content: currentSegment.join('\n')
        });
        currentSegment = [];
        insideTable = false;
      }
      currentSegment.push(line);
      currentType = 'text';
    }
  });

  if (currentSegment.length > 0) {
    segments.push({
      type: insideTable ? 'table' : insideCodeBlock ? 'code' : currentType,
      content: currentSegment.join('\n')
    });
  }

  return segments;
}

// Main function to execute the splitting process
function main(inputFilePath, outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const content = readMarkdownFile(inputFilePath);
  const segments = splitMarkdownContent(content);

  const swagments = segments.map(async (segment, index) => {
    if (segment.type === 'code') {
      const codeLang = segment.content.match(/```(\w*)/)?.at(1) || 'shell';
      if (codeLang === 'mermaid') {
        return formatMermaid(segment.content)
      } else {
        return formatCode(segment.content)
      }
    } else if (segment.type === 'image') {
      return formatImage(segment.content)
    } else if (segment.type === 'table') {
      return generateTable(segment.content)
    } else {
      return formatMarkdown(segment.content, true)
    }
  });

  Promise.all(swagments).then(all => {
    writeFileSync(path.join(outputDir, "out.tex"), all.join("\n"))
  })
}

// Replace with your actual input markdown file path and desired output directory
const inputFilePath = '../../tex/input.md';
const outputDir = 'output';

main(inputFilePath, outputDir);
