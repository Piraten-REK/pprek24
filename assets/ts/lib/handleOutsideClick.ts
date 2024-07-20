import { listen, ownerDocument } from 'dom-helpers'

export type MouseEventHandler = (event: MouseEvent) => void

export default function handleOutsideClick (element: AnyElement, eventHandler: MouseEventHandler): () => void {
  const doc = ownerDocument(element)

  return listen(
    doc as any,
    'click',
    eventHandler,
    true
  )
}
