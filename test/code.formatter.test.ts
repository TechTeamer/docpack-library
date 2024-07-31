import {describe, expect, test} from "vitest";
import {formatCode} from "../src/code.formatter";


describe("Code formatter tests", () => {

  test("Format code with language provided", () => {
    const input = `\`\`\`js\nconsole.log("hello world");\n\`\`\``
    const result = formatCode(input);
    const expectedResult =
      `\\begin{minted}[breaklines,breaksymbolleft=\\quad]{js}
console.log("hello world");
\\end{minted}`;
    expect(result).toBe(expectedResult);
  });

  test("Format code without language provided", () => {
    const input = `\`\`\`\nconsole.log("hello world");\n\`\`\``
    const result = formatCode(input);
    const expectedResult =
      `\\begin{minted}[breaklines,breaksymbolleft=\\quad]{text}
console.log("hello world");
\\end{minted}`;
    expect(result).toBe(expectedResult);
  })

  test("Throw error on non code block", () => {
    const input = `This is not a code block`
    expect(() => formatCode(input)).toThrow();
  })

  test("Throw error or Mermaid code block", () => {
    const input = `\`\`\`mermaid\ngraph\n    A-->B\n\`\`\``
    expect(() => formatCode(input)).toThrow("Mermaid code cannot be formatted! Use the mermaid formatter!");
  })

})
