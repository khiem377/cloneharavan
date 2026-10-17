const axios = require('axios');
const cheerio = require('cheerio');
const BlogPost = require('../models/blogPost.model');
const BlogCategory = require('../models/blogCategory.model');
const Tag = require('../models/tag.model');
const Folder = require('../models/folder.model');
const Media = require('../models/media.model');
const User = require('../models/user.model');
const { slugify } = require('../utils/slugify');
const { stripHtml } = require('../utils/htmlUtils');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
};

const FEEDS = [
  { url: 'https://vnexpress.net/rss/so-hoa.rss', source: 'VnExpress' },
  { url: 'https://vnexpress.net/rss/gia-dinh.rss', source: 'VnExpress' },
  { url: 'https://vnexpress.net/rss/khoa-hoc.rss', source: 'VnExpress' },
  { url: 'https://cellphones.com.vn/sforum/feed', source: 'Sforum' },
];

const PREDEFINED_CATEGORIES = [
  {
    name: 'Tin công nghệ & Xu hướng',
    slug: 'tin-cong-nghe-xu-huong',
    description: 'Cập nhật tin tức công nghệ mới nhất, sản phẩm ra mắt và xu hướng tương lai'
  },
  {
    name: 'Đánh giá & Trên tay',
    slug: 'danh-gia-tren-tay',
    description: 'Review chi tiết, mở hộp và trải nghiệm thực tế các sản phẩm công nghệ hot nhất'
  },
  {
    name: 'Tư vấn chọn mua',
    slug: 'tu-van-chon-mua',
    description: 'Cẩm nang hướng dẫn chọn mua thiết bị điện máy, điện tử, gia dụng phù hợp nhu cầu'
  },
  {
    name: 'Điện máy & Gia dụng',
    slug: 'dien-may-gia-dung',
    description: 'Xu hướng và kinh nghiệm chọn mua, sử dụng đồ điện máy, thiết bị gia dụng hiện đại'
  },
  {
    name: 'Mẹo hay gia đình',
    slug: 'meo-hay-gia-dinh',
    description: 'Bí quyết sử dụng thiết bị gia dụng bền lâu, tiết kiệm điện và các mẹo sống tiện ích'
  },
  {
    name: 'Trí tuệ nhân tạo & AI',
    slug: 'tri-tue-nhan-tao-ai',
    description: 'Những bước tiến vượt bậc của AI, công cụ thông minh và ứng dụng trong công việc'
  }
];

function determineCategory(title = '', excerpt = '') {
  const text = (title + ' ' + excerpt).toLowerCase();

  if (text.includes('ai') || text.includes('trí tuệ nhân tạo') || text.includes('chatgpt') || text.includes('gemini') || text.includes('copilot') || text.includes('robot')) {
    return {
      name: 'Trí tuệ nhân tạo & AI',
      slug: 'tri-tue-nhan-tao-ai',
      description: 'Những bước tiến vượt bậc của AI, công cụ thông minh và ứng dụng trong công việc'
    };
  }

  if (text.includes('tủ lạnh') || text.includes('máy giặt') || text.includes('điều hòa') || text.includes('máy lạnh') || text.includes('nồi chiên') || text.includes('lọc không khí') || text.includes('robot hút bụi') || text.includes('điện máy') || text.includes('gia dụng')) {
    return {
      name: 'Điện máy & Gia dụng',
      slug: 'dien-may-gia-dung',
      description: 'Xu hướng và kinh nghiệm chọn mua, sử dụng đồ điện máy, thiết bị gia dụng hiện đại'
    };
  }

  if (text.includes('đánh giá') || text.includes('trên tay') || text.includes('review') || text.includes('mở hộp') || text.includes('trải nghiệm') || text.includes('thử nghiệm')) {
    return {
      name: 'Đánh giá & Trên tay',
      slug: 'danh-gia-tren-tay',
      description: 'Review chi tiết, mở hộp và trải nghiệm thực tế các sản phẩm công nghệ hot nhất'
    };
  }

  if (text.includes('tư vấn') || text.includes('nên mua') || text.includes('chọn mua') || text.includes('so sánh') || text.includes('top ') || text.includes('đáng mua') || text.includes('giá rẻ')) {
    return {
      name: 'Tư vấn chọn mua',
      slug: 'tu-van-chon-mua',
      description: 'Cẩm nang hướng dẫn chọn mua thiết bị điện máy, điện tử, gia dụng phù hợp nhu cầu'
    };
  }

  if (text.includes('mẹo') || text.includes('thủ thuật') || text.includes('hướng dẫn') || text.includes('bí quyết') || text.includes('cách ') || text.includes('gia đình') || text.includes('nhà cửa') || text.includes('tiết kiệm điện')) {
    return {
      name: 'Mẹo hay gia đình',
      slug: 'meo-hay-gia-dinh',
      description: 'Bí quyết sử dụng thiết bị gia dụng bền lâu, tiết kiệm điện và các mẹo sống tiện ích'
    };
  }

  return {
    name: 'Tin công nghệ & Xu hướng',
    slug: 'tin-cong-nghe-xu-huong',
    description: 'Cập nhật tin tức công nghệ mới nhất, sản phẩm ra mắt và xu hướng tương lai'
  };
}

