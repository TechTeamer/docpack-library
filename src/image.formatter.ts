interface MarkdownImage {
  altText: string;
  url: string;
  title: string | null;
}

/** Parses and validates markdown image line */
function parseMarkdownImage(markdown: string): MarkdownImage {
  // Regular expression to match Markdown image syntax
  const regex = /!\[([^\]]*)\]\(([^<\s][^ ]*)(?: "([^"]*)")?\)/;
  const match = regex.exec(markdown);

  if (match) {
    return {
      altText: match[1],  // Alt text inside the square brackets
      url: match[2],      // URL inside the parentheses
      title: match[3] || null  // Optional title inside the quotes (or null if not provided)
    };
  } else {
    throw new Error(`Invalid Markdown image syntax: "${markdown}"`);
  }
}

/**
 * Formats a Markdown image to Latex
 * @param str Markdown input
 * @param size Size string (number)(% or cm or mm)
 */
export function formatImage(str: string, size: string = "100%"): string {
  const regex = /(\d+(\.\d+)?)(%|cm|mm)/
  const match = regex.exec(size)
  let sizeString = size;
  if (match) {
    const item = match[0]
    if (item.endsWith("%")) {
      sizeString = Math.round(parseFloat(item))/100 + "\\linewidth"
    }
  } else {
    throw new Error(`Invalid size format: ${size}`)
  }

  const data: MarkdownImage = parseMarkdownImage(str);
  return `\\begin{figure}[H]
  \\centering
  \\includegraphics[width=${sizeString}]{${data.url}}
  \\caption{${data.title ?? data.altText}}
\\end{figure}`
}
