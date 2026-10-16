import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

function MetaPixelRouteTracker() {
  const location = useLocation()

  // Remember the initial URL, which was already tracked by index.html
  const previousUrl = useRef(
    `${location.pathname}${location.search}`
  )

  useEffect(() => {
    const currentUrl = `${location.pathname}${location.search}`

    // Don't send a duplicate PageView for the initial page load
    if (currentUrl === previousUrl.current) return

    previousUrl.current = currentUrl

    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView')
    }
  }, [location.pathname, location.search])

  return null
}

export default MetaPixelRouteTracker
