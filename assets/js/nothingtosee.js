export default function nothingToSee () {
  const checkFor = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA']
  const logged = new Array(10)

  document.addEventListener('keydown', ({ code }) => {
    logged.push(code)
    logged.shift()

    if (logged.every((keyCode, idx) => keyCode === checkFor[idx])) {
      console.log('YOU FOUND ME!')
    }
  })
}
