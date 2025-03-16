// Utility functions
const clampPixel = (value: number, max: number) => Math.min(Math.max(value, 0), max - 1)

const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const getRandomFloat = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}

const createCanvas = (width: number, height: number) => {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  return canvas
}

// Effect definitions with their parameters
export const effectDefinitions = [
  {
    id: "rgbShift",
    label: "RGB Shift",
    params: [
      { id: "redOffset", label: "Red Offset", min: -50, max: 50 },
      { id: "greenOffset", label: "Green Offset", min: -50, max: 50 },
      { id: "blueOffset", label: "Blue Offset", min: -50, max: 50 },
    ],
  },
  {
    id: "noise",
    label: "Noise",
    params: [
      { id: "amount", label: "Amount", min: 0, max: 1 },
      { id: "size", label: "Size", min: 1, max: 10 },
    ],
  },
  {
    id: "monochrome",
    label: "Monochrome",
    toggleOnly: true,
  },
  {
    id: "glitchText",
    label: "Glitch Text",
    params: [
      { id: "amount", label: "Amount", min: 0, max: 100 },
      { id: "size", label: "Size", min: 10, max: 50 },
      { id: "opacity", label: "Opacity", min: 0, max: 1 },
      { id: "rotation", label: "Rotation", min: -180, max: 180 },
    ],
    textTypes: [
      { id: "404", label: "404/500/503" },
      { id: "error", label: "ERROR/FAIL" },
      { id: "sad", label: ":/ :( !?" },
    ],
    colorTypes: [
      { id: "white", label: "White", color: "#FFFFFF" },
      { id: "black", label: "Black", color: "#000000" },
      { id: "blue", label: "Blue", color: "#0066FF" },
    ],
  },
  {
    id: "wave",
    label: "Wave",
    params: [
      { id: "pattern", label: "Pattern", min: 0, max: 1 },
      { id: "skew", label: "Skew", min: 0, max: 1 },
    ],
  },
  {
    id: "scanlines",
    label: "Scanlines",
    params: [
      { id: "spacing", label: "Spacing", min: 1, max: 50 },
      { id: "thickness", label: "Thickness", min: 1, max: 10 },
      { id: "opacity", label: "Opacity", min: 0, max: 1 },
    ],
    toggles: [{ id: "radial", label: "Radial Mode" }],
  },
  {
    id: "tvStatic",
    label: "TV Static",
    param: "amount",
    min: 0,
    max: 1,
  },
  {
    id: "vhsDistortion",
    label: "VHS Distortion",
    param: "strength",
    min: 0,
    max: 1,
  },
  {
    id: "corruptEdges",
    label: "Corrupt Edges",
    params: [
      { id: "amount", label: "Amount", min: 0, max: 1 },
      { id: "density", label: "Density", min: 0, max: 1 },
      { id: "thickness", label: "Thickness", min: 1, max: 20 },
      { id: "intensity", label: "Intensity", min: 0, max: 1 },
      { id: "chaos", label: "Chaos", min: 0, max: 1 },
    ],
    toggles: [
      { id: "invertColor", label: "Invert Color" },
      { id: "pixelate", label: "Pixelate Edges" },
      { id: "rgbSplit", label: "RGB Split" },
    ],
  },
  {
    id: "circuitBend",
    label: "Circuit Bend",
    param: "chaos",
    min: 0,
    max: 1,
  },
  {
    id: "stretchSmear",
    label: "Stretch/Smear",
    param: "amount",
    min: 0,
    max: 1,
  },
  {
    id: "echoTrails",
    label: "Echo Trails",
    params: [
      { id: "amount", label: "Amount", min: 0, max: 1 },
      { id: "direction", label: "Direction", min: 0, max: 1 },
    ],
  },
  {
    id: "fractalDistortion",
    label: "Fractal Distortion",
    params: [
      { id: "complexity", label: "Complexity", min: 0, max: 1 },
      { id: "intensity", label: "Intensity", min: 0, max: 1 },
      { id: "iterations", label: "Iterations", min: 1, max: 10 },
    ],
    toggles: [
      { id: "mirror", label: "Mirror Effect" },
      { id: "rotate", label: "Rotation" },
    ],
  },
  {
    id: "invertColors",
    label: "Invert Colors",
    type: "toggle",
  },
  {
    id: "posterize",
    label: "Posterize",
    params: [{ id: "intensity", label: "Intensity", min: 2, max: 16 }],
  },
  {
    id: "pixelate",
    label: "Pixelate",
    params: [
      { id: "size", label: "Size", min: 2, max: 32 },
      { id: "intensity", label: "Intensity", min: 0, max: 1 },
      { id: "random", label: "Random Areas", min: 0, max: 1 },
    ],
  },
  {
    id: "burnedEdge",
    label: "Burned Edge",
    params: [
      { id: "amount", label: "Amount", min: 0, max: 2 },
      { id: "feather", label: "Feather", min: 0, max: 1 },
    ],
    toggles: [
      { id: "white", label: "White Edge" },
      { id: "invertEdge", label: "Invert Edge Color" },
    ],
  },
]

