import { useState } from 'react'
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { toast, ToastContainer } from 'react-toastify'
import useSignup from '../../hooks/mutations/useSignup'
import logo from '../../assets/logo.png'
import { setAccessToken } from '../../lib/auth'

type FormData = { first_name: string; last_name: string; email: string; password: string }
interface ErrorResponse { response?: { data?: { email?: string[]; non_field_errors?: string[] } } }

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { mutate, isPending } = useSignup()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()
  const onSubmit = (data: FormData) => mutate(data, { onSuccess: (details) => { const token = details?.data?.token?.access; if (typeof token === 'string' && token.trim()) { setAccessToken(token); navigate('/auth/dashboard', { replace: true }) } else { navigate('/login', { replace: true }) } }, onError: (error) => { const err = error as ErrorResponse; toast.error(err.response?.data?.email?.[0] || err.response?.data?.non_field_errors?.[0] || 'Unable to create your account. Please try again.') } })

  return <main className="auth-page"><ToastContainer theme="dark" /><section className="auth-brand-panel"><Link to="/"><img src={logo} alt="Codestra home" /></Link><div><p className="eyebrow">Work with us</p><h1>Turn your next initiative into a clear plan.</h1></div><p>Create an account to save project details and continue with our team.</p></section><section className="auth-form-panel"><Link className="back-link" to="/"><ArrowLeft size={16} />Back to website</Link><form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate><div><p className="eyebrow">Create account</p><h2>Let’s get you set up</h2><p>Use your work details so we can support you properly.</p></div><div className="form-row"><label>First name<input autoComplete="given-name" {...register('first_name', { required: 'Required' })} />{errors.first_name && <span className="field-error">{errors.first_name.message}</span>}</label><label>Last name<input autoComplete="family-name" {...register('last_name', { required: 'Required' })} />{errors.last_name && <span className="field-error">{errors.last_name.message}</span>}</label></div><label>Email<input type="email" autoComplete="email" {...register('email', { required: 'Enter your email address' })} />{errors.email && <span className="field-error">{errors.email.message}</span>}</label><label>Password<div className="password-field"><input type={showPassword ? 'text' : 'password'} autoComplete="new-password" {...register('password', { required: 'Enter a password', minLength: { value: 8, message: 'Use at least 8 characters' } })} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff /> : <Eye />}</button></div>{errors.password && <span className="field-error">{errors.password.message}</span>}</label><label className="checkbox-label"><input type="checkbox" required />I agree to the <Link to="/privacy">privacy notice</Link>.</label><button className="button button-primary full" type="submit" disabled={isPending}>{isPending ? 'Creating account…' : <>Create account <ArrowRight size={17} /></>}</button><p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p></form></section></main>
}
export default Signup
