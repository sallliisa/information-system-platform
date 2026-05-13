import { cp, mkdir } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readdirSync, statSync } from 'node:fs'

const [fromArg, toArg] = process.argv.slice(2)

if (!fromArg || !toArg) {
  throw new Error('Usage: node scripts/copy-package-assets.mjs <from> <to>')
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const from = join(root, fromArg)
const to = join(root, toArg)
const copiedExtensions = new Set(['.css', '.vue'])

function* walk(directory) {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry)
    const stats = statSync(path)

    if (stats.isDirectory()) {
      yield* walk(path)
      continue
    }

    yield path
  }
}

function hasCopiedExtension(path) {
  return [...copiedExtensions].some((extension) => path.endsWith(extension))
}

for (const source of walk(from)) {
  if (!hasCopiedExtension(source)) {
    continue
  }

  const destination = join(to, relative(from, source))
  await mkdir(dirname(destination), { recursive: true })
  await cp(source, destination)
}
