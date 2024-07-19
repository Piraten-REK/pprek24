export type BoolString = 'true' | 'false'

type AnyElement = HTMLElement | SVGElement

declare global {
  interface Boolean {
    toString: () => BoolString
  }
}

export enum AriaAttributes {
  ARIA_CONTROLS = 'aria-controls',
  ARIA_EXPANDED = 'aria-expanded',
  ARIA_HASPOPUP = 'aria-haspopup'
}

export function toggleExpanded (element: AnyElement): BoolString {
  const current = element.getAttribute(AriaAttributes.ARIA_EXPANDED) === 'true'
  const newValue = (!current).toString()

  element.setAttribute(AriaAttributes.ARIA_EXPANDED, newValue)

  return newValue
}

export function getExpanded (element: AnyElement): boolean {
  return Boolean(element.getAttribute(AriaAttributes.ARIA_EXPANDED))
}

export function setExpanded (element: AnyElement, value: BoolString | boolean): void {
  element.setAttribute(AriaAttributes.ARIA_EXPANDED, value.toString())
}
