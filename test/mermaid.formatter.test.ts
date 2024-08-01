import {afterAll, afterEach, beforeAll, describe, expect, test, vi} from "vitest";
import {formatMermaid} from "../src/mermaid.formatter";
import {existsSync, mkdirSync, rmSync} from "node:fs";

vi.mock('uuid', async (importOriginal) => {
  return {
    ...await importOriginal<typeof import('uuid')>(),
    v4: () => 'mocked'
  }
});

describe("Mermaid formatter", () => {

  beforeAll(() => {
    if (!existsSync("tmp")) {
      mkdirSync("tmp")
    }
  });

  afterEach(() => {
    expect.hasAssertions();
  })

  afterAll(() => rmSync("tmp", {force: true, recursive: true}));

  test("It generates a correct image with title", async () => {
    const input = `\`\`\`mermaid
graph
   accTitle: My title here
   accDescr: My description here
   A-->B
\`\`\``
    const result = await formatMermaid(input);
    const expectedResult = `\\begin{figure}[H]
  \\centering
  \\includegraphics[width=1\\linewidth]{tmp/mocked.png}
  \\caption{My title here}
\\end{figure}`;
    expect(result).toBe(expectedResult);
  });

  test("It generates a correct image without title", async () => {
    const input = `\`\`\`mermaid\ngraph\n   A-->B\n\`\`\``;
    const result = await formatMermaid(input);
    const expectedResult = `\\begin{figure}[H]
  \\centering
  \\includegraphics[width=1\\linewidth]{tmp/mocked.png}
  \\caption{}
\\end{figure}`;
    expect(result).toBe(expectedResult);
  });

  test("It generates a correct image with custom size", async () => {
    const input = `\`\`\`mermaid\ngraph\n   A-->B\n\`\`\``;
    const result = await formatMermaid(input, "12mm")
    const expectedResult = `\\begin{figure}[H]
  \\centering
  \\includegraphics[width=12mm]{tmp/mocked.png}
  \\caption{}
\\end{figure}`;
    expect(result).toBe(expectedResult);
  });

  test("It will throw error with not correct size", async () => {
    const input = `\`\`\`mermaid\ngraph\n   A-->B\n\`\`\``;
    expect(() => formatMermaid(input, "12px")).rejects.toThrow();
  });

  test("It will throw error not providing a code block", () => {
    const input = `Hello world`;
    expect(() => formatMermaid(input)).rejects.toThrow();
  });

  test("It will throw error not providing a language for the code block", () => {
    const input = `\`\`\`\nconsole.log("Hello world");\n\`\`\``;
    expect(() => formatMermaid(input)).rejects.toThrow();
  });

  test("It will throw error providing a non mermaid language for the code block", () => {
    const input = `\`\`\`js\nconsole.log("Hello world");\n\`\`\``;
    expect(() => formatMermaid(input)).rejects.toThrow();
  });

});
