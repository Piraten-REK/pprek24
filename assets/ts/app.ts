const body = document.body as HTMLBodyElement
const menuToggle = document.querySelector('.site-header .menu-toggle') as HTMLButtonElement
const siteNav = document.querySelector('#_site-nav.site-nav') as HTMLAreaElement
const siteNavAccordionToggles = Array.from(document.querySelectorAll('#_site-nav.site-nav .site-nav-accordion-toggler') as NodeListOf<HTMLButtonElement>)
const siteNavSubMenus = Array.from(document.querySelectorAll('#_site-nav.site-nav .site-nav-accordion-toggler + div') as NodeListOf<HTMLDivElement>)

menuToggle.addEventListener('click', () => {
  const current = body.dataset.menuOpen === 'true'

  body.dataset.menuOpen = (!current).toString()
  siteNav.ariaExpanded = (!current).toString()

  if (current) {
    siteNavSubMenus.forEach(subMenu => {
      subMenu.ariaExpanded = 'false'
    })
  }
})

for (const toggle of siteNavAccordionToggles) {
  const menuId = toggle.getAttribute('aria-controls') as string
  const menu = document.getElementById(menuId) as HTMLDivElement

  toggle.addEventListener('click', () => {
    const current = menu.ariaExpanded === 'true'

    for (const subMenu of siteNavSubMenus) {
      if (subMenu === menu) {
        continue
      }

      subMenu.ariaExpanded = 'false'
    }

    menu.ariaExpanded = (!current).toString()
  })
}
