import handleOutsideClick from './lib/handleOutsideClick'
import setUpMenu from './lib/menu'

const siteNavList = document.querySelector('.site-nav') as HTMLUListElement
const siteNavToggle = document.querySelector('.site-nav-toggle') as HTMLButtonElement
const siteNav = setUpMenu(siteNavList, siteNavToggle)

handleOutsideClick(siteNavList, event => {
  if (!siteNav.status) {
    return
  }

  let node = event.target as Element | null

  while (node != null && node.nodeType !== Node.DOCUMENT_NODE) {
    if (node === siteNavList) {
      return
    }
    node = node.parentElement ?? null
  }

  siteNav.close()
})
