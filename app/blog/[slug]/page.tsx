import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPublishedSlugs } from '@/lib/posts';
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from '@/lib/youtube';
import { formatDate } from '@/lib/format';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { marked } from 'marked';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const slugs = await getAllPublishedSlugs();
    return slugs.map(slug => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — HobbyCity Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.cover_image ? [post.cover_image] : [],
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let post = null;
  try {
    post = await getPostBySlug(slug);
  } catch {
    // supabase not configured
  }

  if (!post) notFound();

  const htmlContent = marked(post.content || '');
  const embedUrl    = post.youtube_url ? getYouTubeEmbedUrl(post.youtube_url) : null;
  const thumb       = post.youtube_url ? getYouTubeThumbnail(post.youtube_url) : null;

  return (
    <div style={{ minHeight: '100vh' }}>
      <Nav backLabel="All Posts" backHref="/blog" />

      {/* Post hero */}
      <div style={{
        background: 'var(--dark)',
        borderBottom: '1px solid var(--dark-3)',
        padding: 'clamp(2rem, 5vw, 3.5rem) 1.5rem clamp(1.75rem, 4vw, 2.75rem)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'var(--red)' }} />

        <div className="fade-up" style={{ maxWidth: 780, margin: '0 auto', position: 'relative' }}>
          {/* Tags */}
          {post.tags && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {post.tags.split(',').map(t => (
                <span key={t} className="tag-pill">{t.trim()}</span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 style={{ fontSize: 'clamp(1.875rem, 5vw, 3.25rem)', color: 'var(--white)', lineHeight: 1.1, marginBottom: '1rem' }}>
            {post.title}
          </h1>

          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '0.9rem', color: 'var(--grey-light)' }}>
              By {post.author}
            </span>
            <span style={{ width: 3, height: 3, background: 'var(--dark-3)', borderRadius: '50%', display: 'inline-block' }} />
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '0.9rem', color: 'var(--grey)' }}>
              {post.published_at ? formatDate(post.published_at) : ''}
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 1.5rem' }}>

        {/* YouTube embed */}
        {embedUrl && (
          <div style={{ marginTop: '2.5rem' }}>
            <div style={{
              position: 'relative',
              paddingBottom: '56.25%',
              background: 'var(--dark-2)',
              borderRadius: 8,
              overflow: 'hidden',
              border: '1px solid var(--dark-3)',
            }}>
              <iframe
                src={embedUrl}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={post.title}
              />
            </div>
          </div>
        )}

        {/* Cover image (only if no YouTube) */}
        {post.cover_image && !embedUrl && (
          <div style={{ marginTop: '2.5rem' }}>
            <img
              src={post.cover_image}
              alt={post.title}
              style={{ width: '100%', borderRadius: 8, display: 'block', border: '1px solid var(--dark-3)' }}
            />
          </div>
        )}

        {/* Article body */}
        <article style={{ padding: '2.5rem 0 5rem' }}>
          {post.excerpt && (
            <p style={{
              fontSize: '1.125rem',
              color: 'var(--grey-light)',
              lineHeight: 1.7,
              marginBottom: '2rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid var(--dark-3)',
              fontStyle: 'italic',
            }}>
              {post.excerpt}
            </p>
          )}
          <div
            className="prose-blog"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </article>
      </div>

      {/* Back link */}
      <div style={{ borderTop: '1px solid var(--dark-3)', padding: '1.75rem 1.5rem' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <a href="/blog" style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 600,
            fontSize: '0.9rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--red)',
            textDecoration: 'none',
          }}>
            ← Back to all posts
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
