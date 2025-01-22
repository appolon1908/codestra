import { Link, useNavigate } from "react-router-dom"
import { Button2 } from "../../Components/components/Button"

const HomeDash = () => {

  const navigate = useNavigate()
  const handleLogout = () =>{
       localStorage.removeItem('accessToken')
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