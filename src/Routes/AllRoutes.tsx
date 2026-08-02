import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'

const HomeDash = lazy(() => import('../Pages/Dashboard/HomeDash'))
const NotFound = lazy(() => import('../Pages/NotFound'))

const AllRoutes = () => {
  return (
    <Routes>
        <Route path="/auth/dashboard" element={<HomeDash />} />
        <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AllRoutes
