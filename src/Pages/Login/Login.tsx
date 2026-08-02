import { useState } from 'react'
import { Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { toast, ToastContainer } from 'react-toastify'
import { useLogin } from '../../hooks/mutations/useLogin'
import logo from '../../assets/logo.png'
import { setAccessToken } from '../../lib/auth'

type FormData = { email: string; password: string }
interface ErrorResponse { response?: { data?: { message?: string } } }

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { mutate, isPending } = useLogin()
  const navigate = useNavigate()
  const location = useLocation()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()
  const destination = (location.state as { from?: string } | null)?.from || '/auth/dashboard'
  const onSubmit = (data: FormData) => mutate(data, { onSuccess: (details) => { const token = details?.data?.token?.access; if (typeof token !== 'string' || !token.trim()) { toast.error('The server did not return a valid access token.'); return } setAccessToken(token); navigate(destination, { replace: true }) }, onError: (error) => { const err = error as ErrorResponse; toast.error(err.response?.data?.message || 'Unable to log in. Check your details and try again.') } })

  return <main className="auth-page"><ToastContainer theme="dark" /><section className="auth-brand-panel"><Link to="/"><img src={logo} alt="Codestra home" /></Link><div><p className="eyebrow">Client workspace</p><h1>Your work, decisions, and next steps in one place.</h1></div><p>Secure access for Codestra clients and project teams.</p></section><section className="auth-form-panel"><Link className="back-link" to="/"><ArrowLeft size={16} />Back to website</Link><form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate><div><p className="eyebrow">Welcome back</p><h2>Log in to Codestra</h2><p>Use the account connected to your project.</p></div><label>Email<input type="email" autoComplete="email" {...register('email', { required: 'Enter your email address' })} />{errors.email && <span className="field-error">{errors.email.message}</span>}</label><label>Password<div className="password-field"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" {...register('password', { required: 'Enter your password' })} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />}</button></div>{errors.password && <span className="field-error">{errors.password.message}</span>}</label><button className="button button-primary full" type="submit" disabled={isPending}>{isPending ? 'Logging in…' : <>Log in <ArrowRight size={17} /></>}</button><p className="auth-switch">New to Codestra? <Link to="/signup">Create an account</Link></p></form></section></main>
}
export default Login
