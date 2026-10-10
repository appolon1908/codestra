import { Link, useNavigate } from "react-router"
import { useSession } from "@/Providers/SessionProvider"
import { Button2 } from "../../Components/components/Button"

const HomeDash = () => {

  const navigate = useNavigate()
  const { logout } = useSession()
  const handleLogout = async () => {
       await logout()
       navigate('/', { replace: true })
   }

  return (
    <div>
      HomeDash
      <Button2 text="Log out" onClick={handleLogout}/>
      <Link to={'/'}>
          <li>Home</li>
      </Link>
    </div>
  )
}

export default HomeDash
