import { describe, it, expect } from "vitest";
import { labelFor } from "./store";

describe("lableFor", () => {
  it("return start for start", () => {
    expect(labelFor("start")).toBe("Start");
  });
  it("return Action for action", () => {
    expect(labelFor("action")).toBe("Action");
  });
});
