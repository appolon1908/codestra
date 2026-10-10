import { useEffect, useRef } from 'react'

interface TurnstileOptions {
  sitekey: string
  theme: 'dark'
  size: 'flexible'
  callback: (token: string) => void
  'expired-callback': () => void
  'error-callback': () => void
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileOptions) => string
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

interface TurnstileFieldProps {
  onTokenChange: (token: string) => void
}

const SCRIPT_ID = 'codestra-turnstile-script'
const SCRIPT_SOURCE = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

const TurnstileField = ({ onTokenChange }: TurnstileFieldProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | undefined>(undefined)
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim()

  useEffect(() => {
    if (!siteKey) {
      onTokenChange('')
      return undefined
    }

    let active = true
    const renderWidget = () => {
      if (!active || !containerRef.current || !window.turnstile || widgetIdRef.current) return
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'dark',
        size: 'flexible',
        callback: onTokenChange,
        'expired-callback': () => onTokenChange(''),
        'error-callback': () => onTokenChange(''),
      })
    }

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = SCRIPT_ID
      script.src = SCRIPT_SOURCE
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    script.addEventListener('load', renderWidget)
    renderWidget()

    return () => {
      active = false
      script?.removeEventListener('load', renderWidget)
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = undefined
      }
    }
  }, [onTokenChange, siteKey])

  if (!siteKey) return null

  return (
    <div className="turnstile-field">
      <div ref={containerRef} />
      <p>This form uses a privacy-preserving challenge to reduce automated abuse.</p>
    </div>
  )
}

export default TurnstileField
