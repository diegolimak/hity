const { PDFParse } = require('pdf-parse')
const fs = require('fs')
const path = require('path')

const pdfs = [
  { file: path.join(__dirname, '..', 'BRADESCO - DF - REDE CREDENCIADA.pdf'), estado: 'DF' },
  { file: path.join(__dirname, '..', 'BRADESCO - SP - REDE CREDENCIADA.pdf'), estado: 'SP' },
  { file: path.join(__dirname, '..', 'BRADESCO - MG - REDE CREDENCIADA.pdf'), estado: 'MG' },
]

async function run() {
  for (const { file, estado } of pdfs) {
    const buffer = fs.readFileSync(file)
    const parser = new PDFParse({ verbosity: 0 })
    await parser.load(buffer)
    const text = await parser.getText()
    fs.writeFileSync(path.join(__dirname, `extracted-${estado}.txt`), text, 'utf-8')
    console.log(`${estado}: ${text.length} chars`)
    console.log(text.substring(0, 3000))
    console.log('\n=====\n')
  }
}

run().catch(console.error)
