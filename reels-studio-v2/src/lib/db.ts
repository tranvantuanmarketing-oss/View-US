import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) return dbInstance;

  const dbDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, "reels_studio.db");
  const db = new Database(dbPath);

  // WAL mode for high concurrency & atomic transactions
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");

  initSchema(db);
  seedAssetLibrary(db);

  dbInstance = db;
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      web_domain TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS websites (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      domain TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      status TEXT NOT NULL, -- pending, approved, rejected
      secret_key TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      display_name TEXT,
      locale TEXT NOT NULL,
      owner_staff_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (owner_staff_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS page_settings (
      page_id TEXT PRIMARY KEY,
      templates_json TEXT NOT NULL,
      avatar_ids_json TEXT NOT NULL,
      music_mood TEXT NOT NULL,
      selected_track_ids_json TEXT NOT NULL,
      background_categories_json TEXT NOT NULL,
      overrides_json TEXT NOT NULL,
      version INTEGER DEFAULT 1,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      author TEXT NOT NULL,
      page TEXT NOT NULL,
      locale TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      highlights_json TEXT NOT NULL,
      cta TEXT NOT NULL,
      caption TEXT NOT NULL,
      comment1 TEXT NOT NULL,
      status TEXT NOT NULL, -- draft, ready, reserved, used, archived
      reserved_by_batch_id TEXT,
      used_by_page_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS batches (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      page_id TEXT NOT NULL,
      staff_id TEXT NOT NULL,
      mode TEXT NOT NULL, -- single, random, custom_per_video, json
      status TEXT NOT NULL, -- queued, running, completed, partial_failed, failed, cancelled
      count INTEGER NOT NULL,
      done_count INTEGER DEFAULT 0,
      failed_count INTEGER DEFAULT 0,
      settings_snapshot_json TEXT NOT NULL,
      target_helper_id TEXT,
      created_at TEXT NOT NULL,
      finished_at TEXT,
      FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
      FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS batch_items (
      id TEXT PRIMARY KEY,
      batch_id TEXT NOT NULL,
      seq INTEGER NOT NULL,
      card_id TEXT,
      template_id TEXT NOT NULL,
      palette_id TEXT NOT NULL,
      avatar_id TEXT,
      track_id TEXT,
      background_video_url TEXT,
      story_payload_json TEXT NOT NULL,
      status TEXT NOT NULL, -- pending, leased, rendering, completed, failed
      output_path TEXT,
      output_video_url TEXT,
      error TEXT,
      lease_token TEXT,
      leased_at TEXT,
      lease_expires_at TEXT,
      created_at TEXT NOT NULL,
      finished_at TEXT,
      FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS helpers (
      id TEXT PRIMARY KEY,
      staff_id TEXT NOT NULL,
      name TEXT NOT NULL,
      key_hash TEXT NOT NULL,
      os TEXT NOT NULL,
      version TEXT NOT NULL,
      concurrency INTEGER DEFAULT 2,
      cache_mb INTEGER DEFAULT 0,
      last_seen_at TEXT,
      revoked INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS avatars (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      image_path TEXT NOT NULL,
      gender TEXT NOT NULL,
      age_min INTEGER NOT NULL,
      age_max INTEGER NOT NULL,
      used_by_page_ids_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS music_tracks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      file_path TEXT NOT NULL,
      mood TEXT NOT NULL,
      duration_sec INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS monitored_pages (
      id TEXT PRIMARY KEY,
      page_name TEXT NOT NULL,
      page_avatar TEXT,
      followers INTEGER DEFAULT 0,
      delta_7d INTEGER,
      posts_today INTEGER DEFAULT 0,
      posts_7d INTEGER DEFAULT 0,
      comments_7d INTEGER DEFAULT 0,
      total_posts INTEGER DEFAULT 0,
      target_domain TEXT,
      ads_status TEXT, -- active, inactive, unknown
      last_scanned_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS viral_posts (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      page_name TEXT NOT NULL,
      page_followers INTEGER DEFAULT 0,
      locale TEXT NOT NULL,
      post_type TEXT NOT NULL, -- anh, bai-viet, video
      published_at TEXT NOT NULL,
      comments_count INTEGER DEFAULT 0,
      reactions_count INTEGER DEFAULT 0,
      shares_count INTEGER DEFAULT 0,
      caption TEXT NOT NULL,
      image_url TEXT,
      post_url TEXT NOT NULL,
      has_website_link INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS writing_jobs (
      id TEXT PRIMARY KEY,
      source_post_id TEXT,
      target_locale TEXT NOT NULL,
      status TEXT NOT NULL, -- pending, writing, completed, failed
      attempt_count INTEGER DEFAULT 0,
      max_attempts INTEGER DEFAULT 3,
      card_id TEXT,
      error TEXT,
      created_at TEXT NOT NULL,
      finished_at TEXT
    );

    CREATE TABLE IF NOT EXISTS telegram_outbox (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      status TEXT NOT NULL, -- pending, delivered, failed
      attempts INTEGER DEFAULT 0,
      max_attempts INTEGER DEFAULT 5,
      next_attempt_at TEXT,
      message_id INTEGER,
      error TEXT,
      created_at TEXT NOT NULL,
      delivered_at TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT,
      details_json TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Page-owned avatar uploads; legacy library records remain available to existing selections.
  if (!(db.prepare("PRAGMA table_info(avatars)").all() as any[]).some(c => c.name === "owner_page_id")) db.exec("ALTER TABLE avatars ADD COLUMN owner_page_id TEXT");

  db.transaction(() => {
    for (const setting of db.prepare('SELECT page_id,avatar_ids_json FROM page_settings').all() as any[]) {
      if (setting.page_id === "free") continue;
      let changed = false;
      const ids = (JSON.parse(setting.avatar_ids_json || '[]') as string[]).map(id => {
        const avatar = db.prepare('SELECT * FROM avatars WHERE id=?').get(id) as any;
        if (!avatar || avatar.owner_page_id) return id;
        const copyId = `${id}__page_${setting.page_id}`;
        db.prepare(`INSERT OR IGNORE INTO avatars (id,name,image_path,gender,age_min,age_max,used_by_page_ids_json,created_at,owner_page_id) VALUES (?,?,?,?,?,?,?,?,?)`).run(copyId,avatar.name,avatar.image_path,avatar.gender,avatar.age_min,avatar.age_max,JSON.stringify([setting.page_id]),new Date().toISOString(),setting.page_id);
        changed = true; return copyId;
      });
      if (changed) db.prepare('UPDATE page_settings SET avatar_ids_json=? WHERE page_id=?').run(JSON.stringify(ids),setting.page_id);
    }
  })();

  // Migrations & single-user owner initialization
  for (const column of ["progress INTEGER DEFAULT 0", "render_started_at TEXT", "lease_helper_id TEXT"]) {
    const name = column.split(" ")[0];
    const existing = db.prepare("PRAGMA table_info(batch_items)").all() as any[];
    if (!existing.some(c => c.name === name)) db.exec(`ALTER TABLE batch_items ADD COLUMN ${column}`);
  }
  try { db.exec("ALTER TABLE batch_items ADD COLUMN duration INTEGER DEFAULT 10"); } catch (e) {}
  try { db.exec("ALTER TABLE batch_items ADD COLUMN resolution TEXT DEFAULT '720x1280'"); } catch (e) {}
  try {
    db.prepare(`
      INSERT OR IGNORE INTO users (id, name, email, role, web_domain, created_at)
      VALUES ('owner', 'Chủ hệ thống', 'owner@local', 'admin', 'local', datetime('now'))
    `).run();
  } catch (e) {}
  try {
    db.prepare(`
      INSERT OR IGNORE INTO pages (id, name, display_name, locale, owner_staff_id, created_at, updated_at)
      VALUES ('free', 'Lô tự do', 'The Story', 'en', 'owner', datetime('now'), datetime('now'))
    `).run();
  } catch (e) {}
}

function seedAssetLibrary(db: Database.Database) {
  for(const [table,file] of [["avatars","initialAvatars.json"],["music_tracks","initialTracks.json"]]) {
    if((db.prepare(`SELECT COUNT(*) n FROM ${table}`).get() as any).n) continue;
    const source=path.join(process.cwd(),"src/data",file);
    if(!fs.existsSync(source)) continue;
    const items=JSON.parse(fs.readFileSync(source,"utf8"));
    db.transaction(()=>{for(const item of items) {
      if(table==="avatars") db.prepare("INSERT OR IGNORE INTO avatars (id,name,image_path,gender,age_min,age_max,used_by_page_ids_json,created_at) VALUES (?,?,?,?,?,?,?,?)").run(item.id,item.name,item.image_path,item.gender || "nu",item.age_min || 18,item.age_max || 99,"[]",new Date().toISOString());
      else db.prepare("INSERT OR IGNORE INTO music_tracks (id,title,file_path,mood,duration_sec,created_at) VALUES (?,?,?,?,?,?)").run(item.id,item.title,item.file_path,item.mood,item.duration_sec || 0,new Date().toISOString());
    }})();
  }
}

function seedIfEmpty(db: Database.Database) {
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (userCount.count > 0) return;

  // Read existing store.json if available
  const storePath = path.join(process.cwd(), "src", "data", "store.json");
  if (!fs.existsSync(storePath)) return;

  try {
    const raw = fs.readFileSync(storePath, "utf-8");
    const store = JSON.parse(raw);

    const insertUser = db.prepare(`
      INSERT OR REPLACE INTO users (id, name, email, role, web_domain, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertPage = db.prepare(`
      INSERT OR REPLACE INTO pages (id, name, display_name, locale, owner_staff_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertSettings = db.prepare(`
      INSERT OR REPLACE INTO page_settings (page_id, templates_json, avatar_ids_json, music_mood, selected_track_ids_json, background_categories_json, overrides_json, version, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);

    const insertAvatar = db.prepare(`
      INSERT OR REPLACE INTO avatars (id, name, image_path, gender, age_min, age_max, used_by_page_ids_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertTrack = db.prepare(`
      INSERT OR REPLACE INTO music_tracks (id, title, file_path, mood, duration_sec, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertHelper = db.prepare(`
      INSERT OR REPLACE INTO helpers (id, staff_id, name, key_hash, os, version, concurrency, cache_mb, last_seen_at, revoked, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMonitoredPage = db.prepare(`
      INSERT OR REPLACE INTO monitored_pages (id, page_name, page_avatar, followers, delta_7d, posts_today, posts_7d, comments_7d, total_posts, target_domain, ads_status, last_scanned_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertViralPost = db.prepare(`
      INSERT OR REPLACE INTO viral_posts (id, source, page_name, page_followers, locale, post_type, published_at, comments_count, reactions_count, shares_count, caption, image_url, post_url, has_website_link, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertWebsite = db.prepare(`
      INSERT OR REPLACE INTO websites (id, name, domain, slug, owner_id, status, secret_key, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertCard = db.prepare(`
      INSERT OR REPLACE INTO cards (id, author, page, locale, title, content, highlights_json, cta, caption, comment1, status, reserved_by_batch_id, used_by_page_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const runSeed = db.transaction(() => {
      // 1. Users
      if (Array.isArray(store.staff)) {
        for (const s of store.staff) {
          insertUser.run(s.id, s.name, s.email, s.role, s.web_domain, s.created_at || new Date().toISOString());
        }
      }

      // 2. Websites
      insertWebsite.run("web_01", "Best Novel US", "bestnovel.danhngon.pro", "best-novel-us", "staff_01", "approved", "sec_live_novel_8829", new Date().toISOString());
      insertWebsite.run("web_02", "Love & History Network", "lovehistory.pro", "love-history", "staff_02", "approved", "sec_live_love_7712", new Date().toISOString());
      insertWebsite.run("web_03", "Daily Mystery Stories", "dailymystery.com", "daily-mystery", "staff_01", "pending", null, new Date().toISOString());

      // 3. Pages
      if (Array.isArray(store.pages)) {
        for (const p of store.pages) {
          const now = new Date().toISOString();
          insertPage.run(
            p.id,
            p.name,
            p.display_name || p.name,
            p.locale || "fr",
            p.owner_staff_id || "staff_01",
            p.created_at || now,
            p.settings?.updated_at || now
          );

          if (p.settings) {
            insertSettings.run(
              p.id,
              JSON.stringify(p.settings.templates || []),
              JSON.stringify(p.settings.avatar_ids || []),
              p.settings.music_mood || "nhe-nhang",
              JSON.stringify(p.settings.selected_track_ids || []),
              JSON.stringify(p.settings.background_categories || ["hoa", "rung"]),
              JSON.stringify(p.settings.overrides || {}),
              p.settings.updated_at || now
            );
          }
        }
      }

      // Add US preset page if not present
      const hasUs = store.pages?.some((p: any) => p.locale === "en" || p.id === "page_us_01");
      if (!hasUs) {
        const now = new Date().toISOString();
        insertPage.run("page_us_01", "Daily American Confessions", "Daily Confessions US", "en", "staff_01", now, now);
        insertSettings.run(
          "page_us_01",
          JSON.stringify([
            { template_id: "the-vet-cam-dao", palette_ids: ["dao", "mo", "hong-dat"] },
            { template_id: "the-trang-hong", palette_ids: ["p1", "p2", "p3"] }
          ]),
          JSON.stringify(["av_01", "av_02", "av_03", "av_04", "av_05"]),
          "tram",
          JSON.stringify(["track_01", "track_03"]),
          JSON.stringify(["rung", "troi"]),
          JSON.stringify({}),
          now
        );
      }

      // 4. Avatars
      if (Array.isArray(store.avatars)) {
        for (const a of store.avatars) {
          insertAvatar.run(
            a.id,
            a.name,
            a.image_path,
            a.gender || "nu",
            a.age_min || 20,
            a.age_max || 50,
            JSON.stringify(a.used_by_page_ids || []),
            a.created_at || new Date().toISOString()
          );
        }
      }

      // 5. Music Tracks
      if (Array.isArray(store.music_tracks)) {
        for (const t of store.music_tracks) {
          insertTrack.run(
            t.id,
            t.title,
            t.file_path,
            t.mood || "nhe-nhang",
            t.duration_sec || 35,
            t.created_at || new Date().toISOString()
          );
        }
      }

      // 6. Helpers
      if (Array.isArray(store.helpers) && store.helpers.length > 0) {
        for (const h of store.helpers) {
          insertHelper.run(
            h.id,
            h.staff_id || "staff_01",
            h.name,
            h.key_hash || "hash_T75Q",
            h.os || "mac-arm64",
            h.version || "v0.5.0",
            h.concurrency || 4,
            h.cache_mb || 193,
            h.last_seen_at || new Date().toISOString(),
            h.revoked ? 1 : 0,
            h.created_at || new Date().toISOString()
          );
        }
      } else {
        insertHelper.run(
          "helper_phanha_mac",
          "staff_01",
          "Phan Ha",
          "hash_T75Q",
          "mac-arm64",
          "v0.5.0",
          4,
          193,
          new Date().toISOString(),
          0,
          new Date().toISOString()
        );
      }

      // 7. Monitored Pages (Fanpage Radar - F03)
      insertMonitoredPage.run(
        "rad_01",
        "Daily Quotes",
        "/assets/avatars/av_01.jpg",
        1000000,
        14200,
        5,
        38,
        18500,
        1240,
        "bestnovel.danhngon.pro",
        "active",
        new Date().toISOString(),
        new Date().toISOString()
      );
      insertMonitoredPage.run(
        "rad_02",
        "Deep Family Stories",
        "/assets/avatars/av_02.jpg",
        450000,
        8900,
        3,
        22,
        9600,
        830,
        "lovehistory.pro",
        "active",
        new Date().toISOString(),
        new Date().toISOString()
      );
      insertMonitoredPage.run(
        "rad_03",
        "Hidden Secrets & Truths",
        "/assets/avatars/av_03.jpg",
        12000,
        -150,
        1,
        7,
        2400,
        140,
        "dailymystery.com",
        "unknown",
        new Date().toISOString(),
        new Date().toISOString()
      );
      insertMonitoredPage.run(
        "rad_04",
        "Vérités d'Hier Official",
        "/assets/avatars/av_04.jpg",
        85000,
        3400,
        4,
        28,
        5400,
        410,
        "verites-dhier.fr",
        "inactive",
        new Date().toISOString(),
        new Date().toISOString()
      );

      // 8. Viral Posts (Kho Viral - F05)
      insertViralPost.run(
        "viral_01",
        "Daily Quotes",
        "Daily Quotes",
        1000000,
        "en",
        "anh",
        new Date(Date.now() - 3600000 * 2).toISOString(),
        264,
        1240,
        312,
        "Seven months after our divorce, I stormed into St. Jude's Children's Hospital and demanded to know why my ex-husband had listed our 6-year-old daughter under a false clinical trial. When the head physician pulled up the sealed court documentation signed by my father before his passing, my blood ran cold. The trial wasn't for experimental leukemia therapy — it was the only legal clause preventing Greg from liquidating our family trust fund...\n\nRead the continuation in the first comment 👇\n#storytime #familydrama #confession",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80",
        "https://facebook.com/dailyquotes/posts/101",
        1,
        new Date().toISOString()
      );

      insertViralPost.run(
        "viral_02",
        "Glory Days Confessions",
        "Glory Days Confessions",
        420000,
        "en",
        "bai-viet",
        new Date(Date.now() - 3600000 * 5).toISOString(),
        185,
        920,
        144,
        "At 77, I found a brass key taped underneath my late husband's mahogany desk drawer, labelled 'Do Not Open Until Probate'. Inside the local safety deposit box was an unregistered birth certificate bearing my maiden name and a photograph of a baby boy taken in Munich in 1968. I have never been to Germany in my life...\n\nFull story ادامه in comment 👇",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
        "https://facebook.com/glorydays/posts/102",
        0,
        new Date().toISOString()
      );

      insertViralPost.run(
        "viral_03",
        "Vérités d'Hier",
        "Vérités d'Hier",
        85000,
        "fr",
        "anh",
        new Date(Date.now() - 3600000 * 8).toISOString(),
        312,
        1430,
        289,
        "J'ai adopté seul la petite fille que vingt familles avaient refusée. Son diagnostic faisait reculer tout le monde. « Vous avez le temps de changer d'avis », m'a glissé l'assistante sociale ce matin pluvieux de novembre. Aujourd'hui, 14 ans plus tard, le coup de fil du procureur vient de tout faire voler en éclats...\n\nLa suite est épinglée en premier commentaire 👇",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
        "https://facebook.com/veritesdhier/posts/103",
        1,
        new Date().toISOString()
      );

      // 9. Initial Story Cards (Kho Thẻ - F10)
      insertCard.run(
        "card_us_01",
        "Emily Vance",
        "Daily American Confessions",
        "en",
        "The Sealed Trust Fund",
        "Seven months after our divorce, I stormed into St. Jude's Children's Hospital and demanded to know why my ex-husband had listed our 6-year-old daughter under a false clinical trial.\n\nWhen the head physician pulled up the sealed court documentation signed by my father before his passing, my blood ran cold.\n\nThe trial wasn't for experimental leukemia therapy — it was the only legal clause preventing Greg from liquidating our family trust fund.\n\nHe thought I would never find the sealed appendix.",
        JSON.stringify(["my blood ran cold", "preventing Greg from liquidating", "sealed appendix"]),
        "Read The Rest In Comments 👇",
        "Seven months after our divorce, I stormed into St. Jude's Hospital... The truth about our family trust fund will leave you speechless! #familydrama #storytime #drama",
        "Part 2: The confrontation in the hospital boardroom with Greg's attorney was caught on hospital security cameras. The judge granted full custody within 48 hours.",
        "ready",
        null,
        null,
        new Date().toISOString(),
        new Date().toISOString()
      );

      insertCard.run(
        "card_fr_01",
        "Franck Meynard",
        "Vérités d'Hier",
        "fr",
        "L'adoption silencieuse",
        "J'ai adopté seul la petite que vingt familles avaient refusée.\n\nSon diagnostic faisait reculer tout le monde.\n\n« Vous avez le temps de changer d'avis », m'a dit l'assistante sociale.\n\nMais quand elle a serré mon petit doigt, j'ai su que c'était ma fille.\n\nQuatorze ans plus tard, une lettre anonyme a tout fait basculer.",
        JSON.stringify(["vingt familles avaient refusée", "serré mon petit doigt", "lettre anonyme"]),
        "Continuer la lecture dans les commentaires 👇",
        "J'ai adopté seul la petite que vingt familles avaient refusée... 14 ans plus tard, une lettre anonyme bouleverse notre existence.",
        "Épisode 2 : L'expéditeur de la lettre n'était autre que le médecin chef qui avait falsifié le dossier médical en 2012 pour la protéger de son grand-père biologique.",
        "ready",
        null,
        null,
        new Date().toISOString(),
        new Date().toISOString()
      );

      insertCard.run(
        "card_nl_01",
        "Bram Van Dijk",
        "Gebroken Stilte",
        "nl",
        "Het Laatste Testament",
        "Mijn vader onterfde mijn oudere broer op zijn sterfbed.\n\nIedereen dacht dat het om geld ging.\n\nMaar in de verzegelde kluis lag alleen een politiedossier uit 1994.\n\nToen ik de eerste pagina las, begreep ik waarom mijn broer nooit meer naar huis kwam.",
        JSON.stringify(["onterfde mijn oudere broer", "politiedossier uit 1994", "nooit meer naar huis"]),
        "Lees het vervolg in de reacties 👇",
        "Mijn vader onterfde mijn oudere broer op zijn sterfbed... Wat er in de kluis lag veranderde onze familie voor altijd.",
        "Deel 2: Het dossier bevatte het officiële bewijs dat mijn broer 30 jaar lang de schuld op zich had genomen voor een misdrijf dat mijn vader zelf had begaan.",
        "ready",
        null,
        null,
        new Date().toISOString(),
        new Date().toISOString()
      );
    });

    runSeed();
    console.log("✅ Database initialized and migrated successfully to data/reels_studio.db");
  } catch (err) {
    console.error("❌ Error migrating store.json to SQLite:", err);
  }
}

/**
 * Preview counts of seeded sample demo records
 */
export function getDemoDataCounts(): {
  pages: number;
  websites: number;
  cards: number;
  monitoredPages: number;
  viralPosts: number;
  total: number;
} {
  const db = getDb();
  const demoPageIds = ['page_fr_01', 'page_fr_02', 'page_nl_01', 'page_nl_02', 'page_us_01'];
  const demoWebIds = ['web_01', 'web_02', 'web_03'];
  const demoCardIds = ['card_us_01', 'card_fr_01', 'card_nl_01'];

  const pagesCount = db.prepare(`SELECT COUNT(*) as count FROM pages WHERE id IN (${demoPageIds.map(() => '?').join(',')})`).get(...demoPageIds) as { count: number };
  const webCount = db.prepare(`SELECT COUNT(*) as count FROM websites WHERE id IN (${demoWebIds.map(() => '?').join(',')})`).get(...demoWebIds) as { count: number };
  const cardCount = db.prepare(`SELECT COUNT(*) as count FROM cards WHERE id IN (${demoCardIds.map(() => '?').join(',')})`).get(...demoCardIds) as { count: number };
  const monCount = db.prepare(`SELECT COUNT(*) as count FROM monitored_pages WHERE id LIKE 'mon_%'`).get() as { count: number };
  const viralCount = db.prepare(`SELECT COUNT(*) as count FROM viral_posts WHERE id LIKE 'viral_%'`).get() as { count: number };

  const total = pagesCount.count + webCount.count + cardCount.count + monCount.count + viralCount.count;
  return {
    pages: pagesCount.count,
    websites: webCount.count,
    cards: cardCount.count,
    monitoredPages: monCount.count,
    viralPosts: viralCount.count,
    total,
  };
}

/**
 * Safely purge demo seed data while preserving user batches, assets and owner profile
 */
export function purgeDemoData(): { success: boolean; deletedCount: number } {
  const db = getDb();
  const demoPageIds = ['page_fr_01', 'page_fr_02', 'page_nl_01', 'page_nl_02', 'page_us_01'];
  const demoWebIds = ['web_01', 'web_02', 'web_03'];
  const demoCardIds = ['card_us_01', 'card_fr_01', 'card_nl_01'];

  let deleted = 0;
  const tx = db.transaction(() => {
    // Only delete pages that don't have active batches
    for (const pId of demoPageIds) {
      const activeBatches = db.prepare("SELECT COUNT(*) as c FROM batches WHERE page_id = ?").get(pId) as { c: number };
      if (activeBatches.c === 0) {
        db.prepare("DELETE FROM page_settings WHERE page_id = ?").run(pId);
        const res = db.prepare("DELETE FROM pages WHERE id = ?").run(pId);
        deleted += res.changes;
      }
    }

    for (const wId of demoWebIds) {
      const res = db.prepare("DELETE FROM websites WHERE id = ?").run(wId);
      deleted += res.changes;
    }

    for (const cId of demoCardIds) {
      const res = db.prepare("DELETE FROM cards WHERE id = ?").run(cId);
      deleted += res.changes;
    }

    const mRes = db.prepare("DELETE FROM monitored_pages WHERE id LIKE 'mon_%'").run();
    deleted += mRes.changes;

    const vRes = db.prepare("DELETE FROM viral_posts WHERE id LIKE 'viral_%'").run();
    deleted += vRes.changes;
  });

  tx();
  return { success: true, deletedCount: deleted };
}
