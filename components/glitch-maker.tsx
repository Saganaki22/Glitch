"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, Upload, RefreshCw, ChevronDown, ChevronUp, ZoomIn } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { effectDefinitions, applyEffects } from "@/lib/effects"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"

export default function GlitchMaker() {
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null)
  const [effects, setEffects] = useState<Record<string, any>>({})
  const [expandedEffects, setExpandedEffects] = useState<Record<string, boolean>>({})
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const isMobile = useMobile()

  const [zoom, setZoom] = useState<number>(1)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize effects state
  useEffect(() => {
    const initialEffects: Record<string, any> = {}

    effectDefinitions.forEach((effect) => {
      initialEffects[effect.id] = {
        enabled: false,
        ...(effect.param && { [effect.param]: (effect.max + effect.min) / 2 }),
        ...(effect.params && Object.fromEntries(effect.params.map((p) => [p.id, (p.max + p.min) / 2]))),
        ...(effect.toggles && Object.fromEntries(effect.toggles.map((t) => [t.id, false]))),
        ...(effect.textTypes && {
          textTypes: Object.fromEntries(effect.textTypes.map((t) => [t.id, false])),
        }),
        ...(effect.colorTypes && {
          colorTypes: Object.fromEntries(effect.colorTypes.map((t) => [t.id, false])),
        }),
      }
    })

    setEffects(initialEffects)
  }, [])

  // Update canvas with effects
  const updateCanvas = () => {
    if (!currentImage || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions to match the image
    canvas.width = currentImage.width
    canvas.height = currentImage.height

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(currentImage, 0, 0)

    applyEffects(ctx, effects)
  }

  // Debounce the canvas update
  useEffect(() => {
    const timer = setTimeout(() => {
      updateCanvas()
    }, 16)

    return () => clearTimeout(timer)
  }, [effects, currentImage])

  // Handle file input
  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        setCurrentImage(img)

        if (canvasRef.current) {
          canvasRef.current.width = img.width
          canvasRef.current.height = img.height
          updateCanvas()
        }

        toast({
          title: "Image loaded",
          description: "Your image has been loaded successfully",
        })
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0])
    }
  }

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // Toggle effect
  const toggleEffect = (effectId: string, enabled: boolean) => {
    setEffects((prev) => ({
      ...prev,
      [effectId]: {
        ...prev[effectId],
        enabled,
      },
    }))
  }

  // Update effect parameter
  const updateEffectParam = (effectId: string, paramId: string, value: number) => {
    setEffects((prev) => ({
      ...prev,
      [effectId]: {
        ...prev[effectId],
        [paramId]: value,
      },
    }))
  }

  // Toggle effect parameter
  const toggleEffectParam = (effectId: string, paramId: string, value: boolean) => {
    setEffects((prev) => ({
      ...prev,
      [effectId]: {
        ...prev[effectId],
        [paramId]: value,
      },
    }))
  }

  // Toggle text type
  const toggleTextType = (effectId: string, textTypeId: string, value: boolean) => {
    setEffects((prev) => ({
      ...prev,
      [effectId]: {
        ...prev[effectId],
        textTypes: {
          ...prev[effectId].textTypes,
          [textTypeId]: value,
        },
      },
    }))
  }

  // Toggle color type
  const toggleColorType = (effectId: string, colorTypeId: string, value: boolean) => {
    setEffects((prev) => ({
      ...prev,
      [effectId]: {
        ...prev[effectId],
        colorTypes: {
          ...prev[effectId].colorTypes,
          [colorTypeId]: value,
        },
      },
    }))
  }

  // Toggle effect expansion
  const toggleEffectExpansion = (effectId: string) => {
    setExpandedEffects((prev) => ({
      ...prev,
      [effectId]: !prev[effectId],
    }))
  }

  // Reset all effects
  const resetEffects = () => {
    effectDefinitions.forEach((effect) => {
      setEffects((prev) => ({
        ...prev,
        [effect.id]: {
          ...prev[effect.id],
          enabled: false,
        },
      }))
    })

    toast({
      title: "Effects reset",
      description: "All effects have been reset",
    })
  }

  // Download image
  const downloadImage = () => {
    if (!canvasRef.current) return

    const link = document.createElement("a")
    link.href = canvasRef.current.toDataURL("image/png")
    link.download = "glitch-effect.png"
    link.click()

    toast({
      title: "Image downloaded",
      description: "Your glitched image has been downloaded",
    })
  }

  // Save settings as JSON
  const saveSettings = () => {
    const settingsToSave: Record<string, any> = {}

    Object.keys(effects).forEach((effectId) => {
      if (effects[effectId].enabled) {
        settingsToSave[effectId] = { ...effects[effectId] }
      }
    })

    const settingsBlob = new Blob([JSON.stringify(settingsToSave, null, 2)], { type: "application/json" })
    const settingsUrl = URL.createObjectURL(settingsBlob)
    const link = document.createElement("a")
    link.href = settingsUrl
    link.download = "glitch-settings.json"
    link.click()
    URL.revokeObjectURL(settingsUrl)

    toast({
      title: "Settings saved",
      description: "Your glitch settings have been saved as JSON",
    })
  }

  // Load settings from JSON
  const loadSettings = (file: File) => {
    if (!currentImage) {
      toast({
        title: "No image loaded",
        description: "Please upload an image before loading settings",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const loadedSettings = JSON.parse(event.target?.result as string)

        // Reset all effects first
        const resetEffects: Record<string, any> = {}

        effectDefinitions.forEach((effect) => {
          const defaultParams: Record<string, any> = {}

          if (effect.param) {
            defaultParams[effect.param] = (effect.max + effect.min) / 2
          }

          if (effect.params) {
            effect.params.forEach((p) => {
              defaultParams[p.id] = (p.max + p.min) / 2
            })
          }

          if (effect.toggles) {
            effect.toggles.forEach((t) => {
              defaultParams[t.id] = false
            })
          }

          if (effect.textTypes) {
            defaultParams.textTypes = {}
            effect.textTypes.forEach((t) => {
              defaultParams.textTypes[t.id] = false
            })
          }

          if (effect.colorTypes) {
            defaultParams.colorTypes = {}
            effect.colorTypes.forEach((t) => {
              defaultParams.colorTypes[t.id] = false
            })
          }

          resetEffects[effect.id] = {
            enabled: false,
            ...defaultParams,
          }
        })

        // Apply loaded settings
        Object.keys(loadedSettings).forEach((effectId) => {
          if (resetEffects[effectId]) {
            resetEffects[effectId] = { ...resetEffects[effectId], ...loadedSettings[effectId] }
          }
        })

        setEffects(resetEffects)

        toast({
          title: "Settings loaded",
          description: "Your glitch settings have been loaded successfully",
        })
      } catch (error) {
        toast({
          title: "Invalid JSON file",
          description: "The file you uploaded is not a valid settings file",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  // Handle settings file input change
  const handleSettingsFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadSettings(e.target.files[0])
    }
  }

  // Handle zoom with mouse wheel - smoother zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()

    // Make zoom increments smaller for smoother zooming
    const delta = -e.deltaY * 0.005

    // Calculate new zoom with a smaller increment
    const factor = Math.pow(1.1, delta)
    const newZoom = Math.max(0.1, Math.min(10, zoom * factor))

    setZoom(newZoom)
  }

  // Handle mouse down for panning
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  // Handle mouse move for panning
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return

    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y

    setPan({
      x: pan.x + dx,
      y: pan.y + dy,
    })

    setDragStart({ x: e.clientX, y: e.clientY })
  }

  // Handle mouse up to stop panning
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle touch events for pinch zoom
  const lastTouch = useRef<{ dist: number; x: number; y: number } | null>(null)

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2) {
      // Get the distance between two touches
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)

      // Calculate center point
      const x = (touch1.clientX + touch2.clientX) / 2
      const y = (touch1.clientY + touch2.clientY) / 2

      lastTouch.current = { dist, x, y }
    } else if (e.touches.length === 1) {
      // Single touch for panning
      setIsDragging(true)
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()

    if (e.touches.length === 2 && lastTouch.current) {
      // Handle pinch zoom
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)

      // Calculate zoom change with smoother factor
      const delta = dist / lastTouch.current.dist
      // Apply a smaller factor for smoother zooming
      const newZoom = Math.max(0.1, Math.min(10, zoom * (delta > 1 ? 1 + (delta - 1) * 0.5 : 1 - (1 - delta) * 0.5)))

      // Calculate center point
      const x = (touch1.clientX + touch2.clientX) / 2
      const y = (touch1.clientY + touch2.clientY) / 2

      // Update pan to keep the point under the center of the pinch
      const dx = x - lastTouch.current.x
      const dy = y - lastTouch.current.y

      setPan({
        x: pan.x + dx,
        y: pan.y + dy,
      })

      setZoom(newZoom)
      lastTouch.current = { dist, x, y }
    } else if (e.touches.length === 1 && isDragging) {
      // Handle panning with single touch
      const dx = e.touches[0].clientX - dragStart.x
      const dy = e.touches[0].clientY - dragStart.y

      setPan({
        x: pan.x + dx,
        y: pan.y + dy,
      })

      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    lastTouch.current = null
  }

  // Reset zoom and pan when a new image is loaded
  useEffect(() => {
    if (currentImage) {
      setZoom(1)
      setPan({ x: 0, y: 0 })
    }
  }, [currentImage])

  return (
    <div className="container mx-auto p-4 flex flex-col min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400">
            Glitch Maker
          </h1>
          <a
            href="https://github.com/Saganaki22/Glitch"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Saganaki22/Glitch
          </a>
        </div>
        <ThemeToggle />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
        {/* Image Panel */}
        <Card className="lg:col-span-7 xl:col-span-8">
          <CardContent className="p-6">
            <div
              className={cn(
                "relative w-full rounded-lg overflow-hidden border-2 border-dashed border-muted transition-all",
                "min-h-[300px] flex items-center justify-center",
                currentImage ? "border-solid" : "hover:border-primary/50",
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {!currentImage ? (
                <div className="text-center p-6">
                  <div className="mb-4">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Upload an image</h3>
                  <p className="text-sm text-muted-foreground mb-4">Drag and drop or click to browse</p>
                  <Button onClick={() => fileInputRef.current?.click()} className="mx-auto">
                    Choose Image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                </div>
              ) : (
                <div
                  ref={containerRef}
                  className="w-full h-full flex items-center justify-center bg-checkerboard overflow-hidden"
                  style={{
                    position: "relative",
                    minHeight: "300px",
                    maxHeight: "60vh",
                  }}
                >
                  {currentImage && (
                    <canvas
                      ref={canvasRef}
                      className="object-contain touch-none"
                      style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: "center",
                        maxWidth: "100%",
                        maxHeight: "100%",
                        cursor: isDragging ? "grabbing" : "grab",
                      }}
                      onWheel={handleWheel}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    />
                  )}
                  {currentImage && (
                    <>
                      <div className="absolute bottom-3 left-3 z-10">
                        <div className="flex items-center gap-1 text-xs bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md border border-border shadow-sm">
                          <ZoomIn className="h-3 w-3" />
                          <span>{Math.round(zoom * 100)}%</span>
                        </div>
                      </div>
                      <div className="absolute bottom-3 right-3 z-10">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setZoom(1)
                            setPan({ x: 0, y: 0 })
                          }}
                          className="bg-background/90 backdrop-blur-sm shadow-sm"
                        >
                          Reset View
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {currentImage && (
              <div className="flex flex-wrap gap-3 mt-4 justify-center sm:justify-between">
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={resetEffects}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset Effects
                  </Button>
                  <Button onClick={downloadImage}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={saveSettings}>
                    Save JSON
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const input = document.createElement("input")
                      input.type = "file"
                      input.accept = ".json"
                      input.onchange = (e) => {
                        const target = e.target as HTMLInputElement
                        if (target.files && target.files[0]) {
                          loadSettings(target.files[0])
                        }
                      }
                      input.click()
                    }}
                  >
                    Load JSON
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Effects Panel */}
        <Card className="lg:col-span-5 xl:col-span-4">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Effects</h2>

            <Tabs defaultValue="all" className="mb-4">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2 effects-scrollbar">
                {effectDefinitions.map((effect) => (
                  <EffectControl
                    key={effect.id}
                    effect={effect}
                    effectState={effects[effect.id]}
                    isExpanded={expandedEffects[effect.id]}
                    onToggle={(enabled) => toggleEffect(effect.id, enabled)}
                    onParamChange={(paramId, value) => updateEffectParam(effect.id, paramId, value)}
                    onToggleParam={(paramId, value) => toggleEffectParam(effect.id, paramId, value)}
                    onToggleTextType={(textTypeId, value) => toggleTextType(effect.id, textTypeId, value)}
                    onToggleColorType={(colorTypeId, value) => toggleColorType(effect.id, colorTypeId, value)}
                    onToggleExpand={() => toggleEffectExpansion(effect.id)}
                  />
                ))}
              </TabsContent>

              <TabsContent value="basic" className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2 effects-scrollbar">
                {effectDefinitions
                  .filter((effect) =>
                    ["rgbShift", "noise", "monochrome", "invertColors", "pixelate"].includes(effect.id),
                  )
                  .map((effect) => (
                    <EffectControl
                      key={effect.id}
                      effect={effect}
                      effectState={effects[effect.id]}
                      isExpanded={expandedEffects[effect.id]}
                      onToggle={(enabled) => toggleEffect(effect.id, enabled)}
                      onParamChange={(paramId, value) => updateEffectParam(effect.id, paramId, value)}
                      onToggleParam={(paramId, value) => toggleEffectParam(effect.id, paramId, value)}
                      onToggleTextType={(textTypeId, value) => toggleTextType(effect.id, textTypeId, value)}
                      onToggleColorType={(colorTypeId, value) => toggleColorType(effect.id, colorTypeId, value)}
                      onToggleExpand={() => toggleEffectExpansion(effect.id)}
                    />
                  ))}
              </TabsContent>

              <TabsContent
                value="advanced"
                className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2 effects-scrollbar"
              >
                {effectDefinitions
                  .filter(
                    (effect) => !["rgbShift", "noise", "monochrome", "invertColors", "pixelate"].includes(effect.id),
                  )
                  .map((effect) => (
                    <EffectControl
                      key={effect.id}
                      effect={effect}
                      effectState={effects[effect.id]}
                      isExpanded={expandedEffects[effect.id]}
                      onToggle={(enabled) => toggleEffect(effect.id, enabled)}
                      onParamChange={(paramId, value) => updateEffectParam(effect.id, paramId, value)}
                      onToggleParam={(paramId, value) => toggleEffectParam(effect.id, paramId, value)}
                      onToggleTextType={(textTypeId, value) => toggleTextType(effect.id, textTypeId, value)}
                      onToggleColorType={(colorTypeId, value) => toggleColorType(effect.id, colorTypeId, value)}
                      onToggleExpand={() => toggleEffectExpansion(effect.id)}
                    />
                  ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Copyright Footer */}
      <footer className="mt-8 py-4 text-center border-t border-border">
        <p className="text-sm text-muted-foreground">© 2025 DrBaph, All rights reserved.</p>
      </footer>
    </div>
  )
}

interface EffectControlProps {
  effect: any
  effectState: any
  isExpanded: boolean
  onToggle: (enabled: boolean) => void
  onParamChange: (paramId: string, value: number) => void
  onToggleParam: (paramId: string, value: boolean) => void
  onToggleTextType: (textTypeId: string, value: boolean) => void
  onToggleColorType: (colorTypeId: string, value: boolean) => void
  onToggleExpand: () => void
}

function EffectControl({
  effect,
  effectState,
  isExpanded,
  onToggle,
  onParamChange,
  onToggleTextType,
  onToggleColorType,
  onToggleParam,
  onToggleExpand,
}: EffectControlProps) {
  if (!effectState) return null

  const hasParams = (effect.params && effect.params.length > 0) || effect.param || effect.textTypes || effect.colorTypes

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <Switch checked={effectState.enabled} onCheckedChange={onToggle} id={`effect-${effect.id}`} />
          <Label htmlFor={`effect-${effect.id}`} className="font-medium cursor-pointer">
            {effect.label}
          </Label>
        </div>

        {hasParams && !effect.toggleOnly && (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onToggleExpand}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {hasParams && !effect.toggleOnly && isExpanded && (
        <div className="p-3 pt-0 border-t">
          {/* Single parameter */}
          {effect.param && (
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <Label className="text-sm">{effect.param.charAt(0).toUpperCase() + effect.param.slice(1)}</Label>
                <span className="text-xs text-muted-foreground">
                  {Math.round(effectState[effect.param] * 100) / 100}
                </span>
              </div>
              <Slider
                value={[effectState[effect.param]]}
                min={effect.min}
                max={effect.max}
                step={(effect.max - effect.min) / 100}
                onValueChange={(values) => onParamChange(effect.param, values[0])}
                disabled={!effectState.enabled}
              />
            </div>
          )}

          {/* Multiple parameters */}
          {effect.params &&
            effect.params.map((param: any) => (
              <div key={param.id} className="mb-4">
                <div className="flex justify-between mb-1">
                  <Label className="text-sm">{param.label}</Label>
                  <span className="text-xs text-muted-foreground">{Math.round(effectState[param.id] * 100) / 100}</span>
                </div>
                <Slider
                  value={[effectState[param.id]]}
                  min={param.min}
                  max={param.max}
                  step={(param.max - param.min) / 100}
                  onValueChange={(values) => onParamChange(param.id, values[0])}
                  disabled={!effectState.enabled}
                />
              </div>
            ))}

          {/* Toggles */}
          {effect.toggles && (
            <div className="mb-4 space-y-2">
              {effect.toggles.map((toggle: any) => (
                <div key={toggle.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`toggle-${effect.id}-${toggle.id}`}
                    checked={effectState[toggle.id]}
                    onCheckedChange={(checked) => onToggleParam(toggle.id, !!checked)}
                    disabled={!effectState.enabled}
                  />
                  <Label htmlFor={`toggle-${effect.id}-${toggle.id}`} className="text-sm">
                    {toggle.label}
                  </Label>
                </div>
              ))}
            </div>
          )}

          {/* Text Types */}
          {effect.textTypes && (
            <div className="mb-4">
              <Label className="text-sm block mb-2">Text Types</Label>
              <div className="space-y-2">
                {effect.textTypes.map((type: any) => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`text-type-${effect.id}-${type.id}`}
                      checked={effectState.textTypes[type.id]}
                      onCheckedChange={(checked) => onToggleTextType(type.id, !!checked)}
                      disabled={!effectState.enabled}
                    />
                    <Label htmlFor={`text-type-${effect.id}-${type.id}`} className="text-sm">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Color Types */}
          {effect.colorTypes && (
            <div className="mb-4">
              <Label className="text-sm block mb-2">Text Colors</Label>
              <div className="flex flex-wrap gap-3">
                {effect.colorTypes.map((color: any) => (
                  <div key={color.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`color-type-${effect.id}-${color.id}`}
                      checked={effectState.colorTypes[color.id]}
                      onCheckedChange={(checked) => onToggleColorType(color.id, !!checked)}
                      disabled={!effectState.enabled}
                    />
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: color.color }}
                      title={color.label}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

