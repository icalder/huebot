// @ts-check
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import express from 'express'
import nocache from 'nocache'
import { ViteDevServer } from 'vite'
import * as dotenv from 'dotenv'

import { apiRouter } from './src/api/Router'
import { dataStoreRouter } from './src/api/DataStoreRouter'
import { useHueApiClient } from './src/api/HueApiClient'
import { createDataStore } from './src/services/MongoDataStore'

dotenv.config()
const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD

export async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === 'production',
  hmrPort?: number
) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const resolve = (p: string) => path.resolve(__dirname, p)
  const resolveUrl = (p: string) => pathToFileURL(resolve(p)).href

  const indexProd = isProd
    ? fs.readFileSync(resolve('../client/index.html'), 'utf-8')
    : ''

  const manifest = isProd
    ? // @ts-ignore
      (await import(resolveUrl('../client/ssr-manifest.json'), { assert: { type: "json" } })).default
    : {}

  const app = express()
  app.use(nocache())

  let vite: ViteDevServer | undefined
  if (!isProd) {
    vite = await (
      await import('vite')
    ).createServer({
      base: '/',
      root,
      logLevel: isTest ? 'error' : 'info',
      server: {
        middlewareMode: true,
        watch: {
          // During tests we edit the files too fast and sometimes chokidar
          // misses change events, so enforce polling for consistency
          usePolling: true,
          interval: 100
        },
        hmr: {
          port: hmrPort
        }
      },
      appType: 'custom'
    })
    // use vite's connect instance as middleware
    app.use(vite.middlewares)
  } else {
    app.use((await import('compression')).default())
    app.use(
      '/',
      (await import('serve-static')).default(resolve('../client'), {
        index: false
      })
    )
  }

  app.use('/api', apiRouter)
  if (process.env.DATASTORE_HOST) {
    const ds = createDataStore(process.env.DATASTORE_HOST)
    const dsRouter = dataStoreRouter(ds)
    app.use('/api/datastore', dsRouter)
  }

  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl.replace('/test/', '/')

      let template: string, render: (url: string, manifest: any) => Promise<[string, string, Record<string, any>]>
      if (!isProd && vite) {
        // always read fresh template in dev
        template = fs.readFileSync(resolve('index.html'), 'utf-8')
        template = await vite.transformIndexHtml(url, template)
        render = (await vite.ssrLoadModule('/src/entry-server.ts')).render
      } else {
        template = indexProd
        // @ts-ignore
        render = (await import('../server/entry-server.js')).render
      }

      const [appHtml, preloadLinks, initialData] = await render(url, manifest)

      const html = template
        .replace(`<!--preload-links-->`, preloadLinks)
        .replace(`'__INITIAL_DATA__'`, JSON.stringify(initialData))
        .replace(`<!--app-html-->`, appHtml)

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      if (e instanceof Error) {
        vite && vite.ssrFixStacktrace(e)
        console.log(e.stack)
        res.status(500).end(e.stack)
      } else {
        res.status(500).end(e)
      }
    }
  })

  return { app, vite }
}

if (!isTest) {
  const hueIP = process.env.HUE_IP!
  const hueUsername = process.env.HUE_USERNAME!
  // Setup hue API
  await useHueApiClient().setup(hueIP, hueUsername)

  createServer().then(({ app }) =>
    app.listen(5173, () => {
      console.log('http://localhost:5173')
    })
  )
}
