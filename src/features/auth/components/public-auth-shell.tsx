import type { ReactNode } from 'react'

import ynbLogo from '../../../assets/branding/ynb-logo.png'
import { Card } from '../../../shared/components/ui/card'

type PublicAuthShellProps = {
  title: string
  description: string
  children: ReactNode
}

export function PublicAuthShell({
  title,
  description,
  children,
}: PublicAuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F7F9FC] text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(90,139,201,0.18),_transparent_28%),radial-gradient(circle_at_bottom,_rgba(66,116,185,0.10),_transparent_34%)]" />

      <div className="relative flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <Card className="w-full max-w-md px-7 py-8 sm:px-9">
            <div className="mb-8 text-center">
              <img
                src={ynbLogo}
                alt="Yanks and Brits logo"
                className="mx-auto mb-5 h-28 w-auto object-contain"
              />
              <h2 className="text-2xl font-bold text-[#4274B9]">{title}</h2>
              <p className="mt-2 text-sm text-slate-500">{description}</p>
            </div>
            {children}
          </Card>
        </div>
      </div>
    </main>
  )
}
