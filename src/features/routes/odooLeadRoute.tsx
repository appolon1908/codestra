import { lazy, Suspense } from 'react'
import type { FeatureRoute } from '../FeatureRoutes'

const Consultation = lazy(() => import('../lead-intake/Consultation'))

const FeatureFallback = () => (
  <div className="page-fallback" role="status" aria-live="polite">
    <span className="page-fallback__mark" aria-hidden="true">C</span>
    <span className="sr-only">Loading consultation form</span>
  </div>
)

export const featureRoute: FeatureRoute = {
  path: '/consultation',
  element: (
    <Suspense fallback={<FeatureFallback />}>
      <Consultation />
    </Suspense>
  ),
}
