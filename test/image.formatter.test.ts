import {describe, expect, test} from "vitest";
import {formatImage} from "../src/image.formatter";


describe("Image formatter tests",  () => {

  test("correct markdown image input generates correct output",  () => {
    const input = `![Hello](assets/hello.png "hello world")`
    const result = formatImage(input)
    const expectedResult = `\\begin{figure}[H]
  \\centering
  \\includegraphics[width=1\\linewidth]{assets/hello.png}
  \\caption{hello world}
\\end{figure}`
    expect(result).toBe(expectedResult)
  })

  test("incorrect input with spaces in file name throws error",  () => {
    const input = `![Hello](assets/hello world.png "hello world")`
    expect(() => formatImage(input)).toThrow()
  })


  test("not markdown image input throws error", () => {
    const input = "This is not an image line";
    expect(() => formatImage(input)).toThrow();
  })

  test("incorrect markdown image with <> around the file name throws error", () => {
    const input = `![Hello](<assets/hello.png> "hello world")`
    expect(() => formatImage(input)).toThrow()
  })

  test("custom size format will generate correct output", () => {
    const input = `![Hello](assets/hello.png "hello world")`
    const result = formatImage(input, "10cm")
    const expectedResult = `\\begin{figure}[H]
  \\centering
  \\includegraphics[width=10cm]{assets/hello.png}
  \\caption{hello world}
\\end{figure}`
    expect(result).toBe(expectedResult)
  })

  test("incorrect size format will throw error", () => {
    const input = `![Hello](assets/hello.png "hello world")`
    expect(() => formatImage(input, "yeeet")).toThrow()
  })

  test("markdown title is used in caption when provided", () => {
    const input = `![Hello](assets/hello.png "Title")`
    const result = formatImage(input, "10cm")
    const expectedResult = `\\begin{figure}[H]
  \\centering
  \\includegraphics[width=10cm]{assets/hello.png}
  \\caption{Title}
\\end{figure}`
    expect(result).toBe(expectedResult)
  })

  test("markdown alt text is used in caption when no title provided", () => {
    const input = `![Hello](assets/hello.png)`
    const result = formatImage(input, "10cm")
    const expectedResult = `\\begin{figure}[H]
  \\centering
  \\includegraphics[width=10cm]{assets/hello.png}
  \\caption{Hello}
\\end{figure}`
    expect(result).toBe(expectedResult)
  })

  test("no text in caption when no title and no alt text provided", () => {
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
