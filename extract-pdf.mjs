import pdfParse from 'pdf-parse/lib/pdf-parse.js'
import { readFileSync, writeFileSync } from 'fs'

const pdfs = [
  { file: '../BRADESCO - DF - REDE CREDENCIADA.pdf', estado: 'DF' },
  { file: '../BRADESCO - SP - REDE CREDENCIADA.pdf', estado: 'SP' },
  { file: '../BRADESCO - MG - REDE CREDENCIADA.pdf', estado: 'MG' },
]

const results = []
for (const { file, estado } of pdfs) {
  const buffer = readFileSync(new URL(file, import.meta.url))
  const data = await pdfParse(buffer)
  writeFileSync(`extracted-${estado}.txt`, data.text, 'utf-8')
  console.log(`${estado}: ${data.numpages} páginas, ${data.text.length} chars`)
  console.log('Primeiros 2000 chars:')
  console.log(data.text.substring(0, 2000))
  console.log('\n---\n')
}
