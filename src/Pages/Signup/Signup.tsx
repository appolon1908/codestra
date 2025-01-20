
import { useState } from 'react'
import { HiEye } from "react-icons/hi";
import { HiEyeOff } from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";
import { Link } from 'react-router-dom';


 const Signup = () => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen flex text-xs items-center justify-center bg-[#080808]">
      <div className="lg:w-[25%] w-[95%] relative bg-[#121212] rounded-xl p-8">
        
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">Create account</h1>
            <p className="text-gray-400">Quickly sign up for an account now</p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-white">Full Name</label>
              <input 
                type="text"
                placeholder="write full name here"
                className="bg-[#262729] border-0 text-white p-3 rounded-lg"   
              />
            </div>


            <div className="flex flex-col gap-2">
              <label className="text-sm text-white">Email</label>
              <input 
                type="email"
                placeholder="write email adress"
                className="bg-[#262729] border-0 text-white p-3 rounded-lg"   
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-white">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="write your password"
                  className="bg-[#262729] border-0 text-white p-3 rounded-lg w-full"
                />
                <button 
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

            <button className="w-full bg-white p-3 rounded-lg text-black hover:bg-gray-200">
              Sign Up
            </button>

            <button className="w-full flex items-center gap-3 p-3 justify-center m-auto bg-[#262729] rounded-lg text-white hover:bg-[#1A1A1A] hover:text-white">
                Sign Up with Google
              <FcGoogle />
            </button>

            <p className="text-center text-gray-400 text-sm">
              Have an account?{' '}
              <Link to="/login" className="text-white underline hover:text-gray-200">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


export default Signup
