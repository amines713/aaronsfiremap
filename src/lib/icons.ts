const margin = 2
const _width = 40

class BlankDropletIcon {
  width = 60
  height = 60
  data = new Uint8Array(60 * 60 * 4)
  fill = ''
  context: any

  constructor(newfill: string) {
    this.fill = newfill
  }

  onAdd() {
    const canvas = document.createElement('canvas')
    canvas.width = this.width
    canvas.height = this.height
    this.context = canvas.getContext('2d')
  }

  render() {
    const context = this.context

    context.clearRect(0, 0, this.width, this.height);

    // Full shape
    context.beginPath()
    context.moveTo(30, 60)
    context.lineTo(20, 50)
    context.arc(
      30,
      30,
      20,
      6 * Math.PI / 8,
      18 * Math.PI / 8
    )
    context.lineTo(30, 60)
    context.fillStyle = this.fill
    context.strokeStyle = 'white'
    context.lineWidth = 2
    context.fill()
    context.stroke()

    // Inner circle
    context.beginPath()
    context.arc(
      30,
      30,
      10,
      0,
      2 * Math.PI
    )
    context.fillStyle = 'rgba(255, 255, 255, 1)'
    context.fill()

    this.data = context.getImageData(
      0,
      0,
      this.width,
      this.height
    ).data;

    // map.triggerRepaint();
    return true
  }
}

const blankIcon = new BlankDropletIcon('#EE9143')
const blankIconTwo = new BlankDropletIcon('#00ff00')

export { blankIcon, blankIconTwo }
