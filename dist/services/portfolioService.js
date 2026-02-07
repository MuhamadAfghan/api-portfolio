import { getSupabaseClient } from '../lib/supabase';
const mapPortfolioRecord = (record) => {
    const images = (record.portfolio_images || []);
    const techStacks = (record.portfolio_tech_stack || [])
        .map((row) => row.tech_stack)
        .filter(Boolean);
    return {
        ...record,
        images,
        techStacks,
    };
};
export const fetchPortfolios = async (params) => {
    const supabase = getSupabaseClient();
    let query = supabase
        .from('portfolio')
        .select(`
        *,
        portfolio_images ( id, url, sort_order ),
        portfolio_tech_stack ( tech_stack:tech_stack ( id, name, type, source ) )
      `)
        .order('created_at', { ascending: false })
        .order('sort_order', { foreignTable: 'portfolio_images', ascending: true });
    if (params?.status) {
        query = query.eq('status', params.status);
    }
    if (params?.featured !== undefined) {
        query = query.eq('featured', params.featured);
    }
    const { data, error } = await query;
    if (error) {
        throw error;
    }
    return (data || []).map(mapPortfolioRecord);
};
export const fetchPortfolioBySlug = async (slug) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('portfolio')
        .select(`
        *,
        portfolio_images ( id, url, sort_order ),
        portfolio_tech_stack ( tech_stack:tech_stack ( id, name, type, source ) )
      `)
        .eq('slug', slug)
        .single();
    if (error) {
        if (error.code === 'PGRST116')
            return null;
        throw error;
    }
    return mapPortfolioRecord(data);
};
