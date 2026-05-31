import { supabase } from './supabase';

export type Category = {
  id: number;
  name: string;
  slug: string;
  type: 'subject' | 'category' | 'level';
  parent_id: number | null;
  sort_order: number;
};

export type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  youtube_url: string | null;
  status: 'draft' | 'published';
  author: string;
  tags: string | null;
  subject_id: number | null;
  category_id: number | null;
  level_id: number | null;
  subject?: Category;
  category?: Category;
  level?: Category;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export async function getPublishedPosts(filters?: {
  subjectSlug?: string;
  categorySlug?: string;
  levelSlug?: string;
}): Promise<Post[]> {
  let query = supabase
    .from('blog_posts')
    .select(`
      *,
      subject:subject_id(id, name, slug, type, parent_id),
      category:category_id(id, name, slug, type, parent_id),
      level:level_id(id, name, slug, type, parent_id)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;

  let posts = data || [];

  // Client-side filter by slug (handles parent/child hierarchy)
  if (filters?.subjectSlug) {
    posts = posts.filter(p => {
      const s = p.subject as Category | null;
      return s?.slug === filters.subjectSlug || false;
    });
  }
  if (filters?.categorySlug) {
    posts = posts.filter(p => {
      const c = p.category as Category | null;
      return c?.slug === filters.categorySlug || false;
    });
  }
  if (filters?.levelSlug) {
    posts = posts.filter(p => {
      const l = p.level as Category | null;
      return l?.slug === filters.levelSlug || false;
    });
  }

  return posts;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      subject:subject_id(id, name, slug, type, parent_id),
      category:category_id(id, name, slug, type, parent_id),
      level:level_id(id, name, slug, type, parent_id)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  if (error) return null;
  return data;
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  const { data } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published');
  return (data || []).map(p => p.slug);
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await supabase
    .from('blog_categories')
    .select('*')
    .order('type')
    .order('sort_order')
    .order('name');
  return data || [];
}
