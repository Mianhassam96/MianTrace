import { useEffect, useState } from 'react'

export type Route = 'analyzer' | 'methodology' | 'faq'

function parseHash(): Route {
  const hash = window.location.hash.replace('#', '').toLowerCase()
  if (hash === 'methodology') return 'methodology'
  if (hash === 'faq') return 'faq'
  return 'analyzer'
}

export function useHashRoute(): [Route, (route: Route) => void] {
  const [route, setRouteState] = useState<Route>(parseHash)

  useEffect(() => {
    function onHashChange() {
      setRouteState(parseHash())
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  function setRoute(r: Route) {
    window.location.hash = r === 'analyzer' ? '' : r
    setRouteState(r)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return [route, setRoute]
}
