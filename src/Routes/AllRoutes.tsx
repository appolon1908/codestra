import { lazy } from 'react'
import { Route, Routes } from 'react-router'

const HomeDash = lazy(() => import('../Pages/Dashboard/HomeDash'))
const CRMWorkspace = lazy(() => import('../Pages/Dashboard/CRMWorkspace'))
const NotFound = lazy(() => import('../Pages/NotFound'))

const AllRoutes = () => {
  return (
    <Routes>
        <Route path="/auth/dashboard" element={<HomeDash />} />
        <Route path="/auth/dashboard/crm" element={<CRMWorkspace />} />
        <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AllRoutes