// Effect implementations
const effectFunctions: Record<string, (ctx: CanvasRenderingContext2D, params: any) => void> = {
  rgbShift: (ctx, { redOffset = 0, greenOffset = 0, blueOffset = 0 }) => {
    const { width, height } = ctx.canvas
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    const tempData = new Uint8ClampedArray(data)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4

        // Red channel
        const rx = clampPixel(x + redOffset, width)
        const ri = (y * width + rx) * 4
        data[i] = tempData[ri]

        // Green channel
        const gx = clampPixel(x + greenOffset, width)
        const gi = (y * width + gx) * 4
        data[i + 1] = tempData[gi + 1]

        // Blue channel
        const bx = clampPixel(x + blueOffset, width)
        const bi = (y * width + bx) * 4
        data[i + 2] = tempData[bi + 2]
      }
    }

    ctx.putImageData(imageData, 0, 0)
  },

  noise: (ctx, { amount = 0.5, size = 1 }) => {
    const { width, height } = ctx.canvas
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    const pixelSize = Math.max(1, Math.floor(size))
    const noiseIntensity = amount * 255

    for (let y = 0; y < height; y += pixelSize) {
      for (let x = 0; x < width; x += pixelSize) {
        if (Math.random() < amount * 0.3) {
          const noise = (Math.random() - 0.5) * noiseIntensity

          // Apply noise to a block of pixels
          for (let py = 0; py < pixelSize && y + py < height; py++) {
            for (let px = 0; px < pixelSize && x + px < width; px++) {
              const i = ((y + py) * width + (x + px)) * 4

              // Gradually apply noise
              data[i] = Math.min(Math.max(0, data[i] + noise * Math.random()), 255)
              data[i + 1] = Math.min(Math.max(0, data[i + 1] + noise * Math.random()), 255)
              data[i + 2] = Math.min(Math.max(0, data[i + 2] + noise * Math.random()), 255)
            }
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0)
  },

  monochrome: (ctx) => {
    const { width, height } = ctx.canvas
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
      data[i] = avg
      data[i + 1] = avg
      data[i + 2] = avg
    }

    ctx.putImageData(imageData, 0, 0)
  },

  wave: (ctx, { pattern = 0.5, skew = 0.5 }) => {
    const { width, height } = ctx.canvas
    const tempCanvas = createCanvas(width, height)
    const tempCtx = tempCanvas.getContext("2d")

    if (!tempCtx) return

    tempCtx.drawImage(ctx.canvas, 0, 0)
    ctx.clearRect(0, 0, width, height)

    const waveFrequency = 0.01 + pattern * 0.03
    const waveAmplitude = height * (0.02 + pattern * 0.08)
    const skewAmount = skew * 30

    ctx.save()
    ctx.translate(width / 2, height / 2)
    ctx.transform(1, Math.tan((skewAmount * Math.PI) / 180), 0, 1, 0, 0)
    ctx.translate(-width / 2, -height / 2)

    for (let x = 0; x < width; x++) {
      const distortion = Math.sin(x * waveFrequency) * waveAmplitude
      ctx.drawImage(tempCanvas, x, 0, 1, height, x, distortion, 1, height)
    }

    ctx.restore()
  },

  scanlines: (ctx, { spacing = 10, thickness = 2, opacity = 0.5, radial = false }) => {
    const { width, height } = ctx.canvas
    const tempCanvas = document.createElement("canvas")
    tempCanvas.width = width * 2 // Make temp canvas larger to handle rotation
    tempCanvas.height = height * 2
    const tempCtx = tempCanvas.getContext("2d")

    if (!tempCtx) return

    // Clear temp canvas with transparency
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)

    if (radial) {
      // Draw radial scanlines
      tempCtx.save()
      tempCtx.translate(width, height) // Center of expanded canvas

      const maxRadius = Math.sqrt(width * width + height * height) * 1.5 // Ensure lines extend beyond corners

      tempCtx.globalAlpha = opacity
      tempCtx.fillStyle = "#000"

      for (let i = 0; i < 360; i += 2) {
        // Adjust angle step for density
        tempCtx.save()
        tempCtx.rotate((i * Math.PI) / 180)

        for (let j = -maxRadius; j < maxRadius; j += spacing) {
          tempCtx.fillRect(j, -thickness / 2, spacing - 1, thickness)
        }

        tempCtx.restore()
      }
      tempCtx.restore()

      // Draw the radial pattern onto the main canvas
      ctx.save()
      ctx.globalCompositeOperation = "overlay"
      ctx.drawImage(tempCanvas, -width / 2, -height / 2)
      ctx.restore()
    } else {
      // Draw horizontal scanlines
      tempCtx.globalAlpha = opacity
      tempCtx.fillStyle = "#000"

      for (let y = 0; y < height * 2; y += spacing) {
        tempCtx.fillRect(0, y, width * 2, thickness)
      }

      // Apply the scanlines with overlay blend mode
      ctx.save()
      ctx.globalCompositeOperation = "overlay"
      ctx.drawImage(tempCanvas, 0, 0, width, height)
      ctx.restore()
    }
  },

  tvStatic: (ctx, { amount = 0.3 }) => {
    const { width, height } = ctx.canvas
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() < amount) {
        const noise = Math.random() * 255
        data[i] = data[i + 1] = data[i + 2] = noise
      }
    }

    ctx.putImageData(imageData, 0, 0)
  },

  vhsDistortion: (ctx, { strength = 0.4 }) => {
    const { width, height } = ctx.canvas
    const tempCanvas = createCanvas(width, height)
    const tempCtx = tempCanvas.getContext("2d")

    if (!tempCtx) return

    tempCtx.drawImage(ctx.canvas, 0, 0)
    ctx.clearRect(0, 0, width, height)

    const numBands = Math.floor(10 + strength * 20)
    const bandHeight = Math.floor(height / numBands)

    for (let i = 0; i < numBands; i++) {
      const y = i * bandHeight
      const offset = Math.random() * strength * width * 0.1
      const h = bandHeight + Math.random() * bandHeight * 0.2

      ctx.drawImage(tempCanvas, 0, y, width, h, offset, y, width, h)
    }
  },

  corruptEdges: (
    ctx,
    {
      amount = 0.5,
      density = 0.5,
      thickness = 5,
      intensity = 0.5,
      chaos = 0.5,
      invertColor = false,
      pixelate = false,
      rgbSplit = false,
    },
  ) => {
    const { width, height } = ctx.canvas

    // Create a temporary canvas for the original image
    const tempCanvas = createCanvas(width, height)
    const tempCtx = tempCanvas.getContext("2d")
    if (!tempCtx) return

    // Copy the original image
    tempCtx.drawImage(ctx.canvas, 0, 0)

    // Get image data for manipulation
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    // Calculate edge parameters
    const edgeWidth = Math.floor(width * 0.15 * amount) // Wider edge area
    const numCorruptions = Math.floor(10 + density * 50) // More corruptions based on density

    // Create corruption patterns
    for (let i = 0; i < numCorruptions; i++) {
      // Randomly choose an edge (left, right, top, bottom)
      const edge = Math.floor(Math.random() * 4)

      // Determine corruption type (more variety)
      const corruptionType = Math.floor(Math.random() * 5)

      // Calculate corruption position and size
      let x1, y1, x2, y2, corruptionWidth, corruptionHeight

      switch (edge) {
        case 0: // Left edge
          x1 = 0
          y1 = Math.floor(Math.random() * height)
          corruptionWidth = Math.floor(edgeWidth * (0.5 + Math.random() * 0.5))
          corruptionHeight = Math.floor(thickness * (1 + chaos * 5))
          x2 = x1 + corruptionWidth
          y2 = y1 + corruptionHeight
          break
        case 1: // Right edge
          corruptionWidth = Math.floor(edgeWidth * (0.5 + Math.random() * 0.5))
          x1 = width - corruptionWidth
          y1 = Math.floor(Math.random() * height)
          corruptionHeight = Math.floor(thickness * (1 + chaos * 5))
          x2 = width
          y2 = y1 + corruptionHeight
          break
        case 2: // Top edge
          x1 = Math.floor(Math.random() * width)
          y1 = 0
          corruptionWidth = Math.floor(thickness * (1 + chaos * 5))
          corruptionHeight = Math.floor(edgeWidth * (0.5 + Math.random() * 0.5))
          x2 = x1 + corruptionWidth
          y2 = y1 + corruptionHeight
          break
        case 3: // Bottom edge
          x1 = Math.floor(Math.random() * width)
          corruptionHeight = Math.floor(edgeWidth * (0.5 + Math.random() * 0.5))
          y1 = height - corruptionHeight
          corruptionWidth = Math.floor(thickness * (1 + chaos * 5))
          x2 = x1 + corruptionWidth
          y2 = height
          break
        default:
          x1 = 0
          y1 = 0
          x2 = 0
          y2 = 0
          corruptionWidth = 0
          corruptionHeight = 0
      }

      // Apply different corruption effects based on type
      switch (corruptionType) {
        case 0: // Block shift
          if (x2 > x1 && y2 > y1) {
            // Shift block horizontally
            const shiftAmount = Math.floor(corruptionWidth * chaos * 2) - corruptionWidth

            // Draw the shifted block
            ctx.save()
            ctx.globalAlpha = 0.7 + intensity * 0.3
            ctx.drawImage(
              tempCanvas,
              x1,
              y1,
              corruptionWidth,
              corruptionHeight,
              x1 + shiftAmount,
              y1,
              corruptionWidth,
              corruptionHeight,
            )
            ctx.restore()
          }
          break

        case 1: // Color corruption
          for (let y = y1; y < y2 && y < height; y++) {
            for (let x = x1; x < x2 && x < width; x++) {
              const i = (y * width + x) * 4

              if (rgbSplit && Math.random() < 0.5) {
                // RGB channel split
                const offset = Math.floor(chaos * 10)
                const rx = clampPixel(x + offset, width)
                const ri = (y * width + rx) * 4

                const gx = clampPixel(x - offset, width)
                const gi = (y * width + gx) * 4

                data[i] = data[ri] // Red from offset position
                data[i + 1] = data[gi + 1] // Green from negative offset
                // Blue stays the same
              } else if (invertColor) {
                // Invert colors
                data[i] = 255 - data[i]
                data[i + 1] = 255 - data[i + 1]
                data[i + 2] = 255 - data[i + 2]
              } else if (Math.random() < intensity) {
                // Random color corruption
                data[i] = Math.random() < 0.5 ? 0 : 255
                data[i + 1] = Math.random() < 0.5 ? 0 : 255
                data[i + 2] = Math.random() < 0.5 ? 0 : 255
              }
            }
          }
          break

        case 2: // Pixelation
          if (pixelate) {
            const pixelSize = Math.max(2, Math.floor(thickness / 2))

            for (let py = Math.floor(y1 / pixelSize) * pixelSize; py < y2; py += pixelSize) {
              for (let px = Math.floor(x1 / pixelSize) * pixelSize; px < x2; px += pixelSize) {
                // Sample a pixel from this block
                const sx = Math.min(px, width - 1)
                const sy = Math.min(py, height - 1)
                const si = (sy * width + sx) * 4

                // Get the color of the sample pixel
                const r = data[si]
                const g = data[si + 1]
                const b = data[si + 2]

                // Apply the color to the entire block
                for (let y = 0; y < pixelSize; y++) {
                  for (let x = 0; x < pixelSize; x++) {
                    const tx = px + x
                    const ty = py + y

                    if (tx < width && ty < height && tx >= 0 && ty >= 0) {
                      const ti = (ty * width + tx) * 4
                      data[ti] = r
                      data[ti + 1] = g
                      data[ti + 2] = b
                    }
                  }
                }
              }
            }
          }
          break

        case 3: // Glitch lines
          const numLines = Math.floor(3 + chaos * 7)
          const lineHeight = Math.max(1, Math.floor(corruptionHeight / numLines))

          for (let line = 0; line < numLines; line++) {
            const ly = y1 + line * lineHeight
            const lh = Math.min(lineHeight, y2 - ly)

            if (lh > 0) {
              // Horizontal shift for this line
              const lineShift = Math.floor((Math.random() - 0.5) * corruptionWidth * 2 * chaos)

              // Draw the shifted line
              ctx.save()
              ctx.globalAlpha = 0.8 + intensity * 0.2
              ctx.drawImage(tempCanvas, x1, ly, corruptionWidth, lh, x1 + lineShift, ly, corruptionWidth, lh)
              ctx.restore()
            }
          }
          break

        case 4: // Data corruption (random noise)
          for (let y = y1; y < y2 && y < height; y++) {
            for (let x = x1; x < x2 && x < width; x++) {
              if (Math.random() < intensity * 0.7) {
                const i = (y * width + x) * 4

                // Create digital-looking corruption
                if (Math.random() < 0.3) {
                  // Complete corruption - random values
                  data[i] = Math.floor(Math.random() * 256)
                  data[i + 1] = Math.floor(Math.random() * 256)
                  data[i + 2] = Math.floor(Math.random() * 256)
                } else {
                  // Bit-level corruption - flip some bits
                  data[i] ^= 1 << Math.floor(Math.random() * 8)
                  data[i + 1] ^= 1 << Math.floor(Math.random() * 8)
                  data[i + 2] ^= 1 << Math.floor(Math.random() * 8)
                }
              }
            }
          }
          break
      }
    }

    // Add occasional full-width horizontal glitch lines
    if (chaos > 0.3) {
      const numHorizontalGlitches = Math.floor(chaos * 5)

      for (let i = 0; i < numHorizontalGlitches; i++) {
        const y = Math.floor(Math.random() * height)
        const h = Math.max(1, Math.floor(thickness * (0.5 + Math.random())))
        const offset = Math.floor((Math.random() - 0.5) * width * 0.2 * chaos)

        // Draw the shifted horizontal line
        ctx.save()
        ctx.globalAlpha = 0.7 + intensity * 0.3
        ctx.drawImage(tempCanvas, 0, y, width, h, offset, y, width, h)
        ctx.restore()
      }
    }

    // Apply the modified image data
    ctx.putImageData(imageData, 0, 0)
  },

  glitchText: (ctx, { amount = 50, size = 30, opacity = 1, rotation = 0, textTypes = {}, colorTypes = {} }) => {
    const { width, height } = ctx.canvas
    const texts = []
    const colors = []

    // Collect enabled text types
    if (textTypes["404"]) texts.push("404", "500", "503")
    if (textTypes.error) texts.push("ERROR", "FAIL")
    if (textTypes.sad) texts.push(":(", ":/", "!?")

    // Collect enabled colors
    if (colorTypes.white) colors.push("#FFFFFF")
    if (colorTypes.black) colors.push("#000000")
    if (colorTypes.blue) colors.push("#0066FF")

    if (texts.length === 0 || colors.length === 0) return

    // Create a temporary canvas for rotation
    const tempCanvas = document.createElement("canvas")
    tempCanvas.width = width
    tempCanvas.height = height
    const tempCtx = tempCanvas.getContext("2d")

    if (!tempCtx) return

    // Set up text rendering
    tempCtx.save()
    tempCtx.font = `bold ${size}px Arial`
    tempCtx.globalAlpha = opacity

    // Calculate number of texts to draw based on amount
    const numTexts = Math.ceil(amount)

    for (let i = 0; i < numTexts; i++) {
      const text = texts[Math.floor(Math.random() * texts.length)]
      const color = colors[Math.floor(Math.random() * colors.length)]
      const x = Math.random() * width
      const y = Math.random() * height
      const individualRotation = rotation + (Math.random() * 20 - 10) // Add slight random variation

      tempCtx.save()
      tempCtx.translate(x, y)
      tempCtx.rotate((individualRotation * Math.PI) / 180)
      tempCtx.fillStyle = color
      tempCtx.fillText(text, 0, 0)
      tempCtx.restore()
    }

    tempCtx.restore()

    // Draw the rotated text onto the main canvas
    ctx.drawImage(tempCanvas, 0, 0)
  },

  circuitBend: (ctx, { chaos = 0.3 }) => {
    const { width, height } = ctx.canvas
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    const numGlitches = Math.floor(width * height * chaos * 0.001)
    const maxOffset = Math.floor(width * 0.1)

    for (let n = 0; n < numGlitches; n++) {
      const x = getRandomInt(0, width - 1)
      const y = getRandomInt(0, height - 1)
      const w = getRandomInt(10, maxOffset)
      const h = getRandomInt(1, 10)

      const sourceOffset = (y * width + x) * 4
      const targetOffset = (y * width + ((x + w) % width)) * 4

      for (let dy = 0; dy < h && y + dy < height; dy++) {
        for (let dx = 0; dx < w && x + dx < width; dx++) {
          const srcIdx = sourceOffset + (dy * width + dx) * 4
          const tgtIdx = targetOffset + (dy * width + dx) * 4

          // Swap pixel data
          const r1 = data[srcIdx]
          const g1 = data[srcIdx + 1]
          const b1 = data[srcIdx + 2]

          const r2 = data[tgtIdx]
          const g2 = data[tgtIdx + 1]
          const b2 = data[tgtIdx + 2]

          data[srcIdx] = r2
          data[srcIdx + 1] = g2
          data[srcIdx + 2] = b2

          data[tgtIdx] = r1
          data[tgtIdx + 1] = g1
          data[tgtIdx + 2] = b1
        }
      }
    }

    ctx.putImageData(imageData, 0, 0)
  },

  stretchSmear: (ctx, { amount = 0.2 }) => {
    const { width, height } = ctx.canvas
    const tempCanvas = createCanvas(width, height)
    const tempCtx = tempCanvas.getContext("2d")

    if (!tempCtx) return

    tempCtx.drawImage(ctx.canvas, 0, 0)

    const numStrips = Math.floor(20 * amount)
    const maxStretch = Math.floor(width * 0.2)

    for (let i = 0; i < numStrips; i++) {
      const y = getRandomInt(0, height - 1)
      const h = getRandomInt(1, Math.floor(height * 0.1))
      const stretch = getRandomInt(10, maxStretch)
      const direction = Math.random() > 0.5 ? 1 : -1

      const stripCanvas = createCanvas(width + stretch, h)
      const stripCtx = stripCanvas.getContext("2d")

      if (!stripCtx) continue

      stripCtx.drawImage(tempCanvas, 0, y, width, h, direction > 0 ? 0 : stretch, 0, width, h)

      ctx.save()
      ctx.globalAlpha = 0.7
      ctx.drawImage(stripCanvas, 0, 0, width + stretch, h, direction > 0 ? -stretch : 0, y, width + stretch, h)
      ctx.restore()
    }
  },

  echoTrails: (ctx, { amount = 0.5, direction = 0.5 }) => {
    const { width, height } = ctx.canvas

    // Create temporary canvas
    const tempCanvas = document.createElement("canvas")
    tempCanvas.width = width
    tempCanvas.height = height
    const tempCtx = tempCanvas.getContext("2d")

    if (!tempCtx) return

    // Copy original image
    tempCtx.drawImage(ctx.canvas, 0, 0)

    // Calculate offset based on direction
    const maxOffset = width * 0.1 * amount
    const angle = direction * Math.PI * 2
    const dx = Math.cos(angle) * maxOffset
    const dy = Math.sin(angle) * maxOffset

    // Draw echo with reduced opacity
    ctx.save()
    ctx.globalAlpha = 0.5
    ctx.drawImage(tempCanvas, dx, dy)
    ctx.restore()
  },

  fractalDistortion: (ctx, { complexity = 0.5, intensity = 0.5, iterations = 5, mirror = false, rotate = false }) => {
    const { width, height } = ctx.canvas

    // Create temporary canvas for original image
    const originalCanvas = createCanvas(width, height)
    const originalCtx = originalCanvas.getContext("2d")
    if (!originalCtx) return

    // Copy the original image
    originalCtx.drawImage(ctx.canvas, 0, 0)

    // Clear the main canvas
    ctx.clearRect(0, 0, width, height)

    // Calculate the number of iterations based on the parameter
    const numIterations = Math.max(1, Math.floor(iterations))

    // Create a working canvas
    const workCanvas = createCanvas(width, height)
    const workCtx = workCanvas.getContext("2d")
    if (!workCtx) return

    // Start with the original image
    workCtx.drawImage(originalCanvas, 0, 0)

    // Apply fractal transformations
    for (let i = 0; i < numIterations; i++) {
      // Create a temporary canvas for this iteration
      const tempCanvas = createCanvas(width, height)
      const tempCtx = tempCanvas.getContext("2d")
      if (!tempCtx) continue

      // Copy the current state
      tempCtx.drawImage(workCanvas, 0, 0)

      // Clear the working canvas
      workCtx.clearRect(0, 0, width, height)

      // Calculate scale factor based on complexity
      const scaleFactor = 1 - complexity * 0.2

      // Calculate number of subdivisions
      const divisions = Math.max(2, Math.floor(2 + complexity * 4))

      // Draw subdivided and transformed copies
      for (let y = 0; y < divisions; y++) {
        for (let x = 0; x < divisions; x++) {
          // Calculate the source rectangle
          const sw = width / divisions
          const sh = height / divisions
          const sx = x * sw
          const sy = y * sh

          // Calculate the destination rectangle with some randomness
          const randomOffsetX = (Math.random() - 0.5) * sw * 0.2 * intensity
          const randomOffsetY = (Math.random() - 0.5) * sh * 0.2 * intensity
          const randomScaleX = 1 + (Math.random() - 0.5) * 0.2 * intensity
          const randomScaleY = 1 + (Math.random() - 0.5) * 0.2 * intensity

          // Apply the transformation
          workCtx.save()

          // Position at the center of the subdivision
          workCtx.translate(sx + sw / 2, sy + sh / 2)

          // Apply rotation if enabled
          if (rotate) {
            const rotationAmount = (Math.random() - 0.5) * Math.PI * 0.1 * intensity
            workCtx.rotate(rotationAmount)
          }

          // Apply mirroring if enabled
          if (mirror && Math.random() < 0.3 * intensity) {
            workCtx.scale(-1, 1) // Horizontal mirror
          }

          // Apply scaling
          workCtx.scale(scaleFactor * randomScaleX, scaleFactor * randomScaleY)

          // Draw the subdivision
          workCtx.drawImage(tempCanvas, sx, sy, sw, sh, -sw / 2 + randomOffsetX, -sh / 2 + randomOffsetY, sw, sh)

          workCtx.restore()
        }
      }

      // For the final iteration, blend with the original
      if (i === numIterations - 1) {
        // Draw the original image with reduced opacity
        workCtx.save()
        workCtx.globalAlpha = 0.3
        workCtx.drawImage(originalCanvas, 0, 0)
        workCtx.restore()
      }
    }

    // Draw the final result to the main canvas
    ctx.drawImage(workCanvas, 0, 0)

    // Apply a final blend with the original for better effect
    ctx.save()
    ctx.globalAlpha = 0.2
    ctx.globalCompositeOperation = "overlay"
    ctx.drawImage(originalCanvas, 0, 0)
    ctx.restore()
  },

  invertColors: (ctx, { enabled = false }) => {
    if (!enabled) return

    const { width, height } = ctx.canvas
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i] // Invert Red
      data[i + 1] = 255 - data[i + 1] // Invert Green
      data[i + 2] = 255 - data[i + 2] // Invert Blue
    }

    ctx.putImageData(imageData, 0, 0)
  },

  posterize: (ctx, { intensity = 8 }) => {
    const { width, height } = ctx.canvas
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    const levels = Math.floor(intensity)
    const step = 255 / (levels - 1)

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.round(Math.round(data[i] / step) * step) // Red
      data[i + 1] = Math.round(Math.round(data[i + 1] / step) * step) // Green
      data[i + 2] = Math.round(Math.round(data[i + 2] / step) * step) // Blue
    }

    ctx.putImageData(imageData, 0, 0)
  },

  pixelate: (ctx, { size = 8, intensity = 1, random = 0 }) => {
    const { width, height } = ctx.canvas

    // Create temporary canvases
    const tempCanvas = document.createElement("canvas")
    const tempCanvas2 = document.createElement("canvas")
    tempCanvas.width = width
    tempCanvas.height = height
    tempCanvas2.width = width
    tempCanvas2.height = height

    const tempCtx = tempCanvas.getContext("2d")
    const tempCtx2 = tempCanvas2.getContext("2d")

    if (!tempCtx || !tempCtx2) return

    // Draw original to temp canvas
    tempCtx.drawImage(ctx.canvas, 0, 0)

    // Size of each pixelated block
    const blockSize = Math.max(2, Math.floor(size))
    const cols = Math.ceil(width / blockSize)
    const rows = Math.ceil(height / blockSize)

    // Pre-calculate random values for better performance
    const shouldPixelate = new Array(rows * cols)
    if (random > 0) {
      for (let i = 0; i < rows * cols; i++) {
        shouldPixelate[i] = Math.random() < random
      }
    }

    // Draw pixelated version to second temp canvas
    tempCtx2.save()
    tempCtx2.imageSmoothingEnabled = false

    // Scale down
    tempCtx2.drawImage(tempCanvas, 0, 0, width, height, 0, 0, cols, rows)

    // Scale back up
    tempCtx2.drawImage(tempCanvas2, 0, 0, cols, rows, 0, 0, width, height)
    tempCtx2.restore()

    // Blend between original and pixelated based on intensity and random pattern
    if (intensity < 1 || random > 0) {
      ctx.save()
      ctx.globalAlpha = 1
      ctx.drawImage(tempCanvas, 0, 0) // Draw original

      ctx.globalAlpha = intensity

      // If using random pattern, apply pixelation selectively
      if (random > 0) {
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            if (shouldPixelate[y * cols + x]) {
              const sx = x * blockSize
              const sy = y * blockSize
              const sw = Math.min(blockSize, width - sx)
              const sh = Math.min(blockSize, height - sy)

              ctx.drawImage(tempCanvas2, sx, sy, sw, sh, sx, sy, sw, sh)
            }
          }
        }
      } else {
        // If not using random, draw entire pixelated canvas
        ctx.drawImage(tempCanvas2, 0, 0)
      }
      ctx.restore()
    } else {
      // If full intensity and no random, just draw pixelated version
      ctx.drawImage(tempCanvas2, 0, 0)
    }
  },

  burnedEdge: (ctx, { amount = 0.5, feather = 0.5, white = false, invertEdge = false }) => {
    const { width, height } = ctx.canvas

    // Create gradient canvas
    const gradientCanvas = document.createElement("canvas")
    gradientCanvas.width = width
    gradientCanvas.height = height
    const gradientCtx = gradientCanvas.getContext("2d")

    if (!gradientCtx) return

    // Create radial gradient
    const centerX = width / 2
    const centerY = height / 2
    const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY)
    const innerRadius = maxRadius * Math.max(0, 1 - amount)
    const outerRadius = maxRadius

    const gradient = gradientCtx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius)

    // Set gradient colors based on white/black toggle and invert
    const isWhite = invertEdge ? !white : white
    const color = isWhite ? "255,255,255," : "0,0,0,"

    // Adjust gradient stops for more intensity
    gradient.addColorStop(0, `rgba(${color}0)`)
    gradient.addColorStop(Math.max(0, 1 - feather), `rgba(${color}0)`)
    gradient.addColorStop(1, `rgba(${color}1)`)

    // Apply gradient
    gradientCtx.fillStyle = gradient
    gradientCtx.fillRect(0, 0, width, height)

    // Create temporary canvas for original image
    const tempCanvas = document.createElement("canvas")
    tempCanvas.width = width
    tempCanvas.height = height
    const tempCtx = tempCanvas.getContext("2d")

    if (!tempCtx) return

    tempCtx.drawImage(ctx.canvas, 0, 0)

    // Clear main canvas
    ctx.clearRect(0, 0, width, height)

    // Draw original image
    ctx.drawImage(tempCanvas, 0, 0)

    // Apply burned edge effect with proper blending
    if (isWhite) {
      ctx.globalCompositeOperation = "lighter"
    } else {
      ctx.globalCompositeOperation = "destination-out"
    }
    ctx.drawImage(gradientCanvas, 0, 0)
    ctx.globalCompositeOperation = "source-over"
  },
}

