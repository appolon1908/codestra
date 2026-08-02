import { Navigate, useLocation } from 'react-router-dom'

interface AuthProps { element: React.ReactNode }

const AuthProvider = ({ element }: AuthProps) => {
  const location = useLocation()
  const token = localStorage.getItem('accessToken')
  const authenticated = Boolean(token && token !== 'undefined' && token !== 'null')
  return authenticated ? element : <Navigate to="/login" replace state={{ from: location.pathname }} />
}

export default AuthProvider
