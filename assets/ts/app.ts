import setUpMenu from './lib/menu'

const siteNav = document.querySelector('.site-nav') as HTMLUListElement
const siteNavToggle = document.querySelector('.site-nav-toggle') as HTMLButtonElement
setUpMenu(siteNav, siteNavToggle)
