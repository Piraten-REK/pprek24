// import handleOutsideClick from './lib/handleOutsideClick'
// import setUpMenu from './lib/menu'
// import { innerWidth, rem } from './lib/styles'
import SiteNav from './inc/SiteNav'

// const HEADER_PADDING = rem(4)

// const siteNavList = document.querySelector('.site-nav ul') as HTMLUListElement
// const siteNavToggle = document.querySelector('.site-nav-toggle') as HTMLButtonElement
// const siteNav = setUpMenu(siteNavList, siteNavToggle)

// handleOutsideClick(siteNavList, event => {
//   if (!siteNav.status) {
//     return
//   }

//   let node = event.target as Element | null

//   while (node != null && node.nodeType !== Node.DOCUMENT_NODE) {
//     if (node === siteNavList || node === siteNavToggle) {
//       return
//     }
//     node = node.parentElement ?? null
//   }

//   siteNav.close()
// })

const siteNav = new SiteNav()
console.log(siteNav)

// const siteNavNav = document.querySelector('.site-nav') as HTMLAreaElement
// const navWidth = siteNavNav.clientWidth

// function siteNavWatcher (): (() => void) {
//   const headerElement = document.querySelector('.site-header') as HTMLAreaElement
//   const headerWidth = innerWidth(headerElement)
//   const titleElement = document.querySelector('.site-title') as HTMLDivElement
//   const titleWidth = titleElement.clientWidth
//   const delta = headerWidth - titleWidth - HEADER_PADDING

//   document.body.setAttribute('data-mobile-nav', (navWidth > delta).toString())

//   return siteNavWatcher
// }
// window.addEventListener('resize', siteNavWatcher())
