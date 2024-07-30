// Check https://github.com/lvjr/tabularray for the full specification!

import {type HTMLElement} from 'node-html-parser';

type HorizontalAlignment = "left" | "center" | "right" | "justify";
type VerticalAlignment = "top" | "middle" | "bottom" | "head" | "foot";

interface Column {
  type: string;
  size: number;
}

interface ColumnSpec {
  columns: Column[]
}

interface RowSpec {

}

interface TableConfiguration {
  columnSpec: ColumnSpec,
  rowSpec: RowSpec,
  env: string;
  headerRowCount: number,
  footerRowCount: number,
  hAlign: HorizontalAlignment;
  vAlign: VerticalAlignment;
  row?: {
    [key: string]: {
      hAlign?: HorizontalAlignment,
      vAlign?: VerticalAlignment,
      color?: string
    }
  }
}

function getChildren(node: HTMLElement): HTMLElement[] {
  return Array.from(node.childNodes) as HTMLElement[]
}

function formatChildren(node: HTMLElement) {
  return getChildren(node)
    .map(node => prettyPrint(node))
    .join(" ")
    .replaceAll(" .", ".")
}

function sanitize(str: string): string {
  return str.replaceAll("\\", "\\\\")
    .replaceAll("$", "\\$")
    .replaceAll("#", "\\#")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_")
    .replaceAll("^", "\\^{}")
    .replaceAll("&", "\\&")
}

/** Pretty prints the DOM structure recursively. */
function prettyPrint(node: HTMLElement, result: string = ''): string {
  const nodeName = node.tagName ? node.tagName.toLowerCase() : 'text';

  if (nodeName === 'em') {
    result += `\\textit{${formatChildren(node)}}`
  } else if (nodeName === 'strong') {
    result += `\\textbf{${formatChildren(node)}}`
  } else if (nodeName === 'del') {
    result += `\\sout{${formatChildren(node)}}`
  } else if (node.childNodes.length === 0) {
    result += sanitize(node.text.trim());
  } else if (nodeName === 'p') {
    result += (`${formatChildren(node)}\n\n`);
  } else if (nodeName === 'table') {
    const thead = getChildren(node)
      .find(n => n.tagName?.toLowerCase() === 'thead') as HTMLElement
    const headRow = getChildren(thead).find(n => n.tagName?.toLowerCase() === 'tr') as HTMLElement
    const headCol = getChildren(headRow).filter(n => n.tagName?.toLowerCase() === 'th')
    const headData = headCol.map(n => formatChildren(n))

    const tbody = getChildren(node)
      .find(n => n.tagName?.toLowerCase() === 'tbody') as HTMLElement
    const bodyRow = getChildren(tbody).filter(n => n.tagName?.toLowerCase() === 'tr')


    result += "\\hline\n"
    result += headData.join(" & ");
    if (bodyRow.length > 0) {
      result += " \\\\\n\\hline\n"
    }
    bodyRow.forEach((n, index, array) => {
      result += getChildren(n)
        .filter(n => n.tagName?.toLowerCase() === 'td')
        .map(n => formatChildren(n)).join(" & ")
      result += " \\\\\n\\hline\n"
    });

  } else {
    result = prettyPrint(node.firstChild as HTMLElement, result);
  }
  return result;
}

function getTableColumnAlignments(table: HTMLElement): string[] {
  const thead = getChildren(table)
    .find(n => n.tagName?.toLowerCase() === 'thead') as HTMLElement
  const headRow = getChildren(thead).find(n => n.tagName?.toLowerCase() === 'tr') as HTMLElement
  const headCol = getChildren(headRow).filter(n => n.tagName?.toLowerCase() === 'th')
  return  headCol.map(n => n.attributes.align ?? 'left').map(s => s[0]);
}

export function generateTableConfiguration(str: string): string {
  return "";
}

export function generateTableData(str: string): string {
  return str;
}

export function renderTable(tableConfig: TableConfiguration): string {
  return "";
}
