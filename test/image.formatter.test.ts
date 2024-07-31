import {describe, expect, test} from "vitest";
import {formatImage} from "../src/image.formatter";


describe("Image formatter tests",  () => {

  test("correct input",  () => {
    const input = `![Hello](assets/hello.png "hello world")`
    const result = formatImage(input)
    const expectedResult = `\\begin{figure}[H]
  \\centering
  \\includegraphics[width=1\\linewidth]{assets/hello.png}
  \\caption{hello world}
\\end{figure}`
    expect(result).toBe(expectedResult)
  })

  test("incorrect text", () => {
    const input = "This is not an image line";
    expect(() => formatImage(input)).toThrow();
  })

  test("incorrect image format", () => {
    const input = `![Hello](<assets/hello.png> "hello world")`
    expect(() => formatImage(input)).toThrow()
  })

  test("custom size format", () => {
    const input = `![Hello](assets/hello.png "hello world")`
    const result = formatImage(input, "10cm")
    const expectedResult = `\\begin{figure}[H]
  \\centering
  \\includegraphics[width=10cm]{assets/hello.png}
  \\caption{hello world}
\\end{figure}`
    expect(result).toBe(expectedResult)
  })

  test("incorrect size format", () => {
    const input = `![Hello](assets/hello.png "hello world")`
    expect(() => formatImage(input, "yeeet")).toThrow()
  })

  test("title", () => {
    const input = `![Hello](assets/hello.png "Title")`
    const result = formatImage(input, "10cm")
    const expectedResult = `\\begin{figure}[H]
  \\centering
  \\includegraphics[width=10cm]{assets/hello.png}
  \\caption{Title}
\\end{figure}`
    expect(result).toBe(expectedResult)
  })

  test("alt text", () => {
    const input = `![Hello](assets/hello.png)`
    const result = formatImage(input, "10cm")
    const expectedResult = `\\begin{figure}[H]
  \\centering
  \\includegraphics[width=10cm]{assets/hello.png}
  \\caption{Hello}
\\end{figure}`
    expect(result).toBe(expectedResult)
  })

  test("no title no text", () => {
    const input = `![](assets/hello.png)`
    const result = formatImage(input, "10cm")
    const expectedResult = `\\begin{figure}[H]
  \\centering
  \\includegraphics[width=10cm]{assets/hello.png}
  \\caption{}
\\end{figure}`
    expect(result).toBe(expectedResult)
  })

})
