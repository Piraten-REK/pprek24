import { innerWidth, rem } from '../lib/styles'
import { AriaAttributes, setExpanded, toggleExpanded } from '../lib/aria'
import handleOutsideClick from '../lib/handleOutsideClick'

type MutableMenuStructure = Array<
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
  toggle: HTMLButtonElement
  items: MenuStructure
}
>

type MenuStructure = ReadonlyArray<
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
  toggle: HTMLButtonElement
  items: MenuStructure
}
>

export default class SiteNav {
  readonly headerPadding: number

  header = document.querySelector('body > .site-header') as HTMLAreaElement
  siteTitle = document.querySelector('body > .site-header > .site-title') as HTMLDivElement
  toggle = document.querySelector('body > .site-header > .site-nav-toggle') as HTMLButtonElement
  nav = document.querySelector('body > .site-header > .site-nav') as HTMLAreaElement
  list = document.querySelector('body > .site-header > .site-nav > ul') as HTMLUListElement
  structure = this.getStructure()

  navWidth = this.nav.clientWidth

  #mobile = false
  #indices: number[] = []

  constructor (headerPadding: number = rem(4)) {
    this.headerPadding = headerPadding

    window.addEventListener('resize', this.navWatcher())

    this.toggle.addEventListener('click', () => {
      const state = this.toggleOpen()
      if (state) {
        this.structure[0].element.focus()
      }
    })
    this.addClickListeners()
    this.list.addEventListener('keydown', this.keyboardListener.bind(this))
  }

  get mobile (): boolean {
    return this.#mobile
  }

  set mobile (value: boolean) {
    if (value !== this.#mobile) {
      this.#mobile = value
      document.body.setAttribute('data-mobile-nav', value.toString())

      for (const elem of this.firstLevelElements()) {
        if (value) {
          elem.setAttribute('tabindex', '-1')
        } else {
          elem.removeAttribute('tabindex')
        }
      }
    }
  }

  get open (): boolean {
    return this.#indices.length > 0
  }

  set open (value: boolean) {
    if (value !== this.open) {
      this.#indices = [0]
      setExpanded(this.toggle, value)

      if (!value) {
        let current = this.current
        while (current != null) {
          setExpanded(current.toggle, false)
          this.#indices.pop()
          current = this.current
        }
      }
    }
  }

  get closed (): boolean {
    return !this.open
  }

  set closed (value: boolean) {
    if (value === this.open) {
      setExpanded(this.toggle, !value)

      if (value) {
        let current = this.current
        while (current != null) {
          setExpanded(current.toggle, false)
          this.#indices.pop()
          current = this.current
        }
      }
    }
  }

  get indices (): number[] {
    return [...this.#indices]
  }

  get current (): MenuStructure[number] | undefined {
    if (this.#indices.length === 0) {
      return undefined
    }

    let structure = this.structure
    const idx = this.indices
    const lastIndex = idx.pop() as number
    while (idx.length > 0) {
      structure = (structure[idx.shift() as number] as Extract<MenuStructure[number], { type: 'toggle' }>).items
    }

    return structure[lastIndex]
  }

  toggleOpen (): boolean {
    this.open = this.closed
    return this.open
  }

  private navWatcher (): (() => void) {
    const headerWidth = innerWidth(this.header)
    const titleWidth = this.siteTitle.clientWidth
    const delta = headerWidth - titleWidth - this.headerPadding

    this.mobile = this.navWidth > delta

    return this.navWatcher.bind(this)
  }

  private addClickListeners (structure: MenuStructure = this.structure, index: number[] = []): void {
    for (let idx = 0, item = structure[0]; idx < structure.length; item = structure[++idx]) {
      if (item.type === 'item') {
        continue
      }

      item.element.addEventListener('click', () => {
        const state = toggleExpanded(item.element)

        if (state) {
          // close currently open
          const current = this.current
          if (this.#indices.length > 1 && current != null) {
            setExpanded(current.toggle, false)
          }

          // set focus to first child
          item.items[0].element.focus()
          // set current index
          this.#indices = [...index, idx, 0]
        } else {
          // set focus to element
          item.element.focus()
          // set current index
          this.#indices = [...index, idx]
        }
      })

      this.addClickListeners(item.items, [...index, idx])
    }

    handleOutsideClick(this.list, event => {
      if (this.closed) {
        return
      }

      let node = event.target as Element | null

      while (node != null && node.nodeType !== Node.DOCUMENT_NODE) {
        if (node === this.list || node === this.toggle) {
          return
        }

        node = node.parentElement
      }

      this.closed = true
    })
  }

  private keyboardListener (event: KeyboardEvent): void {
    if (this.indices.length === 0) {
      this.setIndicesByElement(event.target as HTMLElement)
    }

    if (event.key === 'Tab' && !event.shiftKey) {
      if (this.indices.length === 1) {
        if (this.mobile) {
          // mobile
          event.preventDefault()
          this.incrementIndex()
          this.current?.element?.focus()
        } else {
          // desktop
          if (this.indices[0] === this.structure.length - 1) {
            this.closed = true
          } else {
            this.incrementIndex(false)
          }
        }
      } else {
        event.preventDefault()
        this.incrementIndex()
        this.current?.element?.focus()
      }
    } else if (event.key === 'Tab' && event.shiftKey) {
      if (this.indices.length === 1) {
        if (this.mobile) {
          // mobile
          event.preventDefault()
          this.decrementIndex()
          this.current?.element?.focus()
        } else {
          // desktop
          if (this.indices[0] === 0) {
            this.closed = true
          } else {
            this.decrementIndex(false)
          }
        }
      } else {
        event.preventDefault()
        this.decrementIndex()
        this.current?.element?.focus()
      }
    } else if (event.key === 'Enter' || event.code === 'Space') {
      if (this.current?.type === 'toggle') {
        event.preventDefault()
        setExpanded(this.current.element, true)
        this.current.items[0].element.focus()
        this.#indices.push(0)
      }
    } else if (event.key === 'Escape') {
      if (!this.mobile && this.#indices.length === 1) {
        return
      }
      setExpanded(this.current?.toggle as HTMLButtonElement, false)
      this.current?.toggle?.focus()
      this.#indices.pop()
    } else if (event.key === 'ArrowUp') {
      if (!this.mobile && this.#indices.length === 1) {
        return
      }
      event.preventDefault()
      this.decrementIndex()
      this.current?.element?.focus()
    } else if (event.key === 'ArrowDown') {
      if (!this.mobile && this.#indices.length === 1) {
        if (this.current?.type === 'toggle') {
          event.preventDefault()
          setExpanded(this.current.element, true)
          this.current.items[0].element.focus()
          this.#indices.push(0)
        }
        return
      }
      event.preventDefault()
      this.incrementIndex()
      this.current?.element?.focus()
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      if (this.current?.type !== 'toggle') {
        return
      } else if (!this.mobile && this.indices.length === 1) {
        this.incrementIndex()
        this.current?.element?.focus()
        return
      }
      setExpanded(this.current.element, true)
      this.current.items[0].element.focus()
      this.#indices.push(0)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      if (!this.mobile && this.indices.length === 1) {
        this.decrementIndex()
        this.current?.element?.focus()
        return
      }
      setExpanded(this.current?.toggle as HTMLButtonElement, false)
      this.current?.toggle?.focus()
      this.#indices.pop()
    }
  }

