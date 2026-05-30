import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPublishedSlugs } from '@/lib/posts';
import { getYouTubeEmbedUrl } from '@/lib/youtube';
import { formatDate } from '@/lib/format';
import { parseBlocks, renderTextContent } from '@/lib/blocks';
import type { Block } from '@/lib/blocks';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
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

// ── Block renderers ───────────────────────────────────────────────────────────
function RenderBlock({ block }: { block: Block }) {
  if (block.type === 'text') {
    return (
      <div
        className="prose-blog"
        dangerouslySetInnerHTML={{ __html: renderTextContent(block.content) }}
        style={{ marginBottom: '1.75rem' }}
      />
    );
  }

  if (block.type === 'image') {
    if (!block.url) return null;
    return (
      <figure style={{ margin: '0 0 2rem' }}>
        <img
          src={block.url}
          alt={block.alt || ''}
          style={{
            width: '100%',
            borderRadius: 8,
            display: 'block',
            border: '1px solid var(--dark-3)',
          }}
        />
        {block.caption && (
          <figcaption style={{
            fontSize: '0.8125rem',
            color: 'var(--grey)',
            textAlign: 'center',
            marginTop: '0.625rem',
            fontStyle: 'italic',
          }}>
            {block.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  if (block.type === 'youtube') {
    if (!block.url) return null;
    return (
      <div style={{ margin: '0 0 1.75rem' }}>
        <a
          href={block.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--red-light)',
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 600,
            fontSize: '1rem',
            letterSpacing: '0.04em',
            textDecoration: 'none',
            borderBottom: '1px solid rgba(240,64,64,0.3)',
            paddingBottom: '2px',
            transition: 'color 0.15s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.28 8.28 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z"/>
          </svg>
          {block.label || 'Watch on YouTube'}
        </a>
      </div>
    );
  }

  return null;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let post = null;
  try {
    post = await getPostBySlug(slug);
  } catch {
    // supabase not configured
  }

  if (!post) notFound();

  const blocks = parseBlocks(post.content || '');

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
          {post.tags && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {post.tags.split(',').map(t => (
                <span key={t} className="tag-pill">{t.trim()}</span>
              ))}
            </div>
          )}
          <h1 style={{ fontSize: 'clamp(1.875rem, 5vw, 3.25rem)', color: 'var(--white)', lineHeight: 1.1, marginBottom: '1rem' }}>
            {post.title}
          </h1>
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

        {/* Cover image */}
        {post.cover_image && (
          <div style={{ marginTop: '2.5rem' }}>
            <img
              src={post.cover_image}
              alt={post.title}
              style={{ width: '100%', borderRadius: 8, display: 'block', border: '1px solid var(--dark-3)' }}
            />
          </div>
        )}

        {/* Excerpt */}
        {post.excerpt && (
          <p style={{
            fontSize: '1.125rem',
            color: 'var(--grey-light)',
            lineHeight: 1.7,
            margin: '2rem 0 0',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid var(--dark-3)',
            fontStyle: 'italic',
          }}>
            {post.excerpt}
          </p>
        )}

        {/* Content blocks */}
        <article style={{ padding: '2rem 0 5rem' }}>
          {blocks.map(block => (
            <RenderBlock key={block.id} block={block} />
          ))}
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
