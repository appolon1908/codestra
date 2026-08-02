
import { useState } from 'react'
import { HiEye } from "react-icons/hi";
import { HiEyeOff } from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useSignup from '@/hooks/mutations/useSignup';
import { toast, ToastContainer } from 'react-toastify';
import logo from '../../assets/logo.png'


type FormData = {
  first_name: string,
  last_name: string,
  email: string,
  password: string,
}


interface ErrorResponse {
  response?: {
    data?: {
      email?: string[]
      non_field_errors?: string[] 
    }
  }
}

 const Signup = () => {
  const [showPassword, setShowPassword] = useState(false)
  const {mutate, isPending} = useSignup()
  const navigate = useNavigate()

    const {
      register, 
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<FormData>({mode: 'all'})
  
    const onSubmit = (data:FormData) => {
      mutate(data, {
        onSuccess: (details) => {
          const accessToken = details?.data?.token?.access

          reset()
          if (typeof accessToken === 'string' && accessToken.trim()) {
            localStorage.setItem("accessToken", accessToken)
            navigate('/auth/dashboard', { replace: true })
          } else {
            navigate('/login', { replace: true })
          }
        },
        onError: (error) => {
          const err = error as ErrorResponse;
          const errorMessage = err.response?.data?.email?.[0]
            || err.response?.data?.non_field_errors?.[0]
            || "Unable to create your account. Please try again."
          toast.error(errorMessage)
        },
      })
    }

  return (
    <div className="min-h-screen flex flex-col gap-4 text-xs items-center justify-center bg-[#080808] px-3">

        <div className='pb-6'>
          <Link to={'/'}>
            <img src={logo} alt="Codestra" className='w-40'/>
          </Link>
        </div>
      <div className="2xl:w-[25%] xl:w-[60%] lg:w-[70%] w-[95%] relative bg-[#121212] rounded-xl p-8">
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">Create account</h1>
            <p className="text-gray-400">Quickly sign up for an account now</p>
          </div>

          <ToastContainer theme='light' autoClose={4000}/>


          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="signup-first-name" className="text-sm text-white">First Name</label>
              <input 
                id="signup-first-name"
                type="text"
                autoComplete="given-name"
                {...register('first_name', {required: true})}
                placeholder="write full name here"
                className="bg-[#262729] border-0 text-white p-3 rounded-lg"   
              />
              <p className="text-red-200 pt-1">{errors?.first_name && 'First Name Required'}</p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="signup-last-name" className="text-sm text-white">Last Name</label>
              <input 
                id="signup-last-name"
                type="text"
                autoComplete="family-name"
                {...register('last_name', {required: true})}
                placeholder="write full name here"
                className="bg-[#262729] border-0 text-white p-3 rounded-lg"   
              />
              <p className="text-red-200 pt-1">{errors?.last_name && 'Last Name Required'}</p>
            </div>


            <div className="flex flex-col gap-2">
              <label htmlFor="signup-email" className="text-sm text-white">Email</label>
              <input 
                id="signup-email"
                type="email"
                autoComplete="email"
                {...register('email', {required: true})}
                placeholder="write email adress"
                className="bg-[#262729] border-0 text-white p-3 rounded-lg"   
              />
              <p className="text-red-200 pt-1">{errors?.email && 'Email Required'}</p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="signup-password" className="text-sm text-white">Password</label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...register('password', {required: true})}
                  placeholder="write your password"
                  className="bg-[#262729] border-0 text-white p-3 rounded-lg w-full"
                />
                <button 
                  type='button'
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                </button>
                <p className="text-red-200 pt-1">{errors?.password && 'Password Required'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input id="remember" type="checkbox" defaultChecked className="checkbox border-gray-600 data-[state=checked]:bg-white data-[state=checked]:text-black" />
              <label htmlFor="remember" className="text-sm text-gray-300">
                Keep me logged in
              </label>
            </div>

            {!isPending ? 
              <button className="w-full bg-white p-3 rounded-lg text-black hover:bg-gray-200">
                Sign Up
              </button> :
              <button type="button" className="w-full flex justify-center items-center gap-3 bg-white p-3 rounded-lg text-neutral-400 hover:bg-gray-200">
                <span className="loading loading-spinner loading-sm"></span>
                Loading
              </button>
            }

            <button type="button" className="w-full flex items-center gap-3 p-3 justify-center m-auto bg-[#262729] rounded-lg text-white hover:bg-[#1A1A1A] hover:text-white">
                Sign Up with Google
              <FcGoogle />
            </button>

            <p className="text-center text-gray-400 text-sm">
              Have an account?{' '}
              <Link to="/login" className="text-white underline hover:text-gray-200">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}


export default Signup
