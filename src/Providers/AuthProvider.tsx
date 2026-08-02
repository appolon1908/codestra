import { Navigate, useLocation } from 'react-router'
import { hasUsableAccessToken } from '../lib/auth'

interface AuthProps { element: React.ReactNode }

const AuthProvider = ({ element }: AuthProps) => {
  const location = useLocation()
  const authenticated = hasUsableAccessToken()
  return authenticated ? element : <Navigate to="/login" replace state={{ from: location.pathname }} />
}

export default AuthProvider