  incrementIndex (overflow: boolean = true): void {
    if (overflow) {
      let structure = this.structure
      const idx = this.indices.slice(0, -1)
      while (idx.length > 0) {
        structure = (structure[idx.shift() as number] as Extract<MenuStructure[number], { type: 'toggle' }>).items
      }

      this.#indices[this.#indices.length - 1] = (this.#indices[this.#indices.length - 1] + structure.length + 1) % structure.length
    } else {
      this.#indices[this.#indices.length - 1]++
    }
  }

  decrementIndex (overflow: boolean = true): void {
    if (overflow) {
      let structure = this.structure
      const idx = this.indices.slice(0, -1)
      while (idx.length > 0) {
        structure = (structure[idx.shift() as number] as Extract<MenuStructure[number], { type: 'toggle' }>).items
      }

      this.#indices[this.#indices.length - 1] = (this.#indices[this.#indices.length - 1] + structure.length - 1) % structure.length
    } else {
      this.#indices[this.#indices.length - 1]--
    }
  }

  private setIndicesByElement (element: HTMLElement, structure: MenuStructure = this.structure, index: number[] = []): boolean {
    for (let idx = 0, item = structure[0]; idx < structure.length; item = structure[++idx]) {
      if (item.element === element) {
        this.#indices = [...index, idx]
        return true
      }
      if (item.type === 'toggle') {
        if (this.setIndicesByElement(item.element, item.items, [...index, idx])) {
          return true
        }
      }
    }

    return false
  }

  private * firstLevelElements (list: HTMLUListElement = this.list): Generator<HTMLButtonElement | HTMLAnchorElement, void, unknown> {
    for (const child of Array.from(list.children)) {
      for (const grandchild of Array.from(child.children)) {
        if (grandchild instanceof HTMLAnchorElement || grandchild instanceof HTMLButtonElement) {
          yield grandchild
        }
      }
    }
  }

  private getStructure (list: HTMLUListElement = this.list, toggle: HTMLButtonElement = this.toggle): MenuStructure {
    const structure: MutableMenuStructure = []

    for (const item of this.firstLevelElements(list)) {
      const hasPopup = item.getAttribute(AriaAttributes.ARIA_EXPANDED) != null

      if (hasPopup) {
        const controls = item.getAttribute(AriaAttributes.ARIA_CONTROLS)

        if (controls == null) {
          throw new ReferenceError(`${AriaAttributes.ARIA_CONTROLS} unset`)
        }

        const subMenu: HTMLUListElement | null = list.querySelector(`#${controls}`)

        if (subMenu == null) {
          throw new ReferenceError(`${AriaAttributes.ARIA_CONTROLS} "${controls}" invalid`)
        }

        structure.push({
          type: 'toggle',
          element: item as HTMLButtonElement,
          list: subMenu,
          toggle,
          items: this.getStructure(subMenu, item as HTMLButtonElement)
        })
      } else {
        structure.push({
          type: 'item',
          element: item,
          list,
          toggle
        })
      }
    }

    return Object.freeze(structure)
  }
}
