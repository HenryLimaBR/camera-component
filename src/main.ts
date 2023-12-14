import './style.css'
import Camera from './Camera'

let camera = new Camera()

const startMedia = () => {
  document.body.appendChild(camera.getCameraComponent())
  window.removeEventListener('click', startMedia)
}

const invokeCamera = document.createElement('button')
invokeCamera.innerText = 'Invoke Camera'
invokeCamera.className = 'm-4 px-4 py-2 bg-zinc-950 text-zinc-100 rounded-lg'
invokeCamera.addEventListener('click', () => {
  document.body.innerHTML = ''
  startMedia()
})
document.body.appendChild(invokeCamera)
