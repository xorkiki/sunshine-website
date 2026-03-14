import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';

const client = createClient({
  projectId: 'yy21gxjr',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

// ── Normalise filename to a group key ──────────────────────
function groupKey(filename) {
  return filename
    .replace(/\.(jpg|jpeg|png|webp)$/i, '')
    .replace(/_edited/gi, '')
    .replace(/ 2 \d*$/, '')
    .replace(/_\d+$/, '')
    .replace(/\s+2$/, '')
    .replace(/[_\s]*(photo\s*[+&]\s*)?styled\s+by\s+sunzhique/gi, '')
    .replace(/[_\s]*photo\s*[+&]\s*styled\s+by\s+sunzhique/gi, '')
    .replace(/[_\s]*by\s+sunzhique/gi, '')
    .replace(/[_\s]*&\s*sunzhique/gi, '')
    .replace(/[_\s]*and\s+sunzhique/gi, '')
    .replace(/[_\s]*castin[g]?\s*[&]?\s*styling/gi, '')
    .replace(/[_\s]*casting\s*[&]?\s*styling/gi, '')
    .replace(/[_\s]*shot\s+by\s+\w+/gi, '')
    .replace(/[_\s]*by\s+(jeantoir|jivi|joaquin|anastasiia|jay|col|michele\s*pena|geray\s*mena|nuno\s*xico)/gi, '')
    .replace(/[_\s]*with\s+jivi/gi, '')
    .replace(/[_\s]*photo\s*[+&]/gi, '')
    .replace(/\s*(directed|shot)\s+by\s+\w+/gi, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function toTitle(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 96);
}

// ── Group files by project ─────────────────────────────────
function groupFiles(folderPath) {
  const files = fs.readdirSync(folderPath)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

  const groups = {};
  for (const file of files) {
    const key = groupKey(file) || 'untitled';
    if (!groups[key]) groups[key] = [];
    groups[key].push(file);
  }
  return groups;
}

// ── Retry helper ───────────────────────────────────────────
async function withRetry(fn, label, retries = 4) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i < retries - 1) {
        const wait = 2000 * (i + 1);
        console.log(`\n  ⚠ Error on ${label}, retrying in ${wait/1000}s... (${err.message?.slice(0, 60)})`);
        await new Promise(r => setTimeout(r, wait));
      } else {
        throw err;
      }
    }
  }
}

// ── Upload one image asset ─────────────────────────────────
async function uploadAsset(filePath) {
  try {
    return await withRetry(async () => {
      const stream = fs.createReadStream(filePath);
      const asset = await client.assets.upload('image', stream, {
        filename: path.basename(filePath),
      });
      return asset._id;
    }, path.basename(filePath));
  } catch (err) {
    // Skip corrupted/unreadable files
    console.log(`\n  ✗ Skipping corrupt file: ${path.basename(filePath)} (${err.message?.slice(0, 80)})`);
    return null;
  }
}

// ── Create one portfolio item ──────────────────────────────
async function createItem(title, category, coverAssetId, imageAssetIds) {
  const slug = toSlug(title);
  await client.create({
    _type: 'portfolioItem',
    title,
    category: [category],
    slug: { _type: 'slug', current: slug },
    coverImage: {
      _type: 'image',
      asset: { _type: 'reference', _ref: coverAssetId },
    },
    images: imageAssetIds.map((id, i) => ({
      _type: 'image',
      _key: `img-${i}-${id.slice(-6)}`,
      asset: { _type: 'reference', _ref: id },
    })),
  });
}

// ── Main ───────────────────────────────────────────────────
async function run() {
  const folders = [
    { path: '/Users/kiki/Desktop/sunshine-wix-media/sunzhique-website/Styling', category: 'styling' },
    { path: '/Users/kiki/Desktop/sunshine-wix-media/sunzhique-website/Photography', category: 'photography' },
  ];

  // Fetch slugs of already-created items to skip duplicates
  const existing = await client.fetch(`*[_type == "portfolioItem"]{ "slug": slug.current }`);
  const existingSlugs = new Set(existing.map(e => e.slug));
  if (existingSlugs.size > 0) {
    console.log(`Skipping ${existingSlugs.size} already-uploaded items.`);
  }

  for (const { path: folderPath, category } of folders) {
    console.log(`\n── ${category.toUpperCase()} ─────────────────`);
    const groups = groupFiles(folderPath);
    console.log(`Found ${Object.keys(groups).length} projects from ${Object.values(groups).flat().length} files\n`);

    for (const [key, files] of Object.entries(groups)) {
      const title = toTitle(key);
      const slug = toSlug(title);

      if (existingSlugs.has(slug)) {
        console.log(`  ↷ Skipping (exists): ${title}`);
        continue;
      }

      console.log(`Uploading: "${title}" (${files.length} image${files.length > 1 ? 's' : ''})`);

      const assetIds = [];
      for (const file of files) {
        const assetId = await uploadAsset(path.join(folderPath, file));
        if (assetId) {
          assetIds.push(assetId);
          process.stdout.write('  .');
        }
      }
      console.log('');

      if (assetIds.length === 0) {
        console.log(`  ✗ Skipped (no valid images): ${title}`);
        continue;
      }

      await withRetry(() => createItem(title, category, assetIds[0], assetIds), `create ${title}`);
      console.log(`  ✓ Created: ${title}`);
    }
  }

  console.log('\n✅ All done!');
}

run().catch(err => { console.error(err); process.exit(1); });
