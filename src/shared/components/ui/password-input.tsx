import { Eye, EyeOff } from 'lucide-react'
import { useId, useState, type InputHTMLAttributes } from 'react'

import { cn } from '../../lib/cn'
import { Input } from './input'

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export function PasswordInput({
  className,
  id,
  ...props
}: PasswordInputProps) {
  const generatedId = useId()
  const [isVisible, setIsVisible] = useState(false)
  const inputId = id ?? generatedId

  return (
    <div className="relative">
      <Input
        id={inputId}
        type={isVisible ? 'text' : 'password'}
        className={cn('pr-12', className)}
        {...props}
      />
      <button
        type="button"
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        aria-controls={inputId}
        onClick={() => setIsVisible((current) => !current)}
        className="absolute inset-y-0 right-3 inline-flex items-center justify-center text-slate-400 transition hover:text-slate-700 focus:outline-none"
      >
        {isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}
