import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ButtonProps {
  text: string
  onClick?: () => void
  isPending?: boolean
  type?: 'button' | 'submit'
}

const PendingLabel = () => {
  const { t } = useTranslation("common");
  return (
  <span className="inline-flex items-center gap-2">
    <span className="loadera" aria-hidden="true" />
    {t("loading")}
  </span>
);
}

export const Button1 = ({ text, onClick, type = 'button' }: ButtonProps) => (
  <button type={type} className="button button--secondary button--compact" onClick={onClick}>
    {text}
  </button>
)

export const Button2 = ({ text, onClick, type = 'button' }: ButtonProps) => (
  <button type={type} className="button button--primary button--compact" onClick={onClick}>
    {text}
  </button>
)

export const Button2a = ({ text, onClick, isPending = false, type = 'button' }: ButtonProps) => (
  <button
    type={type}
    disabled={isPending}
    aria-busy={isPending}
    className="button button--secondary button--compact"
    onClick={onClick}
  >
    {isPending ? <PendingLabel /> : text}
  </button>
)

export const Button2b = ({ text, onClick, isPending = false, type = 'button' }: ButtonProps) => (
  <button
    type={type}
    disabled={isPending}
    aria-busy={isPending}
    className="button button--primary button--compact"
    onClick={onClick}
  >
    {isPending ? <PendingLabel /> : text}
  </button>
)

export const Button2c = ({ text }: ButtonProps) => (
  <button type="button" disabled className="button button--primary button--compact">
    {text}
  </button>
)

export const Button3 = ({ text, onClick, type = 'button' }: ButtonProps) => (
  <button type={type} className="button button--secondary button--compact" onClick={onClick}>
    {text} <ArrowRight size={16} aria-hidden="true" />
  </button>
)

export const Button4 = ({ text, onClick, type = 'button' }: ButtonProps) => (
  <button type={type} className="button button--primary button--compact button--block-mobile" onClick={onClick}>
    {text}
  </button>
)
