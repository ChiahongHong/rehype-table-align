/**
 * rehype-table-align
 * A rehype plugin to process Markdown table formatting by converting
 * deprecated HTML5 align attributes to modern CSS style properties.
 */
import { visit } from "unist-util-visit"
import type { Element, Root } from "hast"
import type { Plugin } from "unified"

export interface RehypeTableAlignOptions {
  /**
   * The alignment method.
   * 'style' uses inline CSS properties (e.g., `text-align: center;`).
   * 'class' uses class names (e.g., `class="center"`).
   * @default 'style'
   */
  method?: "style" | "class"

  /**
   * When `method` is 'class', these are the class names to use.
   * @default { left: 'left', center: 'center', right: 'right' }
   */
  classes?: {
    left?: string
    center?: string
    right?: string
  }
}

/**
 * A rehype plugin to convert deprecated HTML5 `align` attributes
 * to modern inline CSS `style` properties or class names on `<th>` and `<td>` elements.
 *
 * It is particularly useful when used with `remark-gfm` which outputs `align` attributes.
 *
 * @returns A unified transformer function.
 */
const rehypeTableAlign: Plugin<[RehypeTableAlignOptions?], Root> = (
  options = {},
) => {
  const method = options.method || "style"
  const classes = {
    left: options.classes?.left || "left",
    center: options.classes?.center || "center",
    right: options.classes?.right || "right",
  }

  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      // Process only table header and table data cells
      if (node.tagName === "th" || node.tagName === "td") {
        const properties = node.properties

        // Check if properties exist and the align attribute is present
        if (properties && properties.align != null) {
          const align = String(properties.align)

          if (
            method === "class" &&
            (align === "left" || align === "center" || align === "right")
          ) {
            // Class-based alignment
            const classNameToAdd = classes[align]
            const currentClass = properties.className

            if (Array.isArray(currentClass)) {
              currentClass.push(classNameToAdd)
            } else if (typeof currentClass === "string") {
              properties.className = [currentClass, classNameToAdd]
            } else {
              properties.className = [classNameToAdd]
            }
          } else {
            // Style-based alignment (default)
            const currentStyle = properties.style
            const newStyleRule = `text-align: ${align};`
            let updatedStyle = newStyleRule

            // Append to existing styles if present
            if (
              typeof currentStyle === "string" &&
              currentStyle.trim() !== ""
            ) {
              updatedStyle = currentStyle.trim()
              if (!updatedStyle.endsWith(";")) {
                updatedStyle += ";"
              }
              updatedStyle += ` ${newStyleRule}`
            }

            properties.style = updatedStyle
          }

          // Remove the align property
          delete properties.align
        }
      }
    })
  }
}

export default rehypeTableAlign
