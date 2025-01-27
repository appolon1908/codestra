import { Route, Routes } from 'react-router-dom'
import HomeDash from '../Pages/Dashboard/HomeDash'
import NotFound from '../Pages/NotFound'

const AllRoutes = () => {
  return (
    <Routes>
        <Route path="/auth/dashboard" element={<HomeDash />} />
        <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AllRoutes