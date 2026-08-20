const { stripHtml } = require('../utils/htmlUtils');

const SITE_NAME     = process.env.SITE_NAME     || 'EGA Điện Máy';
const SITE_URL      = process.env.SITE_URL       || 'http://localhost:3000';
const SITE_LOGO_URL = process.env.SITE_LOGO_URL  || `${SITE_URL}/logo.png`;

const buildBlogPostingSchema = (post) => {
  const authorName = post.authorId
    ? `${post.authorId.firstName || ''} ${post.authorId.lastName || ''}`.trim() || 'Admin'
    : 'Admin';

  const postUrl = `${SITE_URL}/blog/${post.slug}`;

  const tags = (post.tags || []).map(t => t.name || t).filter(Boolean);

  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog',      item: `${SITE_URL}/blog` },
      ...(post.categoryId
        ? [{ '@type': 'ListItem', position: 3, name: post.categoryId.name, item: `${SITE_URL}/blog/category/${post.categoryId.slug}` }]
        : []),
      { '@type': 'ListItem', position: post.categoryId ? 4 : 3, name: post.title, item: postUrl },
    ],
  };

  const faqs = extractFAQs(post.content || '');

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${postUrl}#article`,
        headline:     post.title,
        description:  post.metaDescription || post.excerpt || '',
        url:          postUrl,
        inLanguage:   'vi-VN',
        datePublished: post.publishedAt ? post.publishedAt.toISOString() : post.createdAt.toISOString(),
        dateModified:  post.updatedAt ? post.updatedAt.toISOString() : post.createdAt.toISOString(),
        wordCount:    post.wordCount || 0,
        timeRequired: `PT${post.minRead || 1}M`,
        keywords:     tags.join(', '),
        ...(post.thumbnailUrl && {
          image: {
            '@type': 'ImageObject',
            url:    post.thumbnailUrl,
            width:  1200,
            height: 630,
          },
        }),
        author: {
          '@type': 'Person',
          name: authorName,
          url:  `${SITE_URL}/author/${post.authorId?._id || 'admin'}`,
        },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          logo: {
            '@type': 'ImageObject',
            url:    SITE_LOGO_URL,
            width:  200,
            height: 60,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id':   postUrl,
        },
        ...(post.tableOfContents?.length > 0 && {
          speakable: {
            '@type': 'SpeakableSpecification',
            cssSelector: ['article h2:first-of-type', 'article p:first-of-type'],
          },
        }),
        articleBody:    stripHtml(post.content || '').slice(0, 500),
        articleSection: post.categoryId?.name || 'Blog',
        commentCount:   post.commentsCount || 0,
        ...(post.canonicalUrl && { url: post.canonicalUrl }),
      },

      breadcrumb,

      ...(faqs.length > 0
        ? [{
            '@type': 'FAQPage',
            '@id':   `${postUrl}#faq`,
            mainEntity: faqs.map(({ q, a }) => ({
              '@type': 'Question',
              name:    q,
              acceptedAnswer: { '@type': 'Answer', text: a },
            })),
          }]
        : []),

      {
        '@type': 'WebSite',
        '@id':   `${SITE_URL}/#website`,
        url:     SITE_URL,
        name:    SITE_NAME,
        inLanguage: 'vi-VN',
        potentialAction: {
          '@type':       'SearchAction',
          target:        `${SITE_URL}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return schema;
};

const extractFAQs = (html) => {
  const headingRe = /<h[23][^>]*>(.*?)<\/h[23]>/gi;
  const paraRe    = /<p[^>]*>(.*?)<\/p>/gi;
  const faqs = [];

  const headings = [];
  let match;
  while ((match = headingRe.exec(html)) !== null) {
    const text = stripHtml(match[1]).trim();
    if (text.endsWith('?') || text.toLowerCase().startsWith('tại sao') || text.toLowerCase().startsWith('how')) {
      headings.push({ index: match.index, text });
    }
  }

  if (headings.length === 0) return [];

  for (const h of headings) {
    const afterHeading = html.slice(h.index + h.text.length);
    paraRe.lastIndex = 0;
    const pMatch = paraRe.exec(afterHeading);
    if (pMatch) {
      const answer = stripHtml(pMatch[1]).trim();
      if (answer.length > 10) {
        faqs.push({ q: h.text, a: answer });
      }
    }
  }

  return faqs.slice(0, 5);
};

const buildSeoFields = (post) => ({
  schema:          buildBlogPostingSchema(post),
  canonicalUrl:    post.canonicalUrl || `${SITE_URL}/blog/${post.slug}`,
  robotsMeta:      post.status === 'published' && post.isActive ? 'index,follow' : 'noindex,nofollow',
  openGraph: {
    title:       post.metaTitle    || post.title,
    description: post.metaDescription || post.excerpt || '',
    image:       post.thumbnailUrl || '',
    url:         `${SITE_URL}/blog/${post.slug}`,
    type:        'article',
    publishedTime: post.publishedAt?.toISOString(),
    modifiedTime:  post.updatedAt?.toISOString(),
    author:      post.authorId ? `${post.authorId.firstName} ${post.authorId.lastName}`.trim() : 'Admin',
    section:     post.categoryId?.name || 'Blog',
    tags:        (post.tags || []).map(t => t.name || t),
  },
  twitterCard: {
    card:        'summary_large_image',
    title:       post.metaTitle    || post.title,
    description: post.metaDescription || post.excerpt || '',
    image:       post.thumbnailUrl || '',
  },
});

module.exports = { buildSeoFields, buildBlogPostingSchema };
