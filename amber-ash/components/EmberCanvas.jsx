import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Palette pulled straight from the design tokens in styles/global.css
const EMBER = new THREE.Color('#e1521e')
const GOLD = new THREE.Color('#c9a15a')

const PARTICLE_COUNT = 140
const DODGE_RADIUS = 1.6
const DODGE_STRENGTH = 2.6

/** Small soft-glow sprite, generated once on a <canvas> instead of shipping an image asset. */
function useGlowTexture() {
  return useMemo(() => {
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.35, 'rgba(255,196,132,0.85)')
    gradient.addColorStop(1, 'rgba(255,110,32,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }, [])
}

/**
 * Listens for pointer movement over the canvas's DOM container and converts
 * it into Three.js world-space coordinates on the z=0 plane, so the particle
 * sim can do simple radius-based repulsion without a raycaster.
 * Runs on window (not the canvas element) because the canvas has
 * pointer-events: none so it never blocks clicks on hero content.
 */
function useMouseWorldPosition(containerRef) {
  const { viewport } = useThree()
  const mouseRef = useRef({ x: 0, y: 0, active: false })

  useEffect(() => {
    const handleMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const relX = e.clientX - rect.left
      const relY = e.clientY - rect.top
      const inside = relX >= 0 && relX <= rect.width && relY >= 0 && relY <= rect.height
      if (!inside) {
        mouseRef.current.active = false
        return
      }
      const nx = relX / rect.width - 0.5
      const ny = 0.5 - relY / rect.height
      mouseRef.current.x = nx * viewport.width
      mouseRef.current.y = ny * viewport.height
      mouseRef.current.active = true
    }
    const handleLeave = () => {
      mouseRef.current.active = false
    }
    window.addEventListener('pointermove', handleMove, { passive: true })
    window.addEventListener('pointerleave', handleLeave)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerleave', handleLeave)
    }
  }, [containerRef, viewport.width, viewport.height])

  return mouseRef
}

function EmberField({ containerRef }) {
  const { viewport } = useThree()
  const pointsRef = useRef(null)
  const texture = useGlowTexture()
  const mouseRef = useMouseWorldPosition(containerRef)

  // Per-particle simulation data. Regenerated only if viewport size changes meaningfully.
  const { positions, colors, seeds } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const colors = new Float32Array(PARTICLE_COUNT * 3)
    // seeds: [riseSpeed, swirlFreq, swirlAmp, phase]
    const seeds = new Float32Array(PARTICLE_COUNT * 4)
    const w = viewport.width
    const h = viewport.height

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * w
      // stagger start heights through the full column so embers don't pulse in sync
      positions[i * 3 + 1] = -h / 2 + Math.random() * h * 1.4
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.6

      seeds[i * 4 + 0] = 0.3 + Math.random() * 0.45
      seeds[i * 4 + 1] = 0.5 + Math.random() * 1.1
      seeds[i * 4 + 2] = 0.12 + Math.random() * 0.3
      seeds[i * 4 + 3] = Math.random() * Math.PI * 2

      const c = EMBER.clone().lerp(GOLD, Math.random() * 0.85)
      colors[i * 3 + 0] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }

    return { positions, colors, seeds }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Math.round(viewport.width), Math.round(viewport.height)])

  useFrame((state, delta) => {
    const geo = pointsRef.current?.geometry
    if (!geo) return
    const posAttr = geo.attributes.position
    const arr = posAttr.array
    const t = state.clock.elapsedTime
    const w = viewport.width
    const h = viewport.height
    const mouse = mouseRef.current
    // Clamp delta so a tabbed-out browser doesn't fling particles on return
    const dt = Math.min(delta, 1 / 30)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3
      let x = arr[ix]
      let y = arr[ix + 1]

      const speed = seeds[i * 4 + 0]
      const freq = seeds[i * 4 + 1]
      const amp = seeds[i * 4 + 2]
      const phase = seeds[i * 4 + 3]

      // rise + organic sway, like heat shimmer over a hearth
      y += speed * dt * 0.6
      x += Math.sin(t * freq + phase) * amp * dt

      // cursor dodge: embers swirl around and away from the pointer
      if (mouse.active) {
        const dx = x - mouse.x
        const dy = y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < DODGE_RADIUS && dist > 0.0001) {
          const force = (1 - dist / DODGE_RADIUS) * DODGE_STRENGTH
          // slight tangential component so it reads as "swirl" rather than a straight push
          x += (dx / dist) * force * dt * 1.6 - (dy / dist) * force * dt * 0.5
          y += (dy / dist) * force * dt * 1.6 + (dx / dist) * force * dt * 0.5
        }
      }

      // respawn at the bottom once an ember drifts past the top of the hero
      if (y > h / 2 + 0.3) {
        y = -h / 2 - Math.random() * 0.3
        x = (Math.random() - 0.5) * w
      }
      // soft horizontal clamp so dodging can't fling embers off-scene permanently
      if (x > w / 2 + 0.6) x = w / 2 + 0.6
      if (x < -w / 2 - 0.6) x = -w / 2 - 0.6

      arr[ix] = x
      arr[ix + 1] = y
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={0.16}
        vertexColors
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

/**
 * Drop-in WebGL replacement for the CSS `.ember-particle` spans.
 * Renders full-bleed inside its parent (expects an ancestor with
 * position: relative/absolute and a defined size — see .hero-embers).
 */
export default function EmberCanvas({ className = '' }) {
  const containerRef = useRef(null)

  return (
    <div ref={containerRef} className={`ember-canvas ${className}`} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.5]}
      >
        <EmberField containerRef={containerRef} />
      </Canvas>
    </div>
  )
}
