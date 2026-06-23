import type { Hospital } from '@/types'

export function filtrarHospitais(
  hospitais: Hospital[],
  busca: string,
  estado: string
): Hospital[] {
  const termo = busca.toLowerCase().trim()

  return hospitais.filter((h) => {
    const matchEstado = !estado || h.estado === estado
    if (!matchEstado) return false

    if (!termo) return true

    return (
      h.nome.toLowerCase().includes(termo) ||
      h.cidade.toLowerCase().includes(termo) ||
      h.categoria.toLowerCase().includes(termo) ||
      h.endereco.toLowerCase().includes(termo) ||
      h.estado.toLowerCase().includes(termo)
    )
  })
}
