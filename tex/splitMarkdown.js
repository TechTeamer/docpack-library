import fs from "fs";
import path from "path";

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
function splitMarkdownContent(content) {
  const lines = content.split('\n');
  const segments = [];

  let currentSegment = [];
  let currentType = 'text';
  let insideCodeBlock = false;
  let insideTable = false;
  let codeLang = '';

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
        codeLang = line.match(/```(\w*)/)[1] || 'shell';
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
    } else if (line.startsWith('|') && line.includes('|')) {
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

  segments.forEach((segment, index) => {
    let fileName;
    if (segment.type === 'code') {
      fileName = `code_block_${index}.md`;
    } else if (segment.type === 'image') {
      fileName = `image_${index}.md`;
    } else if (segment.type === 'table') {
      fileName = `table_${index}.md`;
    } else {
      fileName = `text_segment_${index}.md`;
    }
    writeFile(path.join(outputDir, fileName), segment.content);
  });
}

// Replace with your actual input markdown file path and desired output directory
const inputFilePath = 'input.md';
const outputDir = 'output';

main(inputFilePath, outputDir);
