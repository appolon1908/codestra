import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const defaultProjectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

export const loadLandingPages = async (projectRoot = defaultProjectRoot) => {
  const contentDir = path.join(projectRoot, 'src/content')
  const [serviceSpecs, industrySpecs, builder] = await Promise.all([
    readFile(path.join(contentDir, 'service-specs.json'), 'utf8').then(JSON.parse),
    readFile(path.join(contentDir, 'industry-specs.json'), 'utf8').then(JSON.parse),
    import(pathToFileURL(path.join(contentDir, 'landingPageBuilder.js')).href),
  ])

  return builder.buildLandingPages(serviceSpecs, industrySpecs)
}
