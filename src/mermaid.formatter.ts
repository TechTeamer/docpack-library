import {renderMermaid} from "@mermaid-js/mermaid-cli";
import puppeteer from "puppeteer";
import { v4 } from "uuid";
import {writeFileSync, existsSync, mkdirSync} from "node:fs";
import path from "node:path";

/**
 * Formats Markdown code section to Latex minted environment
 * @param str Input Markdown
 * @param size Size string (number)(% or cm or mm)
 */
export async function formatMermaid(str: string, size: string = "100%"): Promise<string> {
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  const matches = new RegExp(codeBlockRegex).exec(str);
  if (!matches) {
    throw Error(`Codeblock not found: ${str}`)
  }

  if (matches.length < 3) {
    throw Error(`Failed to parse code block: ${str}`)
  }

  const lang = matches[1]
  if (lang !== "mermaid") {
    throw Error(`'${lang}' code cannot be formatted! Use the code formatter!`)
  }

  const code = matches[2]
  const path = await createImage(code)
  return formatImage(path, size)
}

/**
 * Creates an image and returns the path to it
 * @param code Mermaid diagram in text form
 */
async function createImage(code: string): Promise<{ title: string | null, url: string }> {
  const browser = await puppeteer.launch({headless: "new"});
  const result = await renderMermaid(browser, code, "png");
  await browser.close();

  if (!existsSync("tmp")) {
    mkdirSync("tmp")
  }

  const id = v4();
  const url = path.join("tmp", id+".png");
  writeFileSync(url, result.data)

  return {title: result.title, url };
}


/**
 * Formats a Markdown image to Latex
 * @param data Filepath and title of the diagram
 * @param size Size string (number)(% or cm or mm)
 */
function formatImage(data: { url: string, title: string | null }, size: string = "100%"): string {
  const regex = /(\d+(\.\d+)?)(%|cm|mm)/
  const match = regex.exec(size)
  let sizeString = size;
  if (match) {
    const item = match[0]
    if (item.endsWith("%")) {
      sizeString = Math.round(parseFloat(item)) / 100 + "\\linewidth"
    }
  } else {
    throw new Error(`Invalid size format: ${size}`)
  }

  return `\\begin{figure}[H]
  \\centering
  \\includegraphics[width=${sizeString}]{${data.url}}
  \\caption{${data.title ?? ""}}
\\end{figure}`
}
