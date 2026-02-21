import { describe, it, expect } from "vitest"
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import remarkRehype from "remark-rehype"
import rehypeStringify from "rehype-stringify"
import rehypeTableAlign from "../src/index.js"

describe("rehype-table-align", () => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeTableAlign)
    .use(rehypeStringify)

  it("converts basic markdown tables properly", async () => {
    const markdown = `
| a | b  |  c |  d  |
| - | :- | -: | :-: |
| 1 | 2  |  3 |  4  |
    `

    const file = await processor.process(markdown)
    const result = String(file)

    expect(result).toContain('<th style="text-align: left;">b</th>')
    expect(result).toContain('<th style="text-align: right;">c</th>')
    expect(result).toContain('<th style="text-align: center;">d</th>')

    expect(result).toContain("<th>a</th>")
    expect(result).toContain("<td>1</td>")
    expect(result).toContain('<td style="text-align: left;">2</td>')
    expect(result).toContain('<td style="text-align: right;">3</td>')
    expect(result).toContain('<td style="text-align: center;">4</td>')

    // Ensure there are no align attributes outputted
    expect(result).not.toContain('align="')
  })

  it("preserves existing style attributes", async () => {
    // For this, we bypass the markdown parser and construct an AST directly or use rehype to parse HTML
    // However, it's easier to just create a custom rehype processor stringifying hast directly
    const hastProcessor = unified().use(rehypeTableAlign).use(rehypeStringify)

    const tree: any = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "table",
          children: [
            {
              type: "element",
              tagName: "tr",
              children: [
                {
                  type: "element",
                  tagName: "td",
                  properties: { align: "right", style: "color: red" },
                  children: [{ type: "text", value: "content" }],
                },
                {
                  type: "element",
                  tagName: "td",
                  properties: { align: "center", style: "font-weight: bold;" },
                  children: [{ type: "text", value: "content2" }],
                },
              ],
            },
          ],
        },
      ],
    }

    const file = await hastProcessor.run(tree)
    const result = String(hastProcessor.stringify(file as any))

    expect(result).toContain('style="color: red; text-align: right;"')
    expect(result).toContain('style="font-weight: bold; text-align: center;"')
    expect(result).not.toContain('align="')
  })

  it("ignores other elements with align attribute", async () => {
    const hastProcessor = unified().use(rehypeTableAlign).use(rehypeStringify)

    const tree: any = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "div",
          properties: { align: "right" },
          children: [{ type: "text", value: "content" }],
        },
      ],
    }

    const file = await hastProcessor.run(tree)
    const result = String(hastProcessor.stringify(file as any))

    expect(result).toContain('align="right"')
    expect(result).not.toContain("style=")
  })

  it("converts basic markdown tables properly using class method", async () => {
    const classProcessor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeTableAlign, {
        method: "class",
        classes: {
          left: "text-left",
          center: "text-center",
          right: "text-right",
        },
      })
      .use(rehypeStringify)

    const markdown = `
| a | b  |  c |  d  |
| - | :- | -: | :-: |
| 1 | 2  |  3 |  4  |
    `

    const file = await classProcessor.process(markdown)
    const result = String(file)

    expect(result).toContain('<th class="text-left">b</th>')
    expect(result).toContain('<th class="text-right">c</th>')
    expect(result).toContain('<th class="text-center">d</th>')

    expect(result).toContain("<th>a</th>")
    expect(result).toContain("<td>1</td>")
    expect(result).toContain('<td class="text-left">2</td>')
    expect(result).toContain('<td class="text-right">3</td>')
    expect(result).toContain('<td class="text-center">4</td>')

    expect(result).not.toContain('align="')
  })

  it("appends to existing class names when using class method", async () => {
    const classProcessor = unified()
      .use(rehypeTableAlign, { method: "class" })
      .use(rehypeStringify)

    const tree: any = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "table",
          children: [
            {
              type: "element",
              tagName: "tr",
              children: [
                {
                  type: "element",
                  tagName: "td",
                  properties: { align: "right", className: ["existing-class"] },
                  children: [{ type: "text", value: "content" }],
                },
                {
                  type: "element",
                  tagName: "td",
                  properties: { align: "center", className: "string-class" },
                  children: [{ type: "text", value: "content2" }],
                },
              ],
            },
          ],
        },
      ],
    }

    const file = await classProcessor.run(tree)
    const result = String(classProcessor.stringify(file as any))

    expect(result).toContain('class="existing-class right"')
    expect(result).toContain('class="string-class center"')
    expect(result).not.toContain('align="')
  })
})
