import { innerWidth, rem } from '../lib/styles'
import { AriaAttributes, setExpanded, toggleExpanded } from '../lib/aria'
import { use } from '../lib/utils'

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

  static header = document.querySelector('body > .site-header') as HTMLAreaElement
  static siteTitle = document.querySelector('body > .site-header > .site-title') as HTMLDivElement
  static toggle = document.querySelector('body > .site-header > .site-nav-toggle') as HTMLButtonElement
  static nav = document.querySelector('body > .site-header > .site-nav') as HTMLAreaElement
  static list = document.querySelector('body > .site-header > .site-nav > ul') as HTMLUListElement
  static structure = SiteNav.getStructure()

  static navWidth = SiteNav.nav.clientWidth

  #mobile = false
  #open = false
  #indices: number[] = []

  constructor (headerPadding: number = rem(4)) {
    this.headerPadding = headerPadding

    window.addEventListener('resize', this.navWatcher())

    this.addClickListeners()
  }

  get mobile (): boolean {
    return this.#mobile
  }

  set mobile (value: boolean) {
    if (value !== this.#mobile) {
      this.#mobile = value
      document.body.setAttribute('data-mobile-nav', value.toString())

      for (const elem of SiteNav.firstLevelElements()) {
        if (value) {
          elem.setAttribute('tabindex', '-1')
        } else {
          elem.removeAttribute('tabindex')
        }
      }
    }
  }

  get open (): boolean {
    return this.#open
  }

  set open (value: boolean) {
    if (value !== this.open) {
      this.#open = value
      setExpanded(SiteNav.toggle, value)
    }
  }

  get closed (): boolean {
    return !this.#open
  }

  set closed (value: boolean) {
    if (value === this.#open) {
      this.#open = !value
      setExpanded(SiteNav.toggle, !value)
    }
  }

  get indices (): number[] {
    return [...this.#indices]
  }

  get current (): MenuStructure[number] | undefined {
    if (this.#indices.length === 0) {
      return undefined
    }

    let structure = SiteNav.structure
    const idx = this.indices
    const lastIndex = idx.pop() as number
    while (idx.length > 0) {
      structure = (structure[idx.shift() as number] as Extract<MenuStructure[number], { type: 'toggle' }>).items
    }

    return structure[lastIndex]
  }

  private navWatcher (): (() => void) {
    const headerWidth = innerWidth(SiteNav.header)
    const titleWidth = SiteNav.siteTitle.clientWidth
    const delta = headerWidth - titleWidth - this.headerPadding

    this.mobile = SiteNav.navWidth > delta

    return this.navWatcher.bind(this)
  }

  private addClickListeners (structure: MenuStructure = SiteNav.structure, index: number[] = []): void {
    for (let idx = 0, item = structure[0]; idx < structure.length; item = structure[++idx]) {
      if (item.type === 'item') {
        continue
      }

      item.element.addEventListener('click', () => {
        const state = toggleExpanded(item.element)

        if (state) {
          // close currently open
          const current = this.current
          if (current != null) {
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
  }

  private static * firstLevelElements (list: HTMLUListElement = SiteNav.list): Generator<HTMLButtonElement | HTMLAnchorElement, void, unknown> {
    for (const child of Array.from(list.children)) {
      for (const grandchild of Array.from(child.children)) {
        if (grandchild instanceof HTMLAnchorElement || grandchild instanceof HTMLButtonElement) {
          yield grandchild
        }
      }
    }
  }

  private static getStructure (list: HTMLUListElement = SiteNav.list, toggle: HTMLButtonElement = SiteNav.toggle): MenuStructure {
    const structure: MutableMenuStructure = []

    for (const item of SiteNav.firstLevelElements(list)) {
      const hasPopup = use(item.getAttribute(AriaAttributes.ARIA_HASPOPUP), it => it != null && it !== 'false')

      if (hasPopup) {
        const controls = item.getAttribute(AriaAttributes.ARIA_CONTROLS)

        if (controls == null) {
          throw new ReferenceError(`${AriaAttributes.ARIA_CONTROLS} unset`)
        }

        const subMenu: HTMLUListElement | null = list.querySelector(`#${controls}`)

        console.log(controls, subMenu, list)

        if (subMenu == null) {
          throw new ReferenceError(`${AriaAttributes.ARIA_CONTROLS} "${controls}" invalid`)
        }

        structure.push({
          type: 'toggle',
          element: item as HTMLButtonElement,
          list: subMenu,
          toggle,
          items: SiteNav.getStructure(subMenu, item as HTMLButtonElement)
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
