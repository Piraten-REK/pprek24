import { ownerDocument } from 'dom-helpers'

export type MouseEventHandler = (event: MouseEvent) => void

export default function handleOutsideClick (element: AnyElement, eventHandler: MouseEventHandler): () => void {
  const doc = ownerDocument(element)
  doc.addEventListener('click', eventHandler, true)

  return () => removeEventListener('click', eventHandler)
}
