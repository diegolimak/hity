export interface Cliente {
  empresa: string
  operadora: string
  logo: string
  mensagem: string
  estados: string[]
}

export interface Hospital {
  estado: string
  cidade: string
  nome: string
  categoria: 'Hospital' | 'Clínica' | 'Laboratório' | string
  tipos: string[]
  endereco: string
  telefone: string
  site: string
}

export interface FaixaPreco {
  faixa: string
  semIOF: string
  comIOF: string
}

export interface Produto {
  id: string
  nome: string
  acomodacao: string
  faixas: FaixaPreco[]
}

export interface ItemCoparticipacao {
  tipo: string
  valor: string
}

export interface Coparticipacao {
  consulta: string
  consultaEmergencia: string
  exameSimples: string
  exameEspecial: string
  procedimentoAmb: string
  terapia: string
  internacao: string
}

export interface ItemReembolso {
  tipo: string
  valor: string
}

export interface Reembolso {
  itens: ItemReembolso[]
  observacoes: string[]
}

export interface ComunicadoDestaque {
  label: string
  data: string
  cor: 'blue' | 'amber' | 'green' | 'red'
}

export interface Comunicado {
  titulo: string
  paragrafos: string[]
  destaque: ComunicadoDestaque[]
}
