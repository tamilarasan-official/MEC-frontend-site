'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Camera, FlashlightOff, Flashlight, ScanLine } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QRScannerProps {
  onScan: (data: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [flashOn, setFlashOn] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    let mounted = true
    let animationId: number | undefined

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        })

        // Check if component is still mounted before proceeding
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop())
          return
        }

        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream

          // Wait for video to be ready before playing
          videoRef.current.onloadedmetadata = async () => {
            if (mounted && videoRef.current) {
              try {
                await videoRef.current.play()
                if (mounted) {
                  setHasPermission(true)
                }
              } catch (playError) {
                // AbortError is expected when component unmounts during play()
                if (playError instanceof Error && playError.name !== 'AbortError') {
                  console.error('Video play error:', playError)
                }
              }
            }
          }
        }
      } catch (err) {
        if (mounted) {
          console.error('Camera error:', err)
          setHasPermission(false)
          setError('Camera access denied. Please allow camera access.')
        }
      }
    }

    startCamera()

    return () => {
      mounted = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (animationId !== undefined) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  // For demo purposes, simulate scanning with a button
  const handleSimulateScan = () => {
    // Simulate scanning a QR code with order data
    const mockQRData = JSON.stringify({
      orderId: 'ORD003',
      pickupToken: '5847',
      total: 190,
    })
    onScan(mockQRData)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-4 bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 backdrop-blur-sm"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-lg font-semibold text-white">Scan QR Code</h2>
        <button
          onClick={() => setFlashOn(!flashOn)}
          className="p-2 rounded-full bg-white/10 backdrop-blur-sm"
        >
          {flashOn ? (
            <Flashlight className="w-6 h-6 text-yellow-400" />
          ) : (
            <FlashlightOff className="w-6 h-6 text-white" />
          )}
        </button>
      </header>

      {/* Camera View */}
      <div className="flex-1 relative">
        {hasPermission === false ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Camera className="w-10 h-10 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Camera Access Required</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={onClose} variant="outline">
              Go Back
            </Button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Scanning overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Darkened corners */}
              <div className="absolute inset-0 bg-black/50" />
              
              {/* Scanning frame */}
              <div className="relative w-72 h-72">
                {/* Cut out the center */}
                <div className="absolute inset-0 bg-transparent border-[100vh] border-black/50 -m-[100vh]" style={{ clipPath: 'inset(100vh)' }} />
                
                {/* Frame corners */}
                <div className="absolute inset-0">
                  {/* Top-left */}
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                  {/* Top-right */}
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                  {/* Bottom-left */}
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                  {/* Bottom-right */}
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-xl" />
                </div>
                
                {/* Scanning line animation */}
                <div className="absolute inset-x-4 top-4 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer with instructions */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-center text-white/80 text-sm mb-4">
          Position the QR code within the frame to scan
        </p>
        
        {/* Demo button for testing without actual camera */}
        <Button
          onClick={handleSimulateScan}
          className="w-full bg-primary text-primary-foreground"
        >
          <ScanLine className="w-5 h-5 mr-2" />
          Simulate Scan (Demo)
        </Button>
      </div>
    </div>
  )
}
