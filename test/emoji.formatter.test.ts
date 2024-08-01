import {cleanEmojis, formatEmojis} from "../src/emoji.formatter";
import {describe, expect, test} from "vitest";

describe("Emoji conversations", () => {
  test("It can replace one emoji", () => {
    const input = "Test 😅.";
    const result = formatEmojis(input)
    const expectedResult = "Test \\emoji{sweat-smile}."
    expect(result).toBe(expectedResult)
  })

  test("It can replace multiple emojis", () => {
    const input = "Test 😅 ✅ ❌ 🎈";
    const result = formatEmojis(input)
    const expectedResult = "Test \\emoji{sweat-smile} \\emoji{white-check-mark} \\emoji{x} \\emoji{balloon}"
    expect(result).toBe(expectedResult)
  })

  test("It will not replace anything for text without emojis", () => {
    const input = "Test Without emojis";
    const result = formatEmojis(input);
    expect(result).toBe(input)
  });

  test("It will clean up the emojis", () => {
    const input = "Test 😅 ✅ ❌ 🎈 alma";
    const result = cleanEmojis(input);
    const expectedResult = "Test alma"
    expect(result).toBe(expectedResult)
  });

});
