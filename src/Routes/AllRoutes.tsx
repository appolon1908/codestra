import { lazy } from 'react'
import { Route, Routes } from 'react-router'

const HomeDash = lazy(() => import('../Pages/Dashboard/HomeDash'))
const Webhooks = lazy(() => import('../Pages/Dashboard/Webhooks'))
const NotFound = lazy(() => import('../Pages/NotFound'))

const AllRoutes = () => {
  return (
    <Routes>
        <Route path="dashboard" element={<HomeDash />} />
        <Route path="webhooks" element={<Webhooks />} />
        <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AllRoutes
