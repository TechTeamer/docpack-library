// Check https://github.com/lvjr/tabularray for the full specification!

import {type HTMLElement, parse} from 'node-html-parser';
import {marked} from 'marked';

type HorizontalAlignment = "left" | "center" | "right" | "justify";
type VerticalAlignment = "top" | "middle" | "bottom" | "head" | "foot";

interface RowColOption {
  hAlign?: HorizontalAlignment | string;
  vAlign?: VerticalAlignment | string;
  color?: string;
  extra?: { [key: string]: string }
}

interface ColumnSpecItem {
  type: string;
  size: number;
}

interface ColumnSpec {
  columns: ColumnSpecItem[]
}

interface RowSpec {

}

interface TableConfiguration {
  columnSpec: ColumnSpec;
  rowSpec?: RowSpec;
  columns: {
    vAlign?: VerticalAlignment,
    extra?: { [key: string]: string; }
  };
  env: "tblr" | "longtblr";
  headerRowCount: number,
  footerRowCount: number,
  column?: {
    [key: string]: RowColOption;
  };
  row?: {
    [key: string]: RowColOption;
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
  return headCol.map(n => n.attributes.align ?? 'left');
}

function generateAlignments(alignments: string[]): { [key: string]: RowColOption } {
  const data: { [key: string]: RowColOption } = {}

  for (let i = 0; i < alignments.length; i++) {
    data[`${i + 1}`] = {
      hAlign: alignments[i]
    };
  }

  return data;
}

export function generateTableConfiguration(table: HTMLElement): TableConfiguration {
  const alignments = getTableColumnAlignments(table)
  return {
    env: "longtblr",
    columnSpec: {
      columns: Array(alignments.length).fill("").map(() => ({
        type: "X",
        size: 1
      }))
    },
    columns: {
      vAlign: "middle",
    },
    column: generateAlignments(alignments),
    row: {
      "1": {
        hAlign: "center",
        color: "gray9"
      }
    },
    footerRowCount: 0,
    headerRowCount: 1
  };
}

function formatRow(row: { [p: string]: RowColOption }): string[] {
  return Object.entries(row).map(([k, v]) => {
    const vAlign = v.vAlign ? v.vAlign[0] : undefined;
    const hAlign = v.hAlign ? v.hAlign[0] : undefined;
    const options = [vAlign, hAlign, v.color, obj2strArr(v.extra)].flat().filter(x => !!x);
    return `row{${k}}={${options.join(",")}}`
  });
}

function formatColSpec(colspec: ColumnSpec) {
  return "colspec={|" + colspec.columns.map(col => `${col.type}[${col.size}]`).join("|") + "|}"
}

function generateTableData(table: HTMLElement): string {
  return prettyPrint(table);
}

function obj2strArr(obj: any): string[] {
  return Object.entries(obj ?? {}).map(([key, value]) => `${key}=${value}`)
}

function formatColumns(columns: { vAlign?: VerticalAlignment; extra?: { [p: string]: string } }): string {
  const colStr = [
    (columns.vAlign ?? "justify")[0],
    obj2strArr(columns.extra)
  ].flat().join(",");
  return `columns={${colStr}}`
}

function generateTableEnv(tableConfig: TableConfiguration): { begin: string, end: string } {
  const colSpec = formatColSpec(tableConfig.columnSpec);
  const columns = formatColumns(tableConfig.columns);
  const rowHead = `rowhead=${tableConfig.headerRowCount}`;
  const rowFoot = `rowfoot=${tableConfig.footerRowCount}`;
  const specificRows = formatRow(tableConfig.row ?? {}).join(",");
  const envStr = [colSpec, columns, specificRows, rowHead, rowFoot].join(",")
  const begin = `\\begin{${tableConfig.env}}[]{${envStr}}`;
  const end = `\\end{${tableConfig.env}}`;
  return {begin, end};
}

export function generateTable(str: string, tableConfig?: TableConfiguration) {
  const table = parse(marked.parse(str) as string).firstChild as HTMLElement;
  const config = tableConfig ?? generateTableConfiguration(table);
  const env = generateTableEnv(config);
  const content = generateTableData(table);
  return `${env.begin}\n${content}${env.end}`;
}
