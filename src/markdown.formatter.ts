// In case of issues, check https://www.overleaf.com/learn/how-to/Writing_Markdown_in_LaTeX_Documents

/**
 * Formats raw Markdown
 * @param str Input Markdown
 * @param forceBreakLine Force break lines where unbreakable words are
 */
export function formatMarkdown(str: string, forceBreakLine: boolean): string {
  let text = `\\begin{markdown}\n${str}\n\\end{markdown}`
  if (forceBreakLine) {
    text = `\\begin{sloppypar}\n${text}\n\\end{sloppypar}`
  }
  return text
}
