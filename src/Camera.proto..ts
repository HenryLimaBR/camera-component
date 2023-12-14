export default class Camera {
  private orientation: 'portrait' | 'landscape' = 'portrait'
  private stream: MediaStream | undefined = undefined
  public value = 0

  constructor() {
    this.detectOrientation()
  }

  private detectOrientation() {
    this.orientation = screen.orientation.type.includes('landscape') ? 'landscape' : 'portrait'
    
    let runs = 0

    const handleRotation = ({ beta }: DeviceOrientationEvent) => {
      if (typeof beta !== 'number') {
        return
      }
      
      if (runs >= 25) {
        this.value = Math.floor(beta)
        this.orientation = beta <= 30 || beta >= 150 ? "landscape" : 'portrait'
        runs = 0
      }

      runs++
    }

    window.addEventListener('deviceorientation', handleRotation.bind(this), true)
  }

  
}