import Link from 'next/link';
import { getPublishedPosts, getCategories, type Post, type Category } from '@/lib/posts';
import { getYouTubeThumbnail } from '@/lib/youtube';
import { formatDate } from '@/lib/format';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const revalidate = 60;

// ── Build category counts from posts ─────────────────────────────────────────
function buildCounts(posts: Post[], categories: Category[]) {
  const counts: Record<number, number> = {};

  const increment = (id: number | null) => {
    if (!id) return;
    counts[id] = (counts[id] || 0) + 1;
    // Also increment parent so top-level always shows
    const cat = categories.find(c => c.id === id);
    if (cat?.parent_id) counts[cat.parent_id] = (counts[cat.parent_id] || 0) + 1;
  };

  for (const post of posts) {
    increment(post.subject_id);
    increment(post.category_id);
    increment(post.level_id);
  }
  return counts;
}

// ── Sidebar filter ────────────────────────────────────────────────────────────
function Sidebar({ categories, counts, activeSubject, activeCategory, activeLevel }: {
  categories: Category[];
  counts: Record<number, number>;
  activeSubject?: string;
  activeCategory?: string;
  activeLevel?: string;
}) {
  const buildUrl = (type: string, slug: string, current: string | undefined) => {
    const params = new URLSearchParams();
    if (type !== 'subject'  && activeSubject)  params.set('subject',  activeSubject);
    if (type !== 'category' && activeCategory) params.set('category', activeCategory);
    if (type !== 'level'    && activeLevel)    params.set('level',    activeLevel);
    if (current !== slug) params.set(type, slug);
    const q = params.toString();
    return `/blog${q ? '?' + q : ''}`;
  };

  const sections: { type: 'subject' | 'category' | 'level'; label: string }[] = [
    { type: 'subject',  label: 'Subject'  },
    { type: 'category', label: 'Category' },
    { type: 'level',    label: 'Level'    },
  ];

  const hasFilter = activeSubject || activeCategory || activeLevel;

  return (
    <aside style={{
      width: 200,
      flexShrink: 0,
      position: 'sticky',
      top: 80,
      alignSelf: 'flex-start',
    }}>
      {sections.map(({ type, label }) => {
        const items = categories
          .filter(c => c.type === type && !c.parent_id && counts[c.id])
          .sort((a, b) => a.sort_order - b.sort_order);

        if (!items.length) return null;

        const activeSlug = type === 'subject' ? activeSubject : type === 'category' ? activeCategory : activeLevel;

        return (
          <div key={type} style={{ marginBottom: '1.75rem' }}>
            <div style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 700,
              fontSize: '0.7rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--grey)',
              marginBottom: '0.625rem',
              paddingBottom: '0.375rem',
              borderBottom: '1px solid var(--dark-3)',
            }}>
              {label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
              {items.map(item => {
                const isActive = activeSlug === item.slug;
                return (
                  <Link
                    key={item.id}
                    href={buildUrl(type, item.slug, activeSlug)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.35rem 0.625rem',
                      borderRadius: 4,
                      textDecoration: 'none',
                      background: isActive ? 'rgba(217,43,43,0.12)' : 'transparent',
                      borderLeft: `2px solid ${isActive ? 'var(--red)' : 'transparent'}`,
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{
                      fontFamily: 'Barlow, sans-serif',
                      fontSize: '0.875rem',
                      color: isActive ? 'var(--white)' : 'var(--grey-light)',
                      fontWeight: isActive ? 600 : 400,
                    }}>
                      {item.name}
                    </span>
                    <span style={{
                      fontFamily: 'Barlow Condensed, sans-serif',
                      fontSize: '0.72rem',
                      color: isActive ? 'var(--red)' : 'var(--grey)',
                      fontWeight: 600,
                      minWidth: 20,
                      textAlign: 'right',
                    }}>
                      {counts[item.id] || 0}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}

      {hasFilter && (
        <Link href="/blog" style={{
          display: 'block',
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: '0.78rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--grey)',
          textDecoration: 'none',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--dark-3)',
        }}>
          × Clear filters
        </Link>
      )}
    </aside>
  );
}

// ── Mobile filter bar (horizontal scroll) ─────────────────────────────────────
function MobileFilters({ categories, counts, activeSubject, activeCategory, activeLevel }: {
  categories: Category[];
  counts: Record<number, number>;
  activeSubject?: string;
  activeCategory?: string;
  activeLevel?: string;
}) {
  const buildUrl = (type: string, slug: string, current: string | undefined) => {
    const params = new URLSearchParams();
    if (type !== 'subject'  && activeSubject)  params.set('subject',  activeSubject);
    if (type !== 'category' && activeCategory) params.set('category', activeCategory);
    if (type !== 'level'    && activeLevel)    params.set('level',    activeLevel);
    if (current !== slug) params.set(type, slug);
    const q = params.toString();
    return `/blog${q ? '?' + q : ''}`;
  };

  const allItems = categories
    .filter(c => !c.parent_id && counts[c.id])
    .sort((a, b) => {
      const typeOrder = { subject: 0, category: 1, level: 2 };
      return (typeOrder[a.type] - typeOrder[b.type]) || (a.sort_order - b.sort_order);
    });

  const activeSlug = (type: string) =>
    type === 'subject' ? activeSubject : type === 'category' ? activeCategory : activeLevel;

  const hasFilter = activeSubject || activeCategory || activeLevel;

  return (
    <div style={{
      borderBottom: '1px solid var(--dark-3)',
      background: 'var(--dark)',
      padding: '0.625rem 1rem',
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
    }}>
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', minWidth: 'max-content' }}>
        {allItems.map(item => {
          const isActive = activeSlug(item.type) === item.slug;
          return (
            <Link key={item.id} href={buildUrl(item.type, item.slug, activeSlug(item.type))} style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 600,
              fontSize: '0.75rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '0.3rem 0.625rem',
              borderRadius: 4,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              background: isActive ? 'var(--red)' : 'var(--dark-2)',
              color: isActive ? 'white' : 'var(--grey-light)',
              border: `1px solid ${isActive ? 'var(--red)' : 'var(--dark-3)'}`,
            }}>
              {item.name} <span style={{ opacity: 0.7 }}>{counts[item.id]}</span>
            </Link>
          );
        })}
        {hasFilter && (
          <Link href="/blog" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '0.75rem', color: 'var(--grey)', textDecoration: 'none', padding: '0.3rem 0.5rem', whiteSpace: 'nowrap' }}>
            × Clear
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Post thumbnail ────────────────────────────────────────────────────────────
function PostThumbnail({ post }: { post: Post }) {
  const thumb = post.youtube_url ? getYouTubeThumbnail(post.youtube_url) : post.cover_image;
  return (
    <div style={{ aspectRatio: '16/9', background: 'var(--dark-2)', position: 'relative', overflow: 'hidden' }}>
      {thumb ? (
        <img src={thumb} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(-45deg, transparent, transparent 6px, rgba(217,43,43,0.06) 6px, rgba(217,43,43,0.06) 12px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '2.5rem' }}>🎨</span>
        </div>
      )}
      {post.youtube_url && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)' }}>
          <div style={{ width: 44, height: 44, background: 'var(--red)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Category chips ────────────────────────────────────────────────────────────
function PostCategoryChips({ post }: { post: Post }) {
  const chips = [post.subject, post.category, post.level].filter(Boolean) as Category[];
  if (!chips.length) return null;
  return (
    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
      {chips.map(c => <span key={c.id} className="tag-pill">{c.name}</span>)}
    </div>
  );
}

// ── Featured post ─────────────────────────────────────────────────────────────
function FeaturedPost({ post }: { post: Post }) {
  const thumb = post.youtube_url ? getYouTubeThumbnail(post.youtube_url) : post.cover_image;
  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
      <div className="post-card" style={{ background: 'var(--dark)', border: '1px solid var(--dark-3)', borderRadius: 10, overflow: 'hidden' }}>
        {thumb && (
          <div style={{ aspectRatio: '16/9', position: 'relative', overflow: 'hidden' }}>
            <img src={thumb} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {post.youtube_url && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 60, height: 60, background: 'var(--red)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(217,43,43,0.5)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
            )}
          </div>
        )}
        <div style={{ padding: '1.5rem 1.75rem' }}>
          <PostCategoryChips post={post} />
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--white)', lineHeight: 1.15, margin: '0.625rem 0' }}>{post.title}</h2>
          {post.excerpt && <p style={{ color: 'var(--grey-light)', fontSize: '0.9375rem', lineHeight: 1.65, margin: '0 0 1rem' }}>{post.excerpt}</p>}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '0.85rem', color: 'var(--grey)' }}>
              {post.author} · {post.published_at ? formatDate(post.published_at) : ''}
            </span>
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--red)' }}>Read More →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Post card ─────────────────────────────────────────────────────────────────
function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
      <div className="post-card" style={{ background: 'var(--dark)', border: '1px solid var(--dark-3)', borderRadius: 8, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <PostThumbnail post={post} />
        <div style={{ padding: '1.125rem 1.25rem 1.375rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <PostCategoryChips post={post} />
          <h3 style={{ fontSize: '1.25rem', color: 'var(--white)', lineHeight: 1.2, flex: 1 }}>{post.title}</h3>
          {post.excerpt && (
            <p style={{ color: 'var(--grey)', fontSize: '0.875rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.excerpt}</p>
          )}
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '0.8rem', color: 'var(--grey)', borderTop: '1px solid var(--dark-3)', paddingTop: '0.75rem', marginTop: 'auto' }}>
            {post.published_at ? formatDate(post.published_at) : ''} · {post.author}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function BlogIndex({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; category?: string; level?: string }>;
}) {
  const params = await searchParams;
  const activeSubject  = params.subject;
  const activeCategory = params.category;
  const activeLevel    = params.level;

  let allPosts: Post[]       = [];
  let categories: Category[] = [];

  try {
    [allPosts, categories] = await Promise.all([
      getPublishedPosts(),
      getCategories(),
    ]);
  } catch {
    // Supabase not configured
  }

  // Build counts from ALL published posts (not filtered)
  const counts = buildCounts(allPosts, categories);

  // Filter posts client-side
  let posts = allPosts;
  if (activeSubject)  posts = posts.filter(p => (p.subject  as Category | null)?.slug === activeSubject);
  if (activeCategory) posts = posts.filter(p => (p.category as Category | null)?.slug === activeCategory);
  if (activeLevel)    posts = posts.filter(p => (p.level    as Category | null)?.slug === activeLevel);

  const featured = posts[0] ?? null;
  const rest     = posts.slice(1);
  const hasFilter = activeSubject || activeCategory || activeLevel;

  const activeLabels = [activeSubject, activeCategory, activeLevel]
    .map(slug => categories.find(c => c.slug === slug)?.name)
    .filter(Boolean);

  return (
    <div style={{ minHeight: '100vh' }}>
      <Nav />

      {/* Hero */}
      <div style={{ background: 'var(--dark)', borderBottom: '1px solid var(--dark-3)', padding: 'clamp(2.5rem, 6vw, 4rem) 1.5rem clamp(2rem, 4vw, 3rem)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.35, background: 'repeating-linear-gradient(-45deg, transparent, transparent 6px, rgba(217,43,43,0.04) 6px, rgba(217,43,43,0.04) 12px)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'var(--red)' }} />
        <div className="fade-up" style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '0.82rem', color: 'var(--red)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Guides · Tutorials · Hobby Tips
          </div>
          <h1 style={{ fontSize: 'clamp(2.75rem, 8vw, 5rem)', color: 'var(--white)', lineHeight: 1 }}>
            THE HOBBY<br /><span style={{ color: 'var(--red)' }}>WORKBENCH</span>
          </h1>
          <p style={{ color: 'var(--grey-light)', fontSize: '1.0625rem', marginTop: '1rem', maxWidth: 480, lineHeight: 1.65 }}>
            Painting guides, assembly tutorials, and hobby inspiration from the HobbyCity team in Auckland.
          </p>
        </div>
      </div>

      {/* Mobile filters (hidden on desktop via CSS) */}
      <div className="mobile-filters">
        <MobileFilters categories={categories} counts={counts} activeSubject={activeSubject} activeCategory={activeCategory} activeLevel={activeLevel} />
      </div>

      {/* Main layout */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>

          {/* Sidebar (hidden on mobile via CSS) */}
          <div className="desktop-sidebar">
            <Sidebar categories={categories} counts={counts} activeSubject={activeSubject} activeCategory={activeCategory} activeLevel={activeLevel} />
          </div>

          {/* Posts */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {hasFilter && activeLabels.length > 0 && (
              <div style={{ marginBottom: '1.75rem' }}>
                <h2 style={{ fontSize: '1.75rem', color: 'var(--white)', marginBottom: '0.25rem' }}>
                  {activeLabels.join(' · ')}
                </h2>
                <p style={{ color: 'var(--grey)', fontSize: '0.875rem' }}>
                  {posts.length} post{posts.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {posts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--grey)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎨</div>
                <p style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.75rem', color: 'var(--dark-3)', letterSpacing: '0.05em' }}>
                  {hasFilter ? 'No posts found' : 'Coming Soon'}
                </p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  {hasFilter ? 'Try a different filter' : 'Check back soon!'}
                </p>
              </div>
            ) : (
              <>
                {featured && !hasFilter && (
                  <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '0.75rem', color: 'var(--red)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.875rem' }}>★ Latest</div>
                    <FeaturedPost post={featured} />
                  </div>
                )}

                {(hasFilter ? posts : rest).length > 0 && (
                  <>
                    {!hasFilter && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                        <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '0.75rem', color: 'var(--grey)', letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>All Posts</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--dark-3)' }} />
                      </div>
                    )}
                    <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
                      {(hasFilter ? posts : rest).map(post => <PostCard key={post.id} post={post} />)}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
