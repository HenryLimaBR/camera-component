export default class Camera {
  private mediaStream: MediaStream | undefined = undefined
  private frontCamera = true
  // TODO <- To prevents camera rotate while recording
  private recording = false
  private recorder = new MediaRecorder(new MediaStream())
  public videoData: Blob[] = []

  constructor() {
    // TODO (Clean [MediaStreams] and request permission (optional))
    this.createCameraStream()
  }

  public async createCameraStream(frontCamera: boolean = true) {
    this.frontCamera = frontCamera

    if (this.mediaStream) {
      const tracks = this.mediaStream.getTracks()
      tracks.forEach((track) => track.stop())
      this.mediaStream = undefined
    }

    const options: MediaStreamConstraints = {
      video: {
        height: {
          ideal: 1080,
          min: 720,
          max: 1080,
        },
        facingMode: this.frontCamera ? 'user' : 'environment',
      },
      audio: true,
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia(options)
      return this.mediaStream
    } catch (err) {
      console.error('Camera API Error:', err)
    }
  }

  public getCameraComponent() {
    // * Base Container
    const container = document.createElement('div')
    container.className = 'relative w-full h-full bg-black flex justify-center items-center flex-column'

    // * Video Component
    const video = document.createElement('video')
    video.className = 'w-full h-full bg-black object-contain aspect-[9/16]'
    video.muted = true
    container.appendChild(video)

    // * Controls Container
    const controlContainer = document.createElement('div')
    controlContainer.className =
      'absolute bottom-0 w-full h-24 flex justify-center items-center bg-zinc-950 bg-opacity-50'
    container.appendChild(controlContainer)

    // * Camera REC Counter
    const cameraRECCounter = document.createElement('p')
    cameraRECCounter.className = 'p-2 text-zinc-100 text-lg'
    controlContainer.appendChild(cameraRECCounter)
    cameraRECCounter.innerText = `00:00:00`

    // * Camera REC Button
    const cameraRECButton = document.createElement('button')
    cameraRECButton.className = 'p-2 text-zinc-100'
    controlContainer.appendChild(cameraRECButton)
    const cameraRECIcon = document.createElement('i')
    cameraRECIcon.className = 'ph-thin ph-record text-6xl'
    cameraRECButton.appendChild(cameraRECIcon)

    // * Camera Change Button
    const cameraChangeButton = document.createElement('button')
    cameraChangeButton.className = 'absolute p-2 right-0 mr-4 text-4xl'
    controlContainer.appendChild(cameraChangeButton)
    const cameraChangeIcon = document.createElement('i')
    cameraChangeIcon.className = 'ph-thin ph-swap text-zinc-100'
    cameraChangeButton.appendChild(cameraChangeIcon)

    const selectVideo = async (front = true) => {
      if (video.srcObject instanceof MediaStream) {
        const stream = video.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
        video.srcObject = null
      }

      const newStream = (await this.createCameraStream(front)) as MediaStream
      video.srcObject = newStream
    }

    video.addEventListener('loadedmetadata', () => {
      video.play()
    })

    cameraChangeButton.addEventListener('click', () => {
      selectVideo(!this.frontCamera)
    })

    cameraRECButton.addEventListener('touchstart', () => {
      if (!this.mediaStream) {
        return
      }

      cameraRECButton.classList.add('text-red-400')

      this.recorder = new MediaRecorder(this.mediaStream, {
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: 2500000,
        mimeType: 'video/webm',
      })

      this.recorder.addEventListener('dataavailable', (blob) => {
        this.videoData.push(blob.data)
      })

      this.recording = true
      this.recorder.start()
    })

    cameraRECButton.addEventListener('touchend', () => {
      this.recorder.addEventListener('stop', () => {
        const blob = new Blob(this.videoData, { type: 'video/webm' })
        this.videoData = []
        const url = URL.createObjectURL(blob)
        const dl = document.createElement('a')
        dl.download = `v-${new Date().toDateString().replace('/', '')}-${new Date()
          .toTimeString()
          .replace(':', '')}.webm`
        dl.href = url
        dl.click()
      })

      this.recording = false
      this.recorder.stop()

      cameraRECButton.classList.remove('text-red-600')
    })

    selectVideo(true)

    return container
  }
}
