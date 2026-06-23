const { PDFParse } = require('pdf-parse')
const fs = require('fs')
const path = require('path')

function fileUri(filePath) {
  return 'file:///' + filePath.replace(/\\/g, '/').replace(/ /g, '%20')
}

function inferCategoria(nome) {
  const n = nome.toUpperCase()
  if (/LABORAT|LAB\b|SABIN|FLEURY|HERMES|PARDINI|BRONSTEIN|DASA|BIOMED|BIOCENTER|CITOCLIN|LAVOISIER/.test(n)) return 'Laboratório'
  if (/CLÍNICA|CLINICA|POLICLIN|CONSULTÓRIO|CONSULTORIO|ODONTO|OFTALM|DERMA|DIAGN|IMAGENOL|ENDOSC|ONCOL|\bCLIN\b|REABILITAÇ/.test(n)) return 'Clínica'
  return 'Hospital'
}

function titleCase(str) {
  const stop = new Set(['DE', 'DA', 'DO', 'DAS', 'DOS', 'E', 'A', 'O', 'AS', 'OS', 'EM', 'NO', 'NA', 'NOS', 'NAS', 'DI', 'DEL', 'S'])
  return str.trim().split(/\s+/).map((w, i) => {
    if (i > 0 && stop.has(w.toUpperCase())) return w.toLowerCase()
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  }).join(' ')
}

// Words that clearly start a hospital name (not a city)
const HOSP_INDICATORS = new Set([
  'HOSPITAL', 'HOSP', 'CLINICA', 'CLÍNICA', 'CLIN', 'MATERNIDADE', 'MAT',
  'SANTA', 'STA', 'CASA', 'FUNDACAO', 'FUND', 'IRMANDADE', 'IRM', 'IRMA',
  'BENEFICENTE', 'BENEF', 'BEN', 'UNIMED', 'PRONTO', 'PRONTOATEND',
  'UPA', 'POLICLINICA', 'POLICLIN', 'INST', 'INSTITUTO', 'ASSOC', 'ASSOCIACAO',
  'CENTRO', 'PREVENTORIO', 'CEUTA', 'HOME', 'ONE', 'HOSPITALIS', 'IAM',
  'NUCLEO', 'LABORAT', 'LAB', 'CTO', 'CPR', 'CEPOG', 'HODF', 'CAU',
  'M.S.P.M', 'R', 'DR', 'DRA',
  'PREVINA', 'IRC', 'INNOVA', 'VITALE', 'EINSTEIN', 'ONCOCLINI',
  'UNIDADE', 'RESIDENCIA', 'REABILITAC', 'NUPS', 'IAP', 'IAEP', 'CSO'
])

function extractName(linha) {
  const match = linha.match(/^(.*?)\s+(?=(?:H\/P\.S|H\/M|H\/A|H\/P|P\.S\/|HDIA|\bH\s+H\b)\b)/)
  if (match) return match[1].trim()
  return linha.replace(/\s+(H\/P\.S\/M\/A|H\/P\.S\/A\/HDIA|H\/P\.S\/HDIA|H\/P\.S\/M|H\/P\.S|H\/M\/A|H\/A\/HDIA|H\/A|H\/M|P\.S\/HDIA|HDIA|P\.S\/A|P\.S\/M|P\.S|H)\s*(H\/.*?)*$/g, '').trim()
}

// Extract service types from the FIRST type-code block found in the line
function extractTipos(linha) {
  // Match the first occurrence of a type code block
  const m = linha.match(/\s+(H\/P\.S\/M\/A\/HDIA|H\/P\.S\/M\/A|H\/P\.S\/A\/HDIA|H\/P\.S\/HDIA|H\/P\.S\/M|H\/P\.S\/A|H\/M\/A|H\/A\/HDIA|H\/P\.S|H\/M|H\/A|P\.S\/M\/A|P\.S\/A|P\.S\/M|P\.S\/HDIA|P\.S|HDIA|H H H|H)\b/)
  if (!m) return []
  const raw = m[1].trim()
  // Handle "H H H H H" (space-separated single H) — just H
  if (/^H(\s+H)+$/.test(raw)) return ['H']
  // Split by / to get individual types
  return raw.split('/').map(t => t.trim()).filter(Boolean)
}

const STATE_CODES = new Set(['SP', 'MG', 'RJ', 'RS', 'GO', 'BA', 'CE', 'PE', 'AM', 'PA', 'SC', 'PR', 'ES', 'DF', 'MT', 'MS', 'TO', 'SE', 'AL', 'PB', 'RN', 'PI', 'MA', 'RO', 'AC', 'AP', 'RR'])

