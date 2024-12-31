'use client'

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'

const DynamicAnimatedParticles = dynamic(
  () => import('./animated-particles'),
  { ssr: false }
)

export function ParticleBackground() {
  return (
    <div className="fixed inset-0 z-0">
      {/* Black tint overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%)',
        }}
      />

      {/* Golden glow */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, rgba(255,215,0,0.1) 0%, rgba(0,0,0,0) 60%)',
        }}
      />

      {/* Animated particles */}
      <div className="absolute inset-0 opacity-50">
        <Suspense fallback={<div className="absolute inset-0 bg-black/50" />}>
          <DynamicAnimatedParticles />
        </Suspense>
      </div>
    </div>
  )
}
