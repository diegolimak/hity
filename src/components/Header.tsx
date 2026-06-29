import type { Cliente } from '@/types'
import ThemeToggle from './ThemeToggle'

interface HeaderProps {
  cliente: Cliente
}

export default function Header({ cliente }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {cliente.operadora}
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
