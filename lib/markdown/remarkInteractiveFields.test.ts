import type { Root } from "mdast";
import { describe, expect, it } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkInteractiveFields from "./remarkInteractiveFields";
import { applyValuesToMarkdown } from "./serialize";

async function transform(source: string): Promise<Root> {
  const processor = unified().use(remarkParse).use(remarkInteractiveFields);
  return processor.run(processor.parse(source)) as Promise<Root>;
}

describe("HTML line breaks", () => {
  it.each(["<br>", "<br/>", "<br />", "<BR>"])("renders %s as a Markdown break", async (tag) => {
    const tree = await transform(`first${tag}second`);
    const paragraph = tree.children[0];

    expect(paragraph).toMatchObject({
      type: "paragraph",
      children: [
        { type: "text", value: "first" },
        { type: "break" },
        { type: "text", value: "second" },
      ],
    });
  });

  it("leaves other HTML inert", async () => {
    const tree = await transform("first<span>hidden</span>second<br class=\"wide\">third");
    const paragraph = tree.children[0];

    expect(paragraph).toMatchObject({
      type: "paragraph",
      children: [
        { type: "text", value: "first" },
        { type: "html", value: "<span>" },
        { type: "text", value: "hidden" },
        { type: "html", value: "</span>" },
        { type: "text", value: "second" },
        { type: "html", value: "<br class=\"wide\">" },
        { type: "text", value: "third" },
      ],
    });
  });

  it("preserves the original break tag when serializing field values", () => {
    const source = "Name: _____<br/>Next line";

    expect(applyValuesToMarkdown(source, {
      "field-1": { type: "text", value: "Ada" },
    })).toBe("Name: Ada<br/>Next line");
    expect(source).toBe("Name: _____<br/>Next line");
  });
});
