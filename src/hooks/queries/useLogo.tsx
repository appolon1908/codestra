import { useQuery } from '@tanstack/react-query'
import { logoGet } from '../../APIs/api/logo'
import { setAuthToken } from '../../APIs/base'

const useLogo = () => {
    setAuthToken()
  return useQuery({
        queryKey: ['logo'],
        queryFn: logoGet
    })
}

export default useLogo