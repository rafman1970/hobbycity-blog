import Link from 'next/link';
import { getPublishedPosts, type Post } from '@/lib/posts';
import { getYouTubeThumbnail } from '@/lib/youtube';
import { formatDate } from '@/lib/format';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const revalidate = 60;

function VideoPlayIcon() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.25)',
    }}>
      <div style={{
        width: 52, height: 52,
        background: 'var(--red)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(217,43,43,0.5)',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
    </div>
  );
}

function PostThumbnail({ post }: { post: Post }) {
  const thumb = post.youtube_url ? getYouTubeThumbnail(post.youtube_url) : post.cover_image;
  return (
    <div style={{ aspectRatio: '16/9', background: 'var(--dark-2)', position: 'relative', overflow: 'hidden' }}>
      {thumb ? (
        <img src={thumb} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          background: 'repeating-linear-gradient(-45deg, transparent, transparent 6px, rgba(217,43,43,0.06) 6px, rgba(217,43,43,0.06) 12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '2.5rem' }}>🎨</span>
        </div>
      )}
      {post.youtube_url && <VideoPlayIcon />}
    </div>
  );
}

function FeaturedPost({ post }: { post: Post }) {
  const thumb = post.youtube_url ? getYouTubeThumbnail(post.youtube_url) : post.cover_image;

  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
      <div className="post-card" style={{
        background: 'var(--dark)',
        border: '1px solid var(--dark-3)',
        borderRadius: 10,
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
      }}>
        {/* Image */}
        <div style={{ aspectRatio: '16/9', background: 'var(--dark-2)', position: 'relative', overflow: 'hidden' }}>
          {thumb ? (
            <img src={thumb} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: 'repeating-linear-gradient(-45deg, transparent, transparent 6px, rgba(217,43,43,0.06) 6px, rgba(217,43,43,0.06) 12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '3.5rem' }}>🎨</span>
            </div>
          )}
          {post.youtube_url && <VideoPlayIcon />}
        </div>

        {/* Content */}
        <div style={{ padding: '2.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.875rem' }}>
          {post.tags && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {post.tags.split(',').slice(0, 3).map(t => (
                <span key={t} className="tag-pill">{t.trim()}</span>
              ))}
            </div>
          )}
          <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)', color: 'var(--white)', lineHeight: 1.15 }}>
            {post.title}
          </h2>
          {post.excerpt && (
            <p style={{ color: 'var(--grey-light)', fontSize: '0.9375rem', lineHeight: 1.65 }}>
              {post.excerpt}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
            <span style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontSize: '0.85rem',
              color: 'var(--grey)',
            }}>
              {post.author} · {post.published_at ? formatDate(post.published_at) : ''}
            </span>
            <span style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 600,
              fontSize: '0.875rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--red)',
            }}>
              Read More →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
      <div className="post-card" style={{
        background: 'var(--dark)',
        border: '1px solid var(--dark-3)',
        borderRadius: 8,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <PostThumbnail post={post} />
        <div style={{ padding: '1.125rem 1.25rem 1.375rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {post.tags && (
            <span className="tag-pill" style={{ alignSelf: 'flex-start' }}>
              {post.tags.split(',')[0].trim()}
            </span>
          )}
          <h3 style={{ fontSize: '1.25rem', color: 'var(--white)', lineHeight: 1.2, flex: 1 }}>
            {post.title}
          </h3>
          {post.excerpt && (
            <p style={{
              color: 'var(--grey)',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {post.excerpt}
            </p>
          )}
          <div style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontSize: '0.8rem',
            color: 'var(--grey)',
            borderTop: '1px solid var(--dark-3)',
            paddingTop: '0.75rem',
            marginTop: 'auto',
          }}>
            {post.published_at ? formatDate(post.published_at) : ''} · {post.author}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function BlogIndex() {
  let posts: Post[] = [];
  try {
    posts = await getPublishedPosts();
  } catch {
    // Supabase not yet configured — show empty state
  }

  const featured = posts[0] ?? null;
  const rest     = posts.slice(1);

  return (
    <div style={{ minHeight: '100vh' }}>
      <Nav />

      {/* Hero banner */}
      <div style={{
        background: 'var(--dark)',
        borderBottom: '1px solid var(--dark-3)',
        padding: 'clamp(2.5rem, 6vw, 4.5rem) 1.5rem clamp(2rem, 5vw, 3.5rem)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.35,
          background: 'repeating-linear-gradient(-45deg, transparent, transparent 6px, rgba(217,43,43,0.04) 6px, rgba(217,43,43,0.04) 12px)',
        }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'var(--red)' }} />

        <div className="fade-up" style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <div style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 600,
            fontSize: '0.82rem',
            color: 'var(--red)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '0.75rem',
          }}>
            Guides · Tutorials · Hobby Tips
          </div>
          <h1 style={{ fontSize: 'clamp(2.75rem, 8vw, 5.5rem)', color: 'var(--white)', lineHeight: 1 }}>
            THE HOBBY<br />
            <span style={{ color: 'var(--red)' }}>WORKBENCH</span>
          </h1>
          <p style={{
            color: 'var(--grey-light)',
            fontSize: '1.0625rem',
            marginTop: '1rem',
            maxWidth: 480,
            lineHeight: 1.65,
          }}>
            Painting guides, assembly tutorials, and hobby inspiration from the HobbyCity team in Auckland.
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem' }}>

        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--grey)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎨</div>
            <p style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '2rem', color: 'var(--dark-3)', letterSpacing: '0.05em' }}>
              Coming Soon
            </p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9375rem' }}>
              Check back soon for hobby guides and tutorials!
            </p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured && (
              <div style={{ marginBottom: '3rem' }}>
                <div style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  color: 'var(--red)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                }}>
                  ★ Latest
                </div>
                <FeaturedPost post={featured} />
              </div>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}>
                  <span style={{
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    color: 'var(--grey)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}>
                    All Posts
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'var(--dark-3)' }} />
                </div>

                <div className="stagger" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1.5rem',
                }}>
                  {rest.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
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
