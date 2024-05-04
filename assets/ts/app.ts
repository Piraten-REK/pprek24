type Openable<Element extends HTMLElement> = Element & {
  dataset: {
    state: 'opened' | 'closed'
    [key: string]: string | null
  }
}

const body = document.body as HTMLBodyElement
const menuToggle = document.querySelector('.site-header .menu-toggle') as HTMLButtonElement
const siteNav = document.querySelector('#_site-nav.site-nav') as Openable<HTMLAreaElement>
const siteNavAccordionToggles: Array<Openable<HTMLButtonElement>> = Array.from(document.querySelectorAll('#_site-nav.site-nav .site-nav-accordion-toggler'))
const siteNavSubMenus: Array<Openable<HTMLDivElement>> = Array.from(document.querySelectorAll('#_site-nav.site-nav .site-nav-accordion-toggler + div'))

function siteNavSubMenuOpen (menu: Openable<HTMLDivElement>): void {
  menu.dataset.state = 'opened'
  menu.ariaExpanded = 'true'
  console.log(menu)
  const toggler = document.querySelector(`.site-nav-accordion-toggler[aria-controls='${menu.id}']`) as HTMLButtonElement
  toggler.title = 'Weniger anzeigen'
}

function siteNavSubMenuClose (menu: Openable<HTMLDivElement>): void {
  menu.ariaExpanded = 'false'
  menu.addEventListener('transitionend', () => {
    if (menu.ariaExpanded === 'false') {
      menu.dataset.state = 'closed'
    }
  }, {
    once: true
  })

  const toggler = document.querySelector(`.site-nav-accordion-toggler[aria-controls='${menu.id}']`) as HTMLButtonElement
  toggler.title = 'Mehr anzeigen'
}

function siteNavOpen (): void {
  body.dataset.menuOpen = 'true'
  siteNav.dataset.state = 'opened'
  siteNav.ariaExpanded = 'true'
  menuToggle.title = 'Navigation schließen'
}

function siteNavClose (): void {
  body.dataset.menuOpen = 'false'
  siteNav.ariaExpanded = 'false'

  siteNav.addEventListener('transitionend', () => {
    if (siteNav.ariaExpanded === 'true') {
      return
    }

    siteNav.dataset.state = 'closed'

    for (const subMenu of siteNavSubMenus) {
      subMenu.ariaExpanded = 'false'
      subMenu.dataset.state = 'closed'
    }
  }, {
    once: true
  })

  menuToggle.title = 'Navigation öffnen'
}

menuToggle.addEventListener('click', () => {
  if (body.dataset.menuOpen === 'true') {
    siteNavClose()
  } else {
    siteNavOpen()
  }
})

for (const toggle of siteNavAccordionToggles) {
  const menuId = toggle.getAttribute('aria-controls') as string
  const menu = document.getElementById(menuId) as Openable<HTMLDivElement>

  toggle.addEventListener('click', () => {
    if (menu.ariaExpanded === 'true') {
      siteNavSubMenuClose(menu)
    } else {
      for (const subMenu of siteNavSubMenus) {
        if (subMenu === menu || subMenu.dataset.state === 'closed') {
          continue
        }

        siteNavSubMenuClose(subMenu)
      }

      siteNavSubMenuOpen(menu)
    }
  })
}

siteNav.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    siteNavClose()
    menuToggle.focus()
  }
})

window.addEventListener('click', event => {
  const target = event.target as EventTarget & HTMLElement
  if (
    target.closest('.site-header .menu-toggle') == null &&
    target.closest('.site-nav') == null
  ) {
    siteNavClose()
  }
})
