/**
 * Calculates inner width (width without border and padding) of an element.
 * @param element Element to get inner width for
 * @returns Inner width in px
 */
export function innerWidth (element: AnyElement): number {
  const outerWidth = element.clientWidth
  const styles = getComputedStyle(element)

  const borderInline = [styles.borderInlineStartWidth, styles.borderInlineEndWidth]
    .reduce((prev, cur) => prev + parseFloat(cur), 0)
  const paddingInline = [styles.paddingInlineStart, styles.paddingInlineEnd]
    .reduce((prev, cur) => prev + parseFloat(cur), 0)

  return outerWidth - borderInline - paddingInline
}

/**
 * Calculates px value from em value
 * @param elem Element to base em on
 * @param value Value in rem
 * @return Value in px
 */
export function em (element: AnyElement, value: number): number {
  const em1 = parseFloat(getComputedStyle(element).fontSize)

  return value * em1
}

/**
 * Calculates px value from rem value
 * @param value Value in rem
 * @return Value in px
 */
export function rem (value: number): number {
  return em(document.documentElement, value)
}