function splitCidadeHospital(namePart) {
  const words = namePart.split(/\s+/)

  // Find first word that is a hospital indicator
  let hospStart = -1
  for (let i = 0; i < words.length; i++) {
    const w = words[i].toUpperCase().replace(/[^A-Z]/g, '')
    if (HOSP_INDICATORS.has(w)) {
      hospStart = i
      break
    }
  }

  if (hospStart <= 0) {
    return { cidade: '', hospital: namePart }
  }

  const cidade = words.slice(0, hospStart).join(' ')
  const hospital = words.slice(hospStart).join(' ')

  // Validate: reject bogus city prefixes
  const firstWord = words[0]
  const lastCidadeWord = words[hospStart - 1]

  // 1. First word is 1-2 letters (abbreviation like "H O" or "BP")
  if (firstWord.replace(/[^A-Za-z]/g, '').length <= 2) {
    return { cidade: '', hospital: namePart }
  }
  // 2. City part ends with "-" or "(" (part of hospital name)
  if (cidade.endsWith('-') || cidade.endsWith('(')) {
    return { cidade: '', hospital: namePart }
  }
  // 3. Last city word is a state code (e.g. "BLANC HOSPITAL SP" → "BLANC" before HOSPITAL, OK, but check hospital)
  const hospitalWords = hospital.split(/\s+/)
  if (hospitalWords.length <= 2 && hospitalWords.slice(1).every(w => STATE_CODES.has(w))) {
    return { cidade: '', hospital: namePart }
  }
  // 4. Last city word is a known state code
  if (STATE_CODES.has(lastCidadeWord.toUpperCase())) {
    return { cidade: '', hospital: namePart }
  }

  return { cidade, hospital }
}

function parsear(texto, estado) {
  const linhas = texto.split('\n').map(l => l.trim()).filter(Boolean)

  const resultados = []
  let cidadeAtual = estado === 'DF' ? 'BRASÍLIA' : ''

  for (const linha of linhas) {
    // Only process lines with type codes
    if (!/H\/P\.S|H\/M\/|\/A\b|HDIA|P\.S\/|\bH\s+H\b/.test(linha)) continue
    if (linha.includes('bradesco') || linha.includes('Para consultar') ||
        linha.includes('Referência:') || linha.includes('=') || linha.includes('acesse') ||
        linha.includes('habilitadas')) continue

    // Extract name
    let namePart = extractName(linha)
    if (!namePart || namePart.length < 3) continue
    // Remove any residual type codes
    namePart = namePart.replace(/\s+(H\/P\.S\/M\/A|H\/P\.S\/A|H\/A|H\/M\/A|H\/P\.S|HDIA|P\.S).*$/, '').trim()
    if (!namePart || namePart.length < 3) continue
    if (/^(NACIONAL|ENFERMARIA|LISTA|REFERÊNCIA|CIDADE|EFETIVO|QUARTO|FLEX|IDEAL)/.test(namePart)) continue

    // Try to split city from hospital name
    const { cidade, hospital } = splitCidadeHospital(namePart)

    if (cidade) {
      cidadeAtual = cidade
    }

    const nomeHospital = hospital || namePart
    if (!nomeHospital || nomeHospital.length < 3) continue

    const cidadeFinal = cidadeAtual || estado
    const tipos = extractTipos(linha)

    resultados.push({
      estado,
      cidade: titleCase(cidadeFinal),
      nome: titleCase(nomeHospital),
      categoria: inferCategoria(nomeHospital),
      tipos,
      endereco: '',
      telefone: '',
      site: ''
    })
  }

  // Deduplicate
  const vistos = new Set()
  return resultados.filter(h => {
    const key = `${h.estado}|${h.cidade}|${h.nome}`
    if (vistos.has(key)) return false
    vistos.add(key)
    return true
  })
}

async function run() {
  const base = path.join(__dirname, '..')
  const pdfs = [
    { file: path.join(base, 'BRADESCO - DF - REDE CREDENCIADA.pdf'), estado: 'DF' },
    { file: path.join(base, 'BRADESCO - SP - REDE CREDENCIADA.pdf'), estado: 'SP' },
    { file: path.join(base, 'BRADESCO - MG - REDE CREDENCIADA.pdf'), estado: 'MG' },
  ]

  const todos = []
  for (const { file, estado } of pdfs) {
    const parser = new PDFParse({ url: fileUri(file), verbosity: 0 })
    const result = await parser.getText()
    const texto = result.pages.map(p => p.text).join('\n')

    const hospitais = parsear(texto, estado)
    todos.push(...hospitais)

    console.log(`${estado}: ${hospitais.length} estabelecimentos`)
    hospitais.slice(0, 10).forEach(h => console.log(`  [${h.cidade}] ${h.nome}`))
    console.log()
  }

  // By state stats
  const byEstado = todos.reduce((acc, h) => { acc[h.estado] = (acc[h.estado] || 0) + 1; return acc }, {})
  console.log('Por estado:', byEstado)
  console.log(`Total: ${todos.length} → data/rede-credenciada.json`)

  fs.writeFileSync(
    path.join(__dirname, 'data', 'rede-credenciada.json'),
    JSON.stringify(todos, null, 2),
    'utf-8'
  )
}

run().catch(console.error)
