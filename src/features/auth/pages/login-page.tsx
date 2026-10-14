import { PageBackdrop } from '../../../shared/components/page'
import { AdminAccessBadge } from '../components/admin-access-badge'
import { LoginForm } from '../components/login-form'
import { LoginHighlights } from '../components/login-highlights'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white text-ink lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      {/* Brand side: full-bleed harbor backdrop with the logo. */}
      <section className="relative isolate overflow-hidden px-6 py-8 sm:px-10 lg:flex lg:min-h-screen lg:flex-col lg:justify-between lg:px-14 lg:py-12">
        <PageBackdrop theme="harbor" pattern="arcs" />

        <div className="relative flex items-center justify-between gap-4">
          <img
            src="/logo.svg"
            alt="Yanks and Brits"
            className="h-14 w-auto object-contain brightness-0 invert sm:h-16"
          />
          <AdminAccessBadge />
        </div>

        <p className="relative mt-5 pb-4 text-sm font-medium text-white/85 lg:hidden">
          The staff portal for everyone at Yanks &amp; Brits.
        </p>

        <div className="relative mt-8 hidden max-w-xl lg:block">
          <h1 className="animate-in fade-in slide-in-from-bottom-2 text-4xl leading-tight font-bold tracking-tight text-white drop-shadow-sm xl:text-5xl">
            One place for the whole Yanks &amp; Brits team.
          </h1>
          <p className="mt-4 max-w-md text-base font-medium text-white/80">
            Tutors, counsellors, academic leaders, finance and managers: sign
            in to pick up your day, across every branch.
          </p>
        </div>

        <div className="relative mt-10 hidden lg:block">
          <LoginHighlights />
          <p className="mt-6 text-xs text-white/60">
            © {new Date().getFullYear()} Yanks &amp; Brits Study Abroad Preparation
          </p>
        </div>
      </section>

      {/* Form side. */}
      <section className="relative -mt-6 flex items-start justify-center rounded-t-[1.75rem] bg-white px-6 pt-10 pb-12 sm:px-10 lg:mt-0 lg:min-h-screen lg:items-center lg:rounded-none lg:py-12">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </section>
    </main>
  )
}
