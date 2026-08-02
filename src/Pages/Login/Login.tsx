import { useState } from 'react'
import { HiEye, HiEyeOff } from "react-icons/hi"
import { FcGoogle } from "react-icons/fc"
import { Link, useNavigate } from 'react-router-dom'
import { useLogin } from '../../hooks/mutations/useLogin'
import { useForm } from 'react-hook-form'
import { ToastContainer, toast } from 'react-toastify';
import logo from '../../assets/logo.png'
import { setAccessToken } from '@/lib/auth'

type FormData = {
  email: string,
  password: string,
}


interface ErrorResponse {
  response?: {
    data?: {
      message?: string
    }
  }
}


const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const {mutate, isPending} = useLogin()
  const navigate = useNavigate()

  const {
    register, 
    handleSubmit,
    reset,
    // formState: { errors },
  } = useForm<FormData>({mode: 'all'})

  const onSubmit = (data:FormData) => {
    mutate(data, {
      onSuccess: (details) => {
        setAccessToken(details.data.token.access);
        reset()
        navigate('/auth/dashboard', { replace: true })
      },
      onError: (error) => {
        const err = error as ErrorResponse;
        toast(err?.response?.data?.message)
      },
    })
  }


  return (
    <div className="min-h-screen text-xs w-full flex flex-col gap-4 items-center justify-center m-auto bg-[#080808] px-3">
        <div className='pb-6'>
          <Link to={'/'}>
            <img src={logo} alt="" className='w-40'/>
          </Link>
        </div>
        <div className="2xl:w-[25%] xl:w-[60%] lg:w-[70%] w-[95%] relative bg-[#121212] border border-[#1b1b1b] rounded-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-white">Log in</h1>
              <p className="text-gray-400">Please login to continue to your account</p>
            </div>

            <ToastContainer theme='light' autoClose={4000}/>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-white">Email</label>
                <input 
                  type="email"
                  placeholder="Write email address"
                  className="bg-[#262729] border-0 text-white p-3 rounded-lg"
                  {...register('email', { required: true })}
                />
                

              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-white">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Write your password"
                    className="bg-[#262729] border-0 text-white p-3 rounded-lg w-full"
                    {...register('password', { required: true })}

                  />
                  <button 
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="checkbox border-gray-600 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                <label htmlFor="remember" className="text-sm text-gray-300">
                  Keep me logged in
                </label>
              </div>

              {/* {error && (
                <p className="text-red-400 text-xs">{error}</p>
              )} */}

              {!isPending ? 
                <button type="submit" className="w-full bg-white p-3 rounded-lg text-black hover:bg-gray-200">
                  Log In
                </button> : 
                <button type="button" className="w-full flex justify-center items-center gap-3 bg-white p-3 rounded-lg text-neutral-400 hover:bg-gray-200">
                  <span className="loading loading-spinner loading-sm"></span>
                  Loading
                </button>
              }

              <button type="button" className="w-full flex items-center gap-3 p-3 justify-center m-auto bg-[#262729] rounded-lg text-white hover:bg-[#1A1A1A] hover:text-white">
                Log in with Google
                <FcGoogle />
              </button>

              <p className="text-center text-gray-400 text-sm">
                Need an account?{' '}
                <Link to="/signup" className="text-white underline hover:text-gray-200">
                  Create one
                </Link>
              </p>
            </div>
          </form>
        </div>
    </div>
  )
}

export default Login
