import { Toaster } from 'sonner'

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      closeButton
      expand
      toastOptions={{
        classNames: {
          toast:
            '!rounded-2xl !border-transparent !shadow-xl !shadow-slate-300/40',
          title: '!text-sm !font-semibold !text-white',
          description: '!text-sm !text-white/90',
          closeButton:
            '!border-black/10 !bg-black/20 !text-white hover:!bg-black/30 hover:!text-white',
          success: '!bg-emerald-600 !text-white',
          error: '!bg-rose-600 !text-white',
          info: '!bg-[#4274B9] !text-white',
          warning: '!bg-amber-500 !text-white',
        },
      }}
    />
  )
}
