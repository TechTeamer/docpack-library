// Check for supported languages https://pygments.org/languages/

/**
 * Formats Markdown code section to Latex minted environment
 * @param str Input Markdown
 */
export function formatCode(str: string): string {
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  // const matches = str.match(codeBlockRegex);
  // if (!matches) {
  //   throw Error(`Codeblock not found: ${str}`)
  // }
  return str.replace(codeBlockRegex, (match, lang, code) => {
    if (lang === "mermaid") {
      throw Error('Mermaid code cannot be formatted! Use the mermaid formatter!')
    }
    lang = lang || 'text'; // Default to "text" if no language is specified
    return `\\begin{minted}[breaklines,breaksymbolleft=\\quad]{${lang}}\n${code}\\end{minted}`;
  });
}
