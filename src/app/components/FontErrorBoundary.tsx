'use client'

import { useEffect, useState } from 'react'

interface FontErrorBoundaryProps {
  children: React.ReactNode
}

export default function FontErrorBoundary({ children }: FontErrorBoundaryProps) {
  const [fontError, setFontError] = useState(false)

  useEffect(() => {
    // Cek apakah font gagal load
    const checkFonts = async () => {
      try {
        await document.fonts.ready
        // Jika font tidak tersedia setelah 3 detik, anggap error
        setTimeout(() => {
          // Cek untuk font Inter (kita ganti dari Geist)
          if (!document.fonts.check('16px Inter') && !document.fonts.check('16px Roboto Mono')) {
            setFontError(true)
          }
        }, 3000)
      } catch (error) {
        setFontError(true)
      }
    }

    checkFonts()
  }, [])

  if (fontError) {
    // Apply system fonts secara paksa
    return (
      <div className="font-system">
        {children}
        <style jsx>{`
          .font-system {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
          }
          .font-system code, .font-system pre {
            font-family: 'Monaco', 'Menlo', 'Consolas', 'Roboto Mono', monospace !important;
          }
        `}</style>
      </div>
    )
  }

  return <>{children}</>
}