function extractTagsFromText(title = '', content = '') {
  const text = (title + ' ' + content).toLowerCase();
  const matchedTags = new Set();

  const rules = [
    { tag: 'Apple', match: ['apple', 'iphone', 'ipad', 'macbook', 'airpods', 'ios'] },
    { tag: 'Samsung', match: ['samsung', 'galaxy', 'z fold', 'z flip', 'one ui', 'bespoke'] },
    { tag: 'Xiaomi', match: ['xiaomi', 'redmi', 'hyperos', 'mi home'] },
    { tag: 'Sony', match: ['sony', 'playstation', 'ps5', 'bravia'] },
    { tag: 'Trí Tuệ Nhân Tạo (AI)', match: ['ai', 'trí tuệ nhân tạo', 'chatgpt', 'gemini', 'copilot', 'deep learning'] },
    { tag: 'Smartphone', match: ['smartphone', 'điện thoại', 'flagship', 'màn hình gập', 'màn hình 120hz'] },
    { tag: 'Laptop & PC', match: ['laptop', 'macbook', 'pc', 'máy tính', 'card đồ họa', 'cpu'] },
    { tag: 'Gia Dụng Thông Minh', match: ['gia dụng', 'nhà thông minh', 'smarthome', 'robot hút bụi', 'nồi chiên', 'máy lọc nước'] },
    { tag: 'Điện Lạnh & Điện Máy', match: ['tủ lạnh', 'máy giặt', 'máy lạnh', 'điều hòa', 'inverter', 'tiết kiệm điện'] },
    { tag: 'Mẹo Hay & Thủ Thuật', match: ['mẹo', 'thủ thuật', 'hướng dẫn', 'bí quyết', 'kinh nghiệm'] },
    { tag: 'Khoa Học & Đời Sống', match: ['khoa học', 'khám phá', 'sinh thái', 'đời sống', 'sức khỏe'] },
    { tag: 'Xu Hướng 2026', match: ['2026', 'công nghệ', 'tương lai', 'thế hệ mới', 'đột phá'] }
  ];

  for (const r of rules) {
    if (r.match.some(m => text.includes(m))) {
      matchedTags.add(r.tag);
    }
  }

  if (matchedTags.size === 0) {
    matchedTags.add('Công Nghệ');
    matchedTags.add('Xu Hướng 2026');
  }

  return Array.from(matchedTags).slice(0, 4);
}

const extractToc = (html) => {
  const headingRe = /<h([23])[^>]*?(?:id="([^"]*)")?[^>]*>(.*?)<\/h\1>/gi;
  const result = [];
  let match;
  let order = 0;
  while ((match = headingRe.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const text  = stripHtml(match[3]).trim();
    if (!text) continue;
    const id    = match[2] || slugify(text) || `heading-${order}`;
    result.push({ id, text, level, order: order++ });
  }
  return result;
};

async function scrapeFullArticle(link, source) {
  try {
    const res = await axios.get(link, { headers: HEADERS, timeout: 15000 });
    const $ = cheerio.load(res.data);

    let title = '';
    let excerpt = '';
    let contentHtml = '';
    let thumbUrl = $('meta[property="og:image"]').attr('content') || '';

    if (source === 'Sforum') {
      title = $('h1.title-post, h1.entry-title, h1').first().text().trim().replace(/\s+/g, ' ');
      excerpt = $('.sapo-post, .article-sapo, .post-excerpt').first().text().trim();

      const contentElem = $('.content-post, .entry-content, article').first();
      contentElem.find('script, style, iframe, .ads, .banner, .box-share, .related-posts, .author-box, .comment-box, .widget').remove();

      const bodyBlocks = [];
      contentElem.find('p, h2, h3, h4, ul, ol, img, blockquote').each((_, el) => {
        const tag = el.tagName.toLowerCase();
        if (tag === 'img') {
          const src = $(el).attr('src') || $(el).attr('data-src');
          const alt = $(el).attr('alt') || title;
          if (src && !src.includes('base64')) {
            bodyBlocks.push(`<figure class="my-4"><img src="${src}" alt="${alt}" class="rounded-[6px] w-full" /><figcaption class="text-xs text-center text-slate-500 mt-1">${alt}</figcaption></figure>`);
          }
        } else if (tag === 'h2' || tag === 'h3') {
          const headingText = $(el).text().trim();
          if (headingText.length > 2) {
            const hid = slugify(headingText);
            bodyBlocks.push(`<${tag} id="${hid}">${headingText}</${tag}>`);
          }
        } else {
          const text = $(el).text().trim();
          if (text.length > 5) {
            bodyBlocks.push(`<${tag}>${$(el).html()}</${tag}>`);
          }
        }
      });
      contentHtml = bodyBlocks.join('\n');
    } else if (source === 'VnExpress') {
      title = $('h1.title-detail, h1').first().text().trim().replace(/\s+/g, ' ');
      excerpt = $('p.description').first().text().trim();

      const contentElem = $('article.fck_detail, .fck_detail').first();
      contentElem.find('script, style, iframe, .box-share, .box-comment, .banner, .inner-article').remove();

      const bodyBlocks = [];
      contentElem.find('p.Normal, p, h2, h3, ul, figure').each((_, el) => {
        const tag = el.tagName.toLowerCase();
        if (tag === 'figure') {
          const img = $(el).find('img').first();
          const src = img.attr('data-src') || img.attr('src');
          const figcaption = $(el).find('figcaption, .caption').text().trim() || title;
          if (src) {
            bodyBlocks.push(`<figure class="my-4"><img src="${src}" alt="${figcaption}" class="rounded-[6px] w-full" /><figcaption class="text-xs text-center text-slate-500 mt-1">${figcaption}</figcaption></figure>`);
          }
        } else if (tag === 'h2' || tag === 'h3') {
          const headingText = $(el).text().trim();
          if (headingText.length > 2) {
            const hid = slugify(headingText);
            bodyBlocks.push(`<${tag} id="${hid}">${headingText}</${tag}>`);
          }
        } else {
          const text = $(el).text().trim();
          if (text.length > 5) {
            bodyBlocks.push(`<p>${$(el).html()}</p>`);
          }
        }
      });
      contentHtml = bodyBlocks.join('\n');
    }

    if (!title || title.length < 10 || !contentHtml || contentHtml.length < 150) {
      return null;
    }

    if (!excerpt) {
      excerpt = contentHtml.replace(/<[^>]+>/g, ' ').slice(0, 200) + '...';
    }

    return {
      title,
      slug: slugify(title),
      excerpt: excerpt.slice(0, 450),
      content: contentHtml,
      thumbnailUrl: thumbUrl,
      sourceUrl: link,
      source
    };
  } catch (err) {
    console.error(`Scrape article error from ${link}:`, err.message);
    return null;
  }
}

