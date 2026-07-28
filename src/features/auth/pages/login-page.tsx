import { LoginForm } from '../components/login-form'

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F7F9FC] text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(90,139,201,0.18),_transparent_28%),radial-gradient(circle_at_bottom,_rgba(66,116,185,0.10),_transparent_34%)]" />

      <div className="relative flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