// Process all effects
export const applyEffects = (ctx: CanvasRenderingContext2D, effects: Record<string, any>) => {
  const { width, height } = ctx.canvas
  const originalImageData = ctx.getImageData(0, 0, width, height)

  // Create a temporary canvas for layering
  const tempCanvas = document.createElement("canvas")
  tempCanvas.width = width
  tempCanvas.height = height
  const tempCtx = tempCanvas.getContext("2d")

  if (!tempCtx) return

  // Start with the original image
  tempCtx.putImageData(originalImageData, 0, 0)

  // Define effects that should be layered (not modify the base image)
  const layeredEffects = ["noise", "static", "wave", "stretch", "smear", "fractalDistortion", "circuitBend"]

  // First apply non-layered effects
  Object.keys(effects).forEach((effectId) => {
    if (effects[effectId].enabled && !layeredEffects.includes(effectId)) {
      if (effectFunctions[effectId]) {
        effectFunctions[effectId](tempCtx, effects[effectId])
      }
    }
  })

  // Then apply layered effects
  Object.keys(effects).forEach((effectId) => {
    if (effects[effectId].enabled && layeredEffects.includes(effectId)) {
      if (effectFunctions[effectId]) {
        // Create a new layer for each effect
        const layerCanvas = document.createElement("canvas")
        layerCanvas.width = width
        layerCanvas.height = height
        const layerCtx = layerCanvas.getContext("2d")

        if (!layerCtx) return

        // Copy current state to layer
        layerCtx.drawImage(tempCanvas, 0, 0)

        // Apply effect to layer
        effectFunctions[effectId](layerCtx, effects[effectId])

        // Blend layer back with main canvas
        tempCtx.drawImage(layerCanvas, 0, 0)
      }
    }
  })

  // Copy final result back to main canvas
  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(tempCanvas, 0, 0)
}

