'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Phone, MessageCircle, Search, Building2, MapPin, AlertCircle, CheckCircle2, AlertTriangle, User, Download } from 'lucide-react'
import type { Cliente, Produto, FaixaPreco, Coparticipacao, Reembolso, Hospital, Comunicado } from '@/types'

interface Props {
  cliente: Cliente
  comunicado: Comunicado
  produtos: Produto[]
  coparticipacao: Coparticipacao
  reembolso: Reembolso
  hospitais: Hospital[]
}

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

const RODRIGO = {
  nome: 'Rodrigo Veras',
  cargo: 'Consultor Amor à Vida',
  telefone: '(61) 9 9964-7684',
  whatsapp: '5561999647684',
  foto: `${BASE}/logos/rodrigo.png`,
}

const REDES_PDF: Record<string, string> = {
  DF: `${BASE}/documentos/BRADESCO - DF - REDE CREDENCIADA.pdf`,
  SP: `${BASE}/documentos/BRADESCO - SP - REDE CREDENCIADA.pdf`,
  MG: `${BASE}/documentos/BRADESCO - MG - REDE CREDENCIADA.pdf`,
}

const TIPO_INFO: Record<string, { label: string; cor: string }> = {
  'H':    { label: 'Hospital',       cor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
  'P.S':  { label: 'Pronto-Socorro', cor: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' },
  'M':    { label: 'Maternidade',    cor: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300' },
  'A':    { label: 'Ambulatório',    cor: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
  'HDIA': { label: 'Hospital Dia',   cor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' },
}

function getFaixaPorIdade(idade: number, faixas: FaixaPreco[]): FaixaPreco | null {
  const limites = [[0,18],[19,23],[24,28],[29,33],[34,38],[39,43],[44,48],[49,53],[54,58],[59,999]]
  const idx = limites.findIndex(([min, max]) => idade >= min && idade <= max)
  return idx >= 0 ? faixas[idx] : null
}

const W = 'py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto'
const DIV = 'border-t border-gray-200 dark:border-gray-800'

export default function PortalConferencia({ cliente, comunicado, produtos, coparticipacao, reembolso, hospitais }: Props) {
  const [produtoId, setProdutoId] = useState<string | null>(null)
  const [idadeStr, setIdadeStr]   = useState('')
  const [busca, setBusca]         = useState('')
  const [fotoOk, setFotoOk]       = useState(false)

  const produto  = produtos.find(p => p.id === produtoId) ?? null
  const idadeNum = parseInt(idadeStr, 10)
  const faixaSel = produto && !isNaN(idadeNum) && idadeNum >= 0 ? getFaixaPorIdade(idadeNum, produto.faixas) : null

  const redesFiltradas = useMemo(() => {
    const b = busca.toLowerCase()
    if (!b) return hospitais
    return hospitais.filter(h => h.nome.toLowerCase().includes(b) || h.cidade.toLowerCase().includes(b))
  }, [hospitais, busca])

  const estados = cliente.estados as string[]

  const copartItens = [
    { label: 'Consultas eletivas',          valor: coparticipacao.consulta },
    { label: 'Consultas em Pronto-Socorro', valor: coparticipacao.consultaEmergencia },
    { label: 'Exames simples',              valor: coparticipacao.exameSimples },
    { label: 'Exames especiais',            valor: coparticipacao.exameEspecial },
    { label: 'Procedimentos ambulatoriais', valor: coparticipacao.procedimentoAmb },
    { label: 'Terapias',                    valor: coparticipacao.terapia },
    { label: 'Internação (por evento)',     valor: coparticipacao.internacao },
  ]

  return (
    <div className="pb-20">

      {/* ── Comunicado ── */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pt-8">
        <div className="rounded-2xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 bg-amber-100 dark:bg-amber-900/40 border-b border-amber-200 dark:border-amber-700">
            <AlertTriangle size={20} className="text-amber-700 dark:text-amber-400 shrink-0" />
            <span className="font-bold text-amber-900 dark:text-amber-200 text-base">{comunicado.titulo}</span>
          </div>
          <div className="px-5 py-5 space-y-3">
            {comunicado.paragrafos.map((p, i) => (
              <p key={i} className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">{p}</p>
            ))}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {comunicado.destaque.map(d => (
                <div key={d.label} className={`rounded-xl px-4 py-3 flex items-center justify-between gap-2
                  ${d.cor === 'blue'
                    ? 'bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700'
                    : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700'}`}>
                  <span className={`text-xs font-medium ${d.cor === 'blue' ? 'text-blue-800 dark:text-blue-200' : 'text-red-800 dark:text-red-200'}`}>{d.label}</span>
                  <span className={`text-base font-bold ${d.cor === 'blue' ? 'text-blue-900 dark:text-blue-100' : 'text-red-900 dark:text-red-100'}`}>{d.data}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Logos (Hyti primeiro, depois Amor à Vida) ── */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pt-6 pb-2">
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <div className="bg-[#0d1b3e] rounded-lg px-4 py-2">
            <div className="relative h-8 w-24">
              <Image
                src={`${BASE}/logos/cliente-branca.png`}
                alt={`Logo ${cliente.empresa}`}
                fill
                className="object-contain"
              />
            </div>
          </div>
          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
          <div className="relative h-8 w-36 dark:hidden">
            <Image
              src={`${BASE}/logos/amoravida.png`}
              alt="Amor à Vida Corretora"
              fill
              className="object-contain object-left"
            />
          </div>
          <div className="relative h-8 w-36 hidden dark:block">
            <Image
              src={`${BASE}/logos/amoravida-branca.png`}
              alt="Amor à Vida Corretora"
              fill
              className="object-contain object-left"
            />
          </div>
        </div>
      </div>

      {/* ── Introdução ── */}
      <div className={W}>
        <div className="text-center pt-6 pb-4">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">{cliente.operadora}</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Confira as informações do seu plano</h1>
          <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm">
            Selecione seu produto e informe sua idade para ver os valores. A rede credenciada completa está disponível abaixo.
          </p>
        </div>
      </div>

      {/* ── Passo 1: Produto ── */}
      <div className={DIV}>
        <div className={W}>
          <SectionLabel numero="1" texto="Qual é o seu produto?" />

          <div className="grid grid-cols-1 gap-4 mt-5 max-w-sm">
            {produtos.map(p => (
              <button
                key={p.id}
                onClick={() => { setProdutoId(p.id); setIdadeStr('') }}
                className={`relative rounded-2xl border-2 p-5 text-left transition-all duration-200 focus:outline-none
                  ${produtoId === p.id
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-400'}`}
              >
                {produtoId === p.id && <span className="absolute top-3 right-3"><CheckCircle2 size={18} className="text-blue-600" /></span>}
                <div className="font-bold text-lg text-gray-900 dark:text-white">{p.nome}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{p.acomodacao}</div>
              </button>
            ))}
          </div>

          <AnimatePresence>
            {produto && (
              <motion.div
                key={produto.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6"
              >
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Qual é a sua idade?
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      min={0}
                      max={120}
                      placeholder="Ex: 35"
                      value={idadeStr}
                      onChange={e => setIdadeStr(e.target.value)}
                      className="pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
                    />
                  </div>
                  {idadeStr && !faixaSel && !isNaN(idadeNum) && (
                    <span className="text-sm text-red-500">Idade inválida</span>
                  )}
                </div>

                <AnimatePresence>
                  {faixaSel && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4"
                    >
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Faixa etária: <strong className="text-gray-700 dark:text-gray-200">{faixaSel.faixa}</strong> · {produto.nome} ({produto.acomodacao})
                      </p>
                      <div className="max-w-xs">
                        <div className="rounded-2xl border-2 border-blue-600 bg-blue-50 dark:bg-blue-950/40 px-5 py-4">
                          <p className="text-xs text-blue-600 dark:text-blue-400 mb-1 font-medium">Mensalidade</p>
                          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{faixaSel.semIOF}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Passo 2: Rede Credenciada ── */}
      <div className={DIV}>
        <div className={W}>
          <SectionLabel numero="2" texto="Rede Credenciada" />

          <div className="relative mt-5 mb-6">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou cidade…"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-80"
            />
          </div>

          {/* legenda dos tipos */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(TIPO_INFO).map(([cod, info]) => (
              <span key={cod} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${info.cor}`}>
                <span className="font-bold">{cod}</span>
                <span className="opacity-70">= {info.label}</span>
              </span>
            ))}
          </div>

          <div className="space-y-8">
            {estados.map(uf => {
              const lista = redesFiltradas.filter(h => h.estado === uf)
              if (busca && lista.length === 0) return null
              const total = hospitais.filter(h => h.estado === uf).length
              return (
                <div key={uf}>
                  <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white text-base">{uf}</span>
                      <span className="ml-2 text-xs text-gray-400">
                        {busca ? `${lista.length} de ${total}` : `${total}`} estabelecimentos
                      </span>
                    </div>
                    {REDES_PDF[uf] && (
                      <a
                        href={REDES_PDF[uf]}
                        download
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-sm"
                      >
                        <Download size={13} />
                        Baixar PDF — {uf}
                      </a>
                    )}
                  </div>
                  <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-1">
                    {lista.map((h, i) => (
                      <div
                        key={`${h.nome}-${h.cidade}-${i}`}
                        className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
                      >
                        <Building2 size={16} className="text-blue-500 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm text-gray-900 dark:text-white">{h.nome}</div>
                          <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                            <MapPin size={11} />
                            {h.cidade}
                          </div>
                          {h.tipos && h.tipos.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {h.tipos.map(t => {
                                const info = TIPO_INFO[t]
                                return info ? (
                                  <span key={t} title={info.label} className={`px-2 py-0.5 rounded-md text-xs font-semibold ${info.cor}`}>
                                    {t}
                                  </span>
                                ) : null
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Coparticipação ── */}
      <AnimatePresence>
        {produto && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.1 }} className={DIV}>
            <div className={W}>
              <SectionLabel numero="3" texto="Coparticipação" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-5">Valores cobrados por utilização de serviços, além da mensalidade.</p>
              <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Serviço</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {copartItens.map((item, i) => (
                      <tr key={item.label} className={i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}>
                        <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{item.label}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-gray-900 dark:text-white">{item.valor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reembolso ── */}
      <AnimatePresence>
        {produto && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.15 }} className={DIV}>
            <div className={W}>
              <SectionLabel numero="4" texto="Reembolso" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-5">Valores para atendimentos fora da rede credenciada.</p>
              <div className="space-y-3">
                {reembolso.itens.map(item => (
                  <div key={item.tipo} className="flex items-center justify-between px-5 py-3.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.tipo}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{item.valor}</span>
                  </div>
                ))}
                {reembolso.observacoes.map(obs => (
                  <div key={obs} className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <AlertCircle size={15} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-amber-700 dark:text-amber-300">{obs}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Contato Rodrigo ── */}
      <div className={`${DIV} bg-white dark:bg-gray-900`}>
        <div className={W}>
          <div className="text-center py-4">
            <p className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-6">Ficou com alguma dúvida?</p>
            <div className="inline-flex flex-col items-center gap-2">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-1">
                {!fotoOk && <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 select-none">RV</span>}
                <img
                  src={RODRIGO.foto}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ display: fotoOk ? 'block' : 'none' }}
                  onLoad={() => setFotoOk(true)}
                  onError={() => setFotoOk(false)}
                />
              </div>
              <p className="font-bold text-xl text-gray-900 dark:text-white">{RODRIGO.nome}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{RODRIGO.cargo}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
              <a
                href={`https://wa.me/${RODRIGO.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors shadow-sm"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
              <a
                href={`tel:${RODRIGO.telefone.replace(/\D/g, '')}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold text-sm transition-colors"
              >
                <Phone size={16} />
                {RODRIGO.telefone}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="text-center py-6 text-xs text-gray-400 dark:text-gray-600">
        © {new Date().getFullYear()} Amor à Vida Corretora · {cliente.operadora}
      </div>
    </div>
  )
}

function SectionLabel({ numero, texto }: { numero: string; texto: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
        <span className="text-white text-xs font-bold">{numero}</span>
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{texto}</h2>
    </div>
  )
}
