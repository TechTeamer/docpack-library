import {addTwo} from "../src/index.ts";
import {describe, test, expect} from "vitest";

describe("Demo test", () => {

  test("Should add 2 to a number", () => {
    expect(addTwo(5)).toEqual(7);
  });

})
