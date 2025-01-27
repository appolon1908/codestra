
import { useQuery } from '@tanstack/react-query'
import { employeeGet } from '../../APIs/api/employee'
import { setAuthToken } from '../../APIs/base'

const useEmployee = () => {
    setAuthToken()
  return useQuery({
    queryKey: ['employee'],
    queryFn: employeeGet
  })
}

export default useEmployee