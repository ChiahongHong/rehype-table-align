# rehype-table-align

[![npm version](https://img.shields.io/npm/v/rehype-table-align.svg)](https://www.npmjs.com/package/rehype-table-align)
[![CI Status](https://github.com/ChiahongHong/rehype-table-align/actions/workflows/ci.yaml/badge.svg)](https://github.com/ChiahongHong/rehype-table-align/actions)
[![codecov](https://codecov.io/gh/ChiahongHong/rehype-table-align/branch/main/graph/badge.svg)](https://codecov.io/gh/ChiahongHong/rehype-table-align)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

**rehype-table-align** is a [rehype](https://github.com/rehypejs/rehype) plugin that handles Markdown table text alignment issues by converting deprecated HTML5 `align` attributes to inline CSS `style` properties (e.g., `text-align: center;`).

## Why this plugin?

In standard table generation (often paired with `remark-gfm`), alignment properties mapped from Markdown tables `| :--- | :---: | ---: |` generate `align` attributes on `<th>` and `<td>` elements:

```html
<th align="center">Title</th>
```

However, the `align` attribute on table elements is officially deprecated in HTML5. This plugin ensures your html is compliant with modern web standards by transforming these into inline CSS correctly, whilst intelligently managing and appending to any existing styles:

```html
<th style="text-align: center;">Title</th>
```

## Installation

You can install this package using npm, pnpm, or yarn.

### npm

```bash
npm install rehype-table-align
```

### pnpm

```bash
pnpm add rehype-table-align
```

### yarn

```bash
yarn add rehype-table-align
```

## Usage

Here is a common unified processing pipeline using `remark-parse`, `remark-gfm`, `remark-rehype`, `rehype-table-align`, and `rehype-stringify`:

```ts
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import remarkRehype from "remark-rehype"
import rehypeTableAlign from "rehype-table-align"
import rehypeStringify from "rehype-stringify"

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)        // Supports markdown tables
  .use(remarkRehype)     // Converts Markdown AST to HTML AST
  .use(rehypeTableAlign) // Converts align attributes to styles
  .use(rehypeStringify)

const markdown = `
| Default | Left | Center | Right |
| ------- | :--- | :----: | ----: |
| 1       | 2    | 3      | 4     |
`

const file = await processor.process(markdown)
console.log(String(file))
```

Yields:

```html
<table>
  <thead>
    <tr>
      <th>Default</th>
      <th style="text-align: left;">Left</th>
      <th style="text-align: center;">Center</th>
      <th style="text-align: right;">Right</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td style="text-align: left;">2</td>
      <td style="text-align: center;">3</td>
      <td style="text-align: right;">4</td>
    </tr>
  </tbody>
</table>
```

## Types

This package provides generic TypeScript definitions out-of-the-box. It correctly types the plugin as a `Plugin<[], Root>` for the `hast` ecosystem.

## License

[MIT](LICENSE) © Chiahong Hong
