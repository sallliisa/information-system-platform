import { access } from 'node:fs/promises'

const requiredFiles = [
  'packages/model-meta/dist/index.js',
  'packages/model-meta/dist/index.d.ts',
  'packages/apostle/dist/index.js',
  'packages/apostle/dist/index.d.ts',
  'packages/vue-framework/dist/index.js',
  'packages/vue-framework/dist/index.d.ts',
  'packages/vue-framework/dist/components/base/Button.vue',
  'packages/vue-framework/dist/styles/framework.css',
]

const missing = []

for (const file of requiredFiles) {
  try {
    await access(file)
  } catch {
    missing.push(file)
  }
}

if (missing.length > 0) {
  throw new Error(`Package verification failed. Missing files:\n${missing.join('\n')}`)
}

console.log('Package contents verified.')
