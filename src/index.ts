/**
 * rehype-table-align
 * A rehype plugin to process Markdown table formatting by converting
 * deprecated HTML5 align attributes to modern CSS style properties.
 */
import { visit } from "unist-util-visit"
import type { Element, Root } from "hast"
import type { Plugin } from "unified"

/**
 * A rehype plugin to convert deprecated HTML5 `align` attributes
 * to modern inline CSS `style` properties on `<th>` and `<td>` elements.
 *
 * It is particularly useful when used with `remark-gfm` which outputs `align` attributes.
 *
 * @returns A unified transformer function.
 */
const rehypeTableAlign: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      // Process only table header and table data cells
      if (node.tagName === "th" || node.tagName === "td") {
        const properties = node.properties

        // Check if properties exist and the align attribute is present
        if (properties && properties.align != null) {
          const align = String(properties.align)
          const currentStyle = properties.style

          // Construct the new text-align CSS rule
          const newStyleRule = `text-align: ${align};`

          let updatedStyle = newStyleRule

          // Append to existing styles if present
          if (typeof currentStyle === "string" && currentStyle.trim() !== "") {
            updatedStyle = currentStyle.trim()
            if (!updatedStyle.endsWith(";")) {
              updatedStyle += ";"
            }
            updatedStyle += ` ${newStyleRule}`
          }

          // Update the style property and remove the align property
          properties.style = updatedStyle
          delete properties.align
        }
      }
    })
  }
}

export default rehypeTableAlign
