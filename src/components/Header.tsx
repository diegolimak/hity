import Image from 'next/image'
import type { Cliente } from '@/types'
import ThemeToggle from './ThemeToggle'

interface HeaderProps {
  cliente: Cliente
}

export default function Header({ cliente }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {/* Logo Amor à Vida */}
            <div className="flex items-center">
              <div className="relative h-8 w-32 dark:hidden">
                <Image
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/logos/amoravida.png`}
                  alt="Amor à Vida Corretora"
                  fill
                  className="object-contain object-left"
                />
              </div>
              <div className="relative h-8 w-32 hidden dark:block">
                <Image
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/logos/amoravida-branca.png`}
                  alt="Amor à Vida Corretora"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

            {/* Logo do cliente */}
            <div className="flex items-center">
              <div className="bg-[#0d1b3e] rounded-lg px-3 py-1">
                <div className="relative h-7 w-20">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/logos/cliente-branca.png`}
                    alt={`Logo ${cliente.empresa}`}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">
              {cliente.operadora}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
