// import { asPixels } from './helpers'

export default function header (): void {
  const headerElement = document.querySelector('.site_header') as HTMLAreaElement
  const navigationToggler = document.querySelector('.site_nav__toggle') as HTMLButtonElement
  const navigation = document.querySelector('.site_nav') as HTMLAreaElement
  let isNavigationOpen = false

  navigationToggler.addEventListener('click', function () {
    isNavigationOpen = !isNavigationOpen

    // Set data attribute of header and toggler
    headerElement.dataset.navigationOpen = isNavigationOpen.toString()
    this.dataset.opened = isNavigationOpen.toString()

    // Set aria attribute of navigation
    navigation.setAttribute('aria-expanded', isNavigationOpen.toString())
  })
}
