import Link from 'next/link';
import { getPublishedPosts, getCategories, type Post, type Category } from '@/lib/posts';
import { getYouTubeThumbnail } from '@/lib/youtube';
import { formatDate } from '@/lib/format';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const revalidate = 60;

// ── Filter bar ────────────────────────────────────────────────────────────────
function FilterBar({ categories, activeSubject, activeCategory, activeLevel }: {
  categories: Category[];
  activeSubject?: string;
  activeCategory?: string;
  activeLevel?: string;
}) {
  const subjects   = categories.filter(c => c.type === 'subject'  && !c.parent_id);
  const cats       = categories.filter(c => c.type === 'category' && !c.parent_id);
  const levels     = categories.filter(c => c.type === 'level');

  const buildUrl = (type: string, slug: string, current: string | undefined) => {
    const params = new URLSearchParams();
    if (type !== 'subject'  && activeSubject)  params.set('subject',  activeSubject);
    if (type !== 'category' && activeCategory) params.set('category', activeCategory);
    if (type !== 'level'    && activeLevel)    params.set('level',    activeLevel);
    if (current !== slug) params.set(type, slug);
    const q = params.toString();
    return `/blog${q ? '?' + q : ''}`;
  };

  const pillStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: 'Barlow Condensed, sans-serif',
    fontWeight: 600,
    fontSize: '0.78rem',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    padding: '0.3rem 0.75rem',
    borderRadius: 4,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    background: active ? 'var(--red)' : 'var(--dark-2)',
    color: active ? 'white' : 'var(--grey-light)',
    border: `1px solid ${active ? 'var(--red)' : 'var(--dark-3)'}`,
    transition: 'all 0.15s',
  });

  const clearUrl = '/blog';
  const hasFilter = activeSubject || activeCategory || activeLevel;

  return (
    <div style={{ borderBottom: '1px solid var(--dark-3)', background: 'var(--dark)', padding: '0.875rem 1.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>

        {/* Subjects */}
        {subjects.length > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--grey)', width: 68, flexShrink: 0 }}>Subject</span>
            {subjects.map(s => (
              <Link key={s.id} href={buildUrl('subject', s.slug, activeSubject)} style={pillStyle(activeSubject === s.slug)}>{s.name}</Link>
            ))}
          </div>
        )}

        {/* Categories */}
        {cats.length > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--grey)', width: 68, flexShrink: 0 }}>Category</span>
            {cats.map(c => (
              <Link key={c.id} href={buildUrl('category', c.slug, activeCategory)} style={pillStyle(activeCategory === c.slug)}>{c.name}</Link>
            ))}
          </div>
        )}

        {/* Levels */}
        {levels.length > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--grey)', width: 68, flexShrink: 0 }}>Level</span>
            {levels.map(l => (
              <Link key={l.id} href={buildUrl('level', l.slug, activeLevel)} style={pillStyle(activeLevel === l.slug)}>{l.name}</Link>
            ))}
          </div>
        )}

        {/* Clear filters */}
        {hasFilter && (
          <div>
            <Link href={clearUrl} style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '0.75rem', color: 'var(--grey)', textDecoration: 'none', letterSpacing: '0.05em' }}>
              × Clear filters
            </Link>
          </div>
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

// ── Category chips on card ────────────────────────────────────────────────────
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
      <div className="post-card" style={{ background: 'var(--dark)', border: '1px solid var(--dark-3)', borderRadius: 10, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ aspectRatio: '16/9', background: 'var(--dark-2)', position: 'relative', overflow: 'hidden' }}>
          {thumb ? <img src={thumb} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
            <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(-45deg, transparent, transparent 6px, rgba(217,43,43,0.06) 6px, rgba(217,43,43,0.06) 12px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '3.5rem' }}>🎨</span></div>
          )}
          {post.youtube_url && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 52, height: 52, background: 'var(--red)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(217,43,43,0.5)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          )}
        </div>
        <div style={{ padding: '2.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.875rem' }}>
          <PostCategoryChips post={post} />
          <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)', color: 'var(--white)', lineHeight: 1.15 }}>{post.title}</h2>
          {post.excerpt && <p style={{ color: 'var(--grey-light)', fontSize: '0.9375rem', lineHeight: 1.65 }}>{post.excerpt}</p>}
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

  let posts: Post[] = [];
  let categories: Category[] = [];

  try {
    [posts, categories] = await Promise.all([
      getPublishedPosts({ subjectSlug: activeSubject, categorySlug: activeCategory, levelSlug: activeLevel }),
      getCategories(),
    ]);
  } catch {
    // Supabase not configured
  }

  const featured = posts[0] ?? null;
  const rest     = posts.slice(1);
  const hasFilter = activeSubject || activeCategory || activeLevel;

  // Build active filter label
  const activeLabels = [activeSubject, activeCategory, activeLevel]
    .map(slug => categories.find(c => c.slug === slug)?.name)
    .filter(Boolean);

  return (
    <div style={{ minHeight: '100vh' }}>
      <Nav />

      {/* Hero */}
      <div style={{ background: 'var(--dark)', borderBottom: '1px solid var(--dark-3)', padding: 'clamp(2.5rem, 6vw, 4.5rem) 1.5rem clamp(2rem, 5vw, 3.5rem)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.35, background: 'repeating-linear-gradient(-45deg, transparent, transparent 6px, rgba(217,43,43,0.04) 6px, rgba(217,43,43,0.04) 12px)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'var(--red)' }} />
        <div className="fade-up" style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '0.82rem', color: 'var(--red)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Guides · Tutorials · Hobby Tips
          </div>
          <h1 style={{ fontSize: 'clamp(2.75rem, 8vw, 5.5rem)', color: 'var(--white)', lineHeight: 1 }}>
            THE HOBBY<br /><span style={{ color: 'var(--red)' }}>WORKBENCH</span>
          </h1>
          <p style={{ color: 'var(--grey-light)', fontSize: '1.0625rem', marginTop: '1rem', maxWidth: 480, lineHeight: 1.65 }}>
            Painting guides, assembly tutorials, and hobby inspiration from the HobbyCity team in Auckland.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      {categories.length > 0 && (
        <FilterBar categories={categories} activeSubject={activeSubject} activeCategory={activeCategory} activeLevel={activeLevel} />
      )}

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Active filter heading */}
        {hasFilter && activeLabels.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', color: 'var(--white)' }}>
              {activeLabels.join(' · ')}
            </h2>
            <p style={{ color: 'var(--grey)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {posts.length} post{posts.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--grey)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎨</div>
            <p style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2rem', color: 'var(--dark-3)', letterSpacing: '0.05em' }}>
              {hasFilter ? 'No posts found' : 'Coming Soon'}
            </p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9375rem' }}>
              {hasFilter ? 'Try a different filter combination' : 'Check back soon for hobby guides and tutorials!'}
            </p>
          </div>
        ) : (
          <>
            {featured && !hasFilter && (
              <div style={{ marginBottom: '3rem' }}>
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '0.78rem', color: 'var(--red)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>★ Latest</div>
                <FeaturedPost post={featured} />
              </div>
            )}

            {(hasFilter ? posts : rest).length > 0 && (
              <>
                {!hasFilter && rest.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 600, fontSize: '0.78rem', color: 'var(--grey)', letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>All Posts</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--dark-3)' }} />
                  </div>
                )}
                <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {(hasFilter ? posts : rest).map(post => <PostCard key={post.id} post={post} />)}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
