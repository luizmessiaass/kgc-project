import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(url, anon)

export interface Product {
  id: number
  slug: string
  name: string
  description: string
  price: number
  original_price?: number
  colors: string
  sizes: string
  images?: string[]
  active: boolean
  created_at: string
}
