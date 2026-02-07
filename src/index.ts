import 'dotenv/config'
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { fetchPortfolioBySlug, fetchPortfolios } from './services/portfolioService.js'

const port = Number(process.env.PORT || 3001)
const corsOrigin = process.env.CORS_ORIGIN

const app = new Elysia()
  .use(
    cors({
      origin: corsOrigin
        ? corsOrigin.split(',').map((item) => item.trim())
        : true,
    }),
  )
  .get('/health', () => ({ ok: true }))
  .get('/portfolios', async ({ query, set }) => {
    try {
      const status =
        query.status === 'draft' || query.status === 'published'
          ? query.status
          : undefined
      const featured =
        query.featured === 'true'
          ? true
          : query.featured === 'false'
            ? false
            : undefined

      const data = await fetchPortfolios({ status, featured })
      return { data }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load portfolios.'
      set.status = 500
      return { error: message }
    }
  })
  .get('/portfolios/:slug', async ({ params, set }) => {
    try {
      const portfolio = await fetchPortfolioBySlug(params.slug)
      if (!portfolio) {
        set.status = 404
        return { error: 'Portfolio not found.' }
      }
      return { data: portfolio }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load portfolio.'
      set.status = 500
      return { error: message }
    }
  })
// .listen(port) // Removed for Vercel/WebStandard compatibility

export default app
