import { getSupabaseClient } from '../lib/supabase'

export type PortfolioStatus = 'draft' | 'published'

export interface TechStack {
  id: string
  name: string
  type: 'svg' | 'image'
  source: string | null
}

export interface PortfolioImage {
  id: string
  url: string
  sort_order: number | null
}

export interface Portfolio {
  id: string
  title: string
  slug: string | null
  summary: string | null
  content: string | null
  link_demo: string | null
  link_github: string | null
  status: PortfolioStatus
  featured: boolean
  created_at?: string
  updated_at?: string
}

export interface PortfolioWithRelations extends Portfolio {
  images: PortfolioImage[]
  techStacks: TechStack[]
}

const mapPortfolioRecord = (record: {
  [key: string]: unknown
  portfolio_images?: PortfolioImage[]
  portfolio_tech_stack?: { tech_stack?: TechStack | null }[]
}): PortfolioWithRelations => {
  const images = (record.portfolio_images || []) as PortfolioImage[]
  const techStacks = (record.portfolio_tech_stack || [])
    .map((row) => row.tech_stack)
    .filter(Boolean) as TechStack[]

  return {
    ...(record as Portfolio),
    images,
    techStacks,
  }
}

export const fetchPortfolios = async (params?: {
  status?: PortfolioStatus
  featured?: boolean
}): Promise<PortfolioWithRelations[]> => {
  const supabase = getSupabaseClient()

  let query = supabase
    .from('portfolio')
    .select(
      `
        *,
        portfolio_images ( id, url, sort_order ),
        portfolio_tech_stack ( tech_stack:tech_stack ( id, name, type, source ) )
      `,
    )
    .order('created_at', { ascending: false })
    .order('sort_order', { foreignTable: 'portfolio_images', ascending: true })

  if (params?.status) {
    query = query.eq('status', params.status)
  }

  if (params?.featured !== undefined) {
    query = query.eq('featured', params.featured)
  }

  const { data, error } = await query
  if (error) {
    throw error
  }

  return (data || []).map(mapPortfolioRecord)
}

export const fetchPortfolioBySlug = async (
  slug: string,
): Promise<PortfolioWithRelations | null> => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('portfolio')
    .select(
      `
        *,
        portfolio_images ( id, url, sort_order ),
        portfolio_tech_stack ( tech_stack:tech_stack ( id, name, type, source ) )
      `,
    )
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return mapPortfolioRecord(data)
}
