'use client'

export function GradientBackground() {
  return (
    <>
      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/10 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-amber-500/5 blur-3xl animate-float-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-amber-400/5 blur-3xl animate-float-slower" />
      <div className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full bg-amber-300/5 blur-3xl animate-float" />
    </>
  )
}
