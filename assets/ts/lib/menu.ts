import { AriaAttributes, getExpanded, setExpanded, toggleExpanded } from './aria'

type MenuStructure = Array<
| {
  type: 'item'
  element: HTMLElement
  list: HTMLUListElement
  toggle: HTMLButtonElement
}
| {
  type: 'toggle'
  element: HTMLButtonElement
  list: HTMLUListElement
  items: MenuStructure
}
>

function getNearestFocusable (element: HTMLElement, tags: string[] = ['li', '*'], depth: number = 0, arr: HTMLElement[] = []): HTMLElement[] {
  if (depth >= tags.length) {
    return arr
  }

  for (
    let idx = 0, child = element.children[0] as HTMLElement;
    idx < element.children.length;
    child = element.children[++idx] as HTMLElement
  ) {
    if (tags[depth] === '*' || child.tagName.toLowerCase() === tags[depth].toLowerCase()) {
      if (depth === tags.length - 1) {
        if (child.getAttribute('tabindex') === '-1') {
          arr.push(child)
        }
      }

      getNearestFocusable(child, tags, depth + 1, arr)
    }
  }

  return arr
}

export function setUpMenuStructure (menu: HTMLUListElement, toggle: HTMLButtonElement): MenuStructure {
  const structure: MenuStructure = []

  for (const item of getNearestFocusable(menu)) {
    const hasPopup = item.getAttribute(AriaAttributes.ARIA_HASPOPUP)
    if (hasPopup != null && hasPopup !== 'false') {
      const controls = item.getAttribute(AriaAttributes.ARIA_CONTROLS)

      if (controls == null) {
        throw new Error()
      }

      const subMenu: HTMLUListElement | null = menu.querySelector(`#${controls}`)

      if (subMenu == null) {
        throw new Error()
      }

      structure.push({
        type: 'toggle',
        element: item as HTMLButtonElement,
        list: subMenu,
        items: setUpMenuStructure(subMenu, item as HTMLButtonElement)
      })
    } else {
      structure.push({
        type: 'item',
        element: item,
        list: menu,
        toggle
      })
    }
  }

  return structure
}

function getStructureAt (structure: MenuStructure, indices: number[]): MenuStructure {
  const _indices = Array.from(indices)
  const index = _indices.shift() as number
  const subStructure = structure.at(index) as MenuStructure[number]

  if (_indices.length > 0) {
    return getStructureAt(
      (subStructure as Extract<MenuStructure[number], { type: 'toggle' }>).items,
      _indices
    )
  } else {
    return structure
  }
}

function setClickHandlers (structure: MenuStructure, currentIndex: number[], depth: number = 0): void {
  for (
    let idx = 0, entry = structure[0];
    idx < structure.length;
    entry = structure[++idx]
  ) {
    if (entry.type === 'item') {
      continue
    }

    entry.element.addEventListener('click', () => {
      const state = toggleExpanded(entry.element)

      currentIndex[depth] = idx

      if (state === 'true') {
        entry.items[0].element.focus()
        currentIndex[depth + 1] = 0
      } else {
        entry.element.focus()
      }
    })

    setClickHandlers(entry.items, currentIndex, depth + 1)
  }
}

export default function setUpMenu (menu: HTMLUListElement, toggle: HTMLButtonElement): { [method in 'open' | 'close' | 'toggle']: () => void } & { status: boolean } {
  const structure = setUpMenuStructure(menu, toggle)
  const currentIndex: number[] = []

  toggle.addEventListener('click', () => {
    const state = toggleExpanded(toggle)

    if (state === 'true') {
      structure[0].element.focus()
      currentIndex[0] = 0
    } else {
      toggle.focus()
      delete currentIndex[0]
    }
  })

  setClickHandlers(structure, currentIndex)

  menu.addEventListener('keydown', event => {
    const current = getStructureAt(structure, currentIndex)

    if ((event.key === 'Tab' && !event.shiftKey) || event.key === 'ArrowDown') {
      event.preventDefault()
      const newIndex = ((currentIndex.at(-1) as number) + 1) % current.length
      current[newIndex].element.focus()
      currentIndex[currentIndex.length - 1] = newIndex
    } else if ((event.key === 'Tab' && event.shiftKey) || event.key === 'ArrowUp') {
      event.preventDefault()
      const newIndex = ((currentIndex.at(-1) as number) + current.length - 1) % current.length
      current[newIndex].element.focus()
      currentIndex[currentIndex.length - 1] = newIndex
    } else if (event.key === 'Enter' || event.code === 'Space') {
      const currentItem = current[currentIndex.at(-1) as number]
      if (currentItem.type === 'toggle') {
        event.preventDefault()
        setExpanded(currentItem.element, true)
        currentItem.items[0].element.focus()
        currentIndex.push(0)
      }
    } else if (event.key === 'Escape') {
      event.preventDefault()
      if (currentIndex.length === 1) {
        toggle.focus()
        setExpanded(toggle, false)
        delete currentIndex[0]
      } else {
        const parentStructure = getStructureAt(structure, currentIndex.slice(0, -1))
        const parent = parentStructure[currentIndex.at(-2) as number]
        parent.element.focus()
        setExpanded(parent.element, false)
        currentIndex.pop()
      }
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      const currentItem = current[currentIndex.at(-1) as number]
      if (currentItem.type === 'toggle') {
        setExpanded(currentItem.element, true)
        currentItem.items[0].element.focus()
        currentIndex.push(0)
      }
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      if (currentIndex.length > 1) {
        const parentStructure = getStructureAt(structure, currentIndex.slice(0, -1))
        const parent = parentStructure[currentIndex.at(-2) as number]
        parent.element.focus()
        setExpanded(parent.element, false)
        currentIndex.pop()
      }
    }
  })

  return {
    open () {
      setExpanded(toggle, true)
      structure[0].element.focus()
      currentIndex.splice(0, currentIndex.length, 0)
    },
    close () {
      setExpanded(toggle, false)
      toggle.focus()
      currentIndex.splice(0, currentIndex.length)
    },
    toggle () {
      const state = toggleExpanded(toggle)

      if (state === 'true') {
        structure[0].element.focus()
        currentIndex.splice(0, currentIndex.length, 0)
      } else {
        toggle.focus()
        currentIndex.splice(0, currentIndex.length)
      }
    },
    get status () {
      return getExpanded(toggle)
    }
  }
}
