import { readFileSync } from 'fs'
import { join } from 'path'
import type { Cliente, Produto, Coparticipacao, Reembolso, Hospital, Comunicado } from '@/types'
import Header from '@/components/Header'
import PortalConferencia from '@/components/PortalConferencia'

function readJson<T>(filename: string): T {
  return JSON.parse(readFileSync(join(process.cwd(), 'data', filename), 'utf-8')) as T
}

export default function Home() {
  const cliente     = readJson<Cliente>('cliente.json')
  const comunicado  = readJson<Comunicado>('comunicado.json')
  const produtos    = readJson<Produto[]>('produtos.json')
  const copart      = readJson<Coparticipacao>('coparticipacao.json')
  const reembolso   = readJson<Reembolso>('reembolso.json')
  const hospitais   = readJson<Hospital[]>('rede-credenciada.json')

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header cliente={cliente} />
      <PortalConferencia
        cliente={cliente}
        comunicado={comunicado}
        produtos={produtos}
        coparticipacao={copart}
        reembolso={reembolso}
        hospitais={hospitais}
      />
    </main>
  )
}
