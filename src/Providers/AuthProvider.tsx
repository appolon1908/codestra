

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


interface AuthProps {
    element: React.ReactNode
}

const AuthProvider = ({element} : AuthProps) => {

    const navigate = useNavigate()
    const isAuthenticated = localStorage.getItem('accessToken')
    
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { replace: true })
        }
    }, [isAuthenticated, navigate])

  return isAuthenticated ? element : null
}

export default AuthProvider