import { Link, useNavigate } from "react-router-dom"
import { clearAccessToken } from "@/lib/auth"
import { Button2 } from "../../Components/components/Button"

const HomeDash = () => {

  const navigate = useNavigate()
  const handleLogout = () =>{
       clearAccessToken()
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