async function crawlAndInsert10BlogPosts() {
  const result = {
    crawledPosts: [],
    skippedPosts: [],
    categoriesCreated: [],
    tagsCreated: [],
    mediaCreated: [],
    totalProcessed: 0
  };

  // 1. Find Admin user for authorId
  let adminUser = await User.findOne({
    $or: [{ email: 'admin1@gmail.com' }, { role: 'admin' }, { role: 'superadmin' }]
  });
  if (!adminUser) {
    adminUser = await User.findOne();
  }
  const authorId = adminUser ? adminUser._id : null;

  // 2. Ensure Folder for Media
  let blogFolder = await Folder.findOne({ slug: 'blog' });
  if (!blogFolder) {
    blogFolder = await Folder.create({
      name: 'Blog',
      slug: 'blog',
      parentId: null,
      position: 1
    });
  }

  // 3. Ensure Predefined Categories in DB
  const categoryCache = {};
  for (const cat of PREDEFINED_CATEGORIES) {
    const doc = await BlogCategory.findOneAndUpdate(
      { slug: cat.slug },
      {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        metaTitle: cat.name,
        metaDescription: cat.description,
        isActive: true
      },
      { upsert: true, new: true }
    );
    categoryCache[cat.slug] = doc;
  }

  // 4. Fetch RSS Feeds
  const feedItems = [];
  for (const feed of FEEDS) {
    try {
      const res = await axios.get(feed.url, { headers: HEADERS, timeout: 10000 });
      const $ = cheerio.load(res.data, { xmlMode: true });

      $('item').each((_, item) => {
        const title = $(item).find('title').text().trim();
        const link = $(item).find('link').text().trim();
        const pubDate = $(item).find('pubDate').text().trim();
        if (title && link) {
          feedItems.push({ title, link, pubDate, source: feed.source });
        }
      });
    } catch (err) {
      console.error(`Feed fetch error (${feed.url}):`, err.message);
    }
  }

  // Deduplicate feed items by link
  const uniqueItems = [];
  const seenLinks = new Set();
  for (const item of feedItems) {
    if (!seenLinks.has(item.link)) {
      seenLinks.add(item.link);
      uniqueItems.push(item);
    }
  }

  // Shuffle slightly or pick diverse sources
  const targetCount = 10;
  const tagCache = {};

  for (let i = 0; i < uniqueItems.length && result.crawledPosts.length < targetCount; i++) {
    const item = uniqueItems[i];
    result.totalProcessed++;

    // Pre-check slug uniqueness
    const initialSlug = slugify(item.title);
    if (!initialSlug) continue;

    const existingBySlug = await BlogPost.findOne({ slug: initialSlug });
    if (existingBySlug) {
      result.skippedPosts.push({ title: item.title, reason: 'Slug already exists in DB' });
      continue;
    }

    // Scrape article
    const article = await scrapeFullArticle(item.link, item.source);
    if (!article || !article.content) {
      continue;
    }

    // Ensure unique slug
    let finalSlug = article.slug;
    let suffix = 0;
    while (await BlogPost.findOne({ slug: suffix === 0 ? finalSlug : `${finalSlug}-${suffix}` })) {
      suffix++;
    }
    finalSlug = suffix === 0 ? finalSlug : `${finalSlug}-${suffix}`;

    // 5. Category resolution & auto-create if missing
    const determinedCat = determineCategory(article.title, article.excerpt);
    let categoryDoc = categoryCache[determinedCat.slug];
    if (!categoryDoc) {
      categoryDoc = await BlogCategory.findOneAndUpdate(
        { slug: determinedCat.slug },
        {
          name: determinedCat.name,
          slug: determinedCat.slug,
          description: determinedCat.description,
          metaTitle: determinedCat.name,
          metaDescription: determinedCat.description,
          isActive: true
        },
        { upsert: true, new: true }
      );
      categoryCache[determinedCat.slug] = categoryDoc;
      result.categoriesCreated.push(determinedCat.name);
    }

    // 6. Tags extraction & auto-create if missing
    const tagNames = extractTagsFromText(article.title, article.content);
    const tagIds = [];
    for (const tagName of tagNames) {
      const tagSlug = slugify(tagName);
      if (!tagCache[tagSlug]) {
        let tDoc = await Tag.findOne({ slug: tagSlug });
        if (!tDoc) {
          tDoc = await Tag.create({
            name: tagName,
            slug: tagSlug,
            description: `Bài viết liên quan đến ${tagName}`,
            isActive: true
          });
          result.tagsCreated.push(tagName);
        }
        tagCache[tagSlug] = tDoc;
      }
      tagIds.push(tagCache[tagSlug]._id);
    }

    // 7. Media document for thumbnail linked to blog folder
    let mediaDoc = null;
    if (article.thumbnailUrl) {
      mediaDoc = await Media.findOne({ url: article.thumbnailUrl });
      if (!mediaDoc) {
        mediaDoc = await Media.create({
          filename: `blog-${finalSlug}.webp`,
          url: article.thumbnailUrl,
          publicId: `blog/crawled/${finalSlug}`,
          folderId: blogFolder._id,
          mimeType: 'image/webp',
          size: 1024 * 180,
          width: 800,
          height: 450,
          altText: article.title,
          caption: article.title,
          uploadedBy: authorId
        });
        result.mediaCreated.push(mediaDoc.url);
      }
    }

    // 8. Calculate reading metrics & Table of Contents
    const plainText = stripHtml(article.content);
    const wordCount = plainText.split(/\s+/).filter(Boolean).length;
    const minRead = Math.max(1, Math.ceil(wordCount / 220));
    const toc = extractToc(article.content);

    // 9. Create BlogPost document
    const newBlogPost = await BlogPost.create({
      title: article.title,
      slug: finalSlug,
      excerpt: article.excerpt,
      content: article.content,
      thumbnailMediaId: mediaDoc ? mediaDoc._id : null,
      thumbnailUrl: mediaDoc ? mediaDoc.url : (article.thumbnailUrl || ''),
      categories: [categoryDoc._id],
      tags: tagIds,
      authorId: authorId,
      metaTitle: article.title.slice(0, 70),
      metaDescription: article.excerpt.slice(0, 160),
      canonicalUrl: article.sourceUrl,
      minRead,
      wordCount,
      tableOfContents: toc,
      status: 'published',
      publishedAt: new Date(Date.now() - (result.crawledPosts.length * 3600000)),
      isActive: true,
      isFeatured: result.crawledPosts.length < 3,
      isPinned: result.crawledPosts.length === 0,
      allowComment: true,
      viewsCount: Math.floor(Math.random() * 450 + 120),
      likesCount: Math.floor(Math.random() * 40 + 8),
      commentsCount: 0
    });

    result.crawledPosts.push({
      id: newBlogPost._id,
      title: newBlogPost.title,
      slug: newBlogPost.slug,
      category: categoryDoc.name,
      tags: tagNames,
      thumbnailUrl: newBlogPost.thumbnailUrl,
      wordCount: newBlogPost.wordCount,
      minRead: newBlogPost.minRead,
      tocCount: toc.length
    });
  }

  // 10. Update post counts on Categories & Tags
  const allCategories = await BlogCategory.find({});
  for (const cat of allCategories) {
    const count = await BlogPost.countDocuments({ categories: cat._id, status: 'published' });
    await BlogCategory.findByIdAndUpdate(cat._id, { postCount: count });
  }

  const allTags = await Tag.find({});
  for (const tag of allTags) {
    const count = await BlogPost.countDocuments({ tags: tag._id, status: 'published' });
    await Tag.findByIdAndUpdate(tag._id, { postCount: count });
  }

  return result;
}

module.exports = {
  crawlAndInsert10BlogPosts
};
