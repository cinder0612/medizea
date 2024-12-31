'use client'

import { useCallback } from "react"
import Particles from "react-tsparticles"
import { Engine } from "tsparticles-engine"
import { loadSlim } from "tsparticles-slim"

export default function AnimatedParticles() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine)
  }, [])

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: false,
        fpsLimit: 60,
        particles: {
          color: {
            value: "#FFD700",
          },
          links: {
            enable: false,
          },
          move: {
            enable: true,
            random: true,
            speed: 0.3,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 1000,
            },
            value: 20,
          },
          opacity: {
            value: 0.1,
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 1, max: 3 },
          },
        },
        detectRetina: true,
      }}
      className="absolute inset-0"
    />
  )
}
