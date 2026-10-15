import type { ReactElement } from 'react'

export interface FeatureRoute {
  path: string
  element: ReactElement
}

interface FeatureRouteModule {
  featureRoute?: FeatureRoute
  default?: FeatureRoute
}

const routeModules = import.meta.glob<FeatureRouteModule>('./routes/*.tsx', {
  eager: true,
})

const isFeatureRoute = (value: unknown): value is FeatureRoute => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<FeatureRoute>
  return typeof candidate.path === 'string' && candidate.path.startsWith('/') && Boolean(candidate.element)
}

export const featureRoutes = Object.values(routeModules)
  .map((routeModule) => routeModule.featureRoute ?? routeModule.default)
  .filter(isFeatureRoute)

export const resolveFeatureRoute = (path: string) =>
  featureRoutes.find((route) => route.path === path)
