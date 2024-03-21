export function asPixels (input: string): number {
  const asFloat = parseFloat(input)

  if (input.endsWith('px')) {
    return asFloat
  } else if (input.endsWith('rem')) {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
    return rem * asFloat
  }

  console.warn('Could not convert %s to pxs', input)
  return asFloat
}
