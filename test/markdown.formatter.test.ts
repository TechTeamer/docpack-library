import {describe, expect, test} from "vitest";
import {formatMarkdown} from "../src/markdown.formatter";


describe("Markdown formatter", () => {

  test("Format text correctly without forceBreakLine", () => {
    const input = "# Hello world\n\n## This is a H2\n\nHello world"
    const result = formatMarkdown(input, false);
    const expectedResult =
      `\\begin{markdown}
# Hello world

## This is a H2

Hello world
\\end{markdown}`;
    expect(result).toBe(expectedResult);
  });

  test("Format text correctly with forceBreakLine", () => {
    const input = "# Hello world\n\n## This is a H2\n\nHello world"
    const result = formatMarkdown(input, true);
    const expectedResult =
      `\\begin{sloppypar}
\\begin{markdown}
# Hello world

## This is a H2

Hello world
\\end{markdown}
\\end{sloppypar}`;
    expect(result).toBe(expectedResult);
  });

  test("Format text correctly without forceBreakLine with hybrid mode", () => {
    const input = "# Hello world\n\n## This is a H2\n\nHello world"
    const result = formatMarkdown(input, false, true);
    const expectedResult =
      `\\begin{markdown}[hybrid]
# Hello world

## This is a H2

Hello world
\\end{markdown}`;
    expect(result).toBe(expectedResult);
  });
})
