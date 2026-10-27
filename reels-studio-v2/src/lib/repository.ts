import { getDb } from "./db";
import templatesData from "../data/templates.json";
import {
  Staff,
  Page,
  PageSettings,
  Template,
  Avatar,
  MusicTrack,
  Card,
  Batch,
  BatchItem,
  HelperMachine,
  ViralPost,
} from "./types";

const staticTemplates: Template[] = templatesData as unknown as Template[];

export const repository = {
  staff: {
    list: async (): Promise<Staff[]> => {
      const db = getDb();
      return db.prepare("SELECT * FROM users ORDER BY created_at ASC").all() as Staff[];
    },
    get: async (id: string): Promise<Staff | null> => {
      const db = getDb();
      return (db.prepare("SELECT * FROM users WHERE id = ?").get(id) as Staff) || null;
    },
  },

  pages: {
    list: async (staffId?: string): Promise<Page[]> => {
      const db = getDb();
      let rows: any[];
      if (staffId) {
        rows = db.prepare("SELECT * FROM pages WHERE id != 'free' AND owner_staff_id = ? ORDER BY created_at DESC").all(staffId);
      } else {
        rows = db.prepare("SELECT * FROM pages WHERE id != 'free' ORDER BY created_at DESC").all();
      }

      return rows.map((p) => {
        const sRow = db.prepare("SELECT * FROM page_settings WHERE page_id = ?").get(p.id) as any;
        const settings: PageSettings = sRow
          ? {
              templates: JSON.parse(sRow.templates_json || "[]"),
              avatar_ids: JSON.parse(sRow.avatar_ids_json || "[]"),
              music_mood: sRow.music_mood || "nhe-nhang",
              selected_track_ids: JSON.parse(sRow.selected_track_ids_json || "[]"),
              background_categories: JSON.parse(sRow.background_categories_json || "[]"),
              overrides: JSON.parse(sRow.overrides_json || "{}"),
              updated_at: sRow.updated_at,
            }
          : {
              templates: [],
              avatar_ids: [],
              music_mood: "nhe-nhang",
              selected_track_ids: [],
              background_categories: ["hoa", "rung"],
              overrides: {},
            };

        return {
          id: p.id,
          name: p.name,
          display_name: p.display_name,
          locale: p.locale,
          owner_staff_id: p.owner_staff_id,
          created_at: p.created_at,
          settings,
        };
      });
    },

    get: async (id: string): Promise<Page | null> => {
      const db = getDb();
      const p = db.prepare("SELECT * FROM pages WHERE id = ?").get(id) as any;
      if (!p) return null;

      const sRow = db.prepare("SELECT * FROM page_settings WHERE page_id = ?").get(p.id) as any;
      const settings: PageSettings = sRow
        ? {
            templates: JSON.parse(sRow.templates_json || "[]"),
            avatar_ids: JSON.parse(sRow.avatar_ids_json || "[]"),
            music_mood: sRow.music_mood || "nhe-nhang",
            selected_track_ids: JSON.parse(sRow.selected_track_ids_json || "[]"),
            background_categories: JSON.parse(sRow.background_categories_json || "[]"),
            overrides: JSON.parse(sRow.overrides_json || "{}"),
            updated_at: sRow.updated_at,
          }
        : {
            templates: [],
            avatar_ids: [],
            music_mood: "nhe-nhang",
            selected_track_ids: [],
            background_categories: ["hoa", "rung"],
            overrides: {},
          };

      return {
        id: p.id,
        name: p.name,
        display_name: p.display_name,
        locale: p.locale,
        owner_staff_id: p.owner_staff_id,
        created_at: p.created_at,
        settings,
      };
    },

    create: async (data: {
      id?: string;
      name: string;
      display_name?: string;
      locale: string;
      owner_staff_id: string;
      settings?: Partial<PageSettings>;
    }): Promise<Page> => {
      const db = getDb();
      const pageId = data.id || `page_${Date.now()}`;
      const now = new Date().toISOString();

      const insertPage = db.prepare(`
        INSERT INTO pages (id, name, display_name, locale, owner_staff_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const insertSettings = db.prepare(`
        INSERT INTO page_settings (page_id, templates_json, avatar_ids_json, music_mood, selected_track_ids_json, background_categories_json, overrides_json, version, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
      `);

      const defaultTemplates = staticTemplates.slice(0, 3).map((t) => ({
        template_id: t.id,
        palette_ids: t.pals.map((p) => p.id),
      }));

      const defaultAvatars = (db.prepare("SELECT id FROM avatars LIMIT 20").all() as any[]).map((a) => a.id);
      const defaultTracks = (db.prepare("SELECT id FROM music_tracks LIMIT 2").all() as any[]).map((t) => t.id);

      db.transaction(() => {
        insertPage.run(pageId, data.name, data.display_name || data.name, data.locale, data.owner_staff_id, now, now);
        insertSettings.run(
          pageId,
          JSON.stringify(data.settings?.templates || defaultTemplates),
          JSON.stringify(data.settings?.avatar_ids || defaultAvatars),
          data.settings?.music_mood || "nhe-nhang",
          JSON.stringify(data.settings?.selected_track_ids || defaultTracks),
          JSON.stringify(data.settings?.background_categories || ["hoa", "rung"]),
          JSON.stringify(data.settings?.overrides || {}),
          now
        );
      })();

      return (await repository.pages.get(pageId))!;
    },

    update: async (
      id: string,
      data: { name?: string; display_name?: string; locale?: string; owner_staff_id?: string }
    ): Promise<Page | null> => {
      const db = getDb();
      const sets: string[] = [];
      const vals: any[] = [];

      if (data.name !== undefined) {
        sets.push("name = ?");
        vals.push(data.name);
      }
      if (data.display_name !== undefined) {
        sets.push("display_name = ?");
        vals.push(data.display_name);
      }
      if (data.locale !== undefined) {
        sets.push("locale = ?");
        vals.push(data.locale);
      }
      if (data.owner_staff_id !== undefined) {
        sets.push("owner_staff_id = ?");
        vals.push(data.owner_staff_id);
      }

      if (sets.length > 0) {
        sets.push("updated_at = ?");
        vals.push(new Date().toISOString());
        vals.push(id);
        db.prepare(`UPDATE pages SET ${sets.join(", ")} WHERE id = ?`).run(...vals);
      }

      return repository.pages.get(id);
    },

    delete: async (id: string): Promise<boolean> => {
      const db = getDb();
      if (id === "free") throw new Error("Không thể xóa cấu hình lô tự do.");
      const used=db.prepare("SELECT COUNT(*) count FROM batches WHERE page_id=?").get(id) as any;
      if(used.count) throw new Error("Page có lịch sử lô video. Giữ page để bảo toàn lịch sử; xóa các lô trước khi xóa page.");
      const res = db.prepare("DELETE FROM pages WHERE id = ?").run(id);
      return res.changes > 0;
    },
  },

  pageSettings: {
    get: async (pageId: string): Promise<PageSettings | null> => {
      const p = await repository.pages.get(pageId);
      return p ? p.settings : null;
    },

    update: async (pageId: string, settings: Partial<PageSettings>): Promise<PageSettings | null> => {
      const db = getDb();
      const current = await repository.pageSettings.get(pageId);
      if (!current) return null;

      const merged: PageSettings = {
        ...current,
        ...settings,
        updated_at: new Date().toISOString(),
      };

      db.prepare(`
        INSERT INTO page_settings (page_id, templates_json, avatar_ids_json, music_mood, selected_track_ids_json, background_categories_json, overrides_json, version, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
        ON CONFLICT(page_id) DO UPDATE SET
          templates_json = excluded.templates_json,
          avatar_ids_json = excluded.avatar_ids_json,
          music_mood = excluded.music_mood,
          selected_track_ids_json = excluded.selected_track_ids_json,
          background_categories_json = excluded.background_categories_json,
          overrides_json = excluded.overrides_json,
          version = page_settings.version + 1,
          updated_at = excluded.updated_at
      `).run(
        pageId,
        JSON.stringify(merged.templates),
        JSON.stringify(merged.avatar_ids),
        merged.music_mood,
        JSON.stringify(merged.selected_track_ids || []),
        JSON.stringify(merged.background_categories || []),
        JSON.stringify(merged.overrides || {}),
        merged.updated_at
      );

      return merged;
    },
  },

  templates: {
    list: async (): Promise<Template[]> => {
      return [...staticTemplates];
    },
    get: async (id: string): Promise<Template | null> => {
      return staticTemplates.find((t) => t.id === id) || null;
    },
  },

  avatars: {
    list: async (pageId?: string): Promise<Avatar[]> => {
      const db = getDb();
      const rows = db.prepare("SELECT * FROM avatars ORDER BY name ASC").all() as any[];
      const avatars: Avatar[] = rows.map((r) => ({
        id: r.id,
        name: r.name,
        image_path: r.image_path,
        owner_page_id: r.owner_page_id || null,
        url: r.image_path,
        gender: r.gender,
        age_min: r.age_min,
        age_max: r.age_max,
        used_by_page_ids: JSON.parse(r.used_by_page_ids_json || "[]"),
        created_at: r.created_at,
      }));

      if (!pageId) return avatars;
      return avatars.filter((a) => a.used_by_page_ids.includes(pageId));
    },

    get: async (id: string): Promise<Avatar | null> => {
      const db = getDb();
      const r = db.prepare("SELECT * FROM avatars WHERE id = ?").get(id) as any;
      if (!r) return null;
      return {
        id: r.id,
        name: r.name,
        image_path: r.image_path,
        owner_page_id: r.owner_page_id || null,
        url: r.image_path,
        gender: r.gender,
        age_min: r.age_min,
        age_max: r.age_max,
        used_by_page_ids: JSON.parse(r.used_by_page_ids_json || "[]"),
        created_at: r.created_at,
      };
    },

    create: async (data: Omit<Avatar, "created_at" | "id"> & { id?: string }): Promise<Avatar> => {
      const db = getDb();
      const now = new Date().toISOString();
      const avatarId = data.id || `av_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      db.prepare(`
        INSERT INTO avatars (id, name, image_path, gender, age_min, age_max, used_by_page_ids_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        avatarId,
        data.name,
        data.image_path,
        data.gender,
        data.age_min,
        data.age_max,
        JSON.stringify(data.used_by_page_ids || []),
        now
      );
      return (await repository.avatars.get(avatarId))!;
    },

    update: async (id: string, data: Partial<Avatar>): Promise<Avatar | null> => {
      const db = getDb();
      const current = await repository.avatars.get(id);
      if (!current) return null;

      const merged = { ...current, ...data };
      db.prepare(`
        UPDATE avatars SET
          name = ?,
          gender = ?,
          age_min = ?,
          age_max = ?,
          used_by_page_ids_json = ?
        WHERE id = ?
      `).run(
        merged.name,
        merged.gender,
        merged.age_min,
        merged.age_max,
        JSON.stringify(merged.used_by_page_ids || []),
        id
      );

      return repository.avatars.get(id);
    },

    delete: async (id: string): Promise<boolean> => {
      const db = getDb();
      const res = db.prepare("DELETE FROM avatars WHERE id = ?").run(id);
      return res.changes > 0;
    },
  },

  music: {
    list: async (mood?: string): Promise<MusicTrack[]> => {
      const db = getDb();
      let rows: any[];
      if (mood) {
        rows = db.prepare("SELECT * FROM music_tracks WHERE mood = ? ORDER BY title ASC").all(mood);
      } else {
        rows = db.prepare("SELECT * FROM music_tracks ORDER BY title ASC").all();
      }
      return rows.map((r) => ({
        id: r.id,
        title: r.title,
        file_path: r.file_path,
        mood: r.mood,
        duration_sec: r.duration_sec,
        created_at: r.created_at,
      }));
    },

    get: async (id: string): Promise<MusicTrack | null> => {
      const db = getDb();
      const r = db.prepare("SELECT * FROM music_tracks WHERE id = ?").get(id) as any;
      if (!r) return null;
      return {
        id: r.id,
        title: r.title,
        file_path: r.file_path,
        mood: r.mood,
        duration_sec: r.duration_sec,
        created_at: r.created_at,
      };
    },

    create: async (data: Omit<MusicTrack, "id" | "created_at">): Promise<MusicTrack> => {
      const db = getDb();
      const id = `track_${Date.now()}`;
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO music_tracks (id, title, file_path, mood, duration_sec, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, data.title, data.file_path, data.mood, data.duration_sec, now);
      return (await repository.music.get(id))!;
    },
  },

  batches: {
    list: async (staffId?: string): Promise<Batch[]> => {
      const db = getDb();
      let rows: any[];
      if (staffId) {
        rows = db.prepare("SELECT * FROM batches WHERE staff_id = ? ORDER BY created_at DESC").all(staffId);
      } else {
        rows = db.prepare("SELECT * FROM batches ORDER BY created_at DESC").all();
      }

      return rows.map((b) => ({
        id: b.id,
        name: b.name,
        page_id: b.page_id,
        staff_id: b.staff_id,
        owner_staff_id: b.staff_id,
        mode: b.mode,
        status: b.status,
        count: b.count,
        total_items: b.count,
        done_count: b.done_count,
        completed_items: b.done_count,
        failed_items: b.failed_count,
        settings_snapshot: JSON.parse(b.settings_snapshot_json || "{}"),
        target_helper_id: b.target_helper_id,
        created_at: b.created_at,
        finished_at: b.finished_at,
      }));
    },

    get: async (id: string): Promise<{ batch: Batch | null; items: BatchItem[] }> => {
      const db = getDb();
      const b = db.prepare("SELECT * FROM batches WHERE id = ?").get(id) as any;
      if (!b) return { batch: null, items: [] };

      const batch: Batch = {
        id: b.id,
        name: b.name,
        page_id: b.page_id,
        staff_id: b.staff_id,
        owner_staff_id: b.staff_id,
        mode: b.mode,
        status: b.status,
        count: b.count,
        total_items: b.count,
        done_count: b.done_count,
        completed_items: b.done_count,
        failed_items: b.failed_count,
        settings_snapshot: JSON.parse(b.settings_snapshot_json || "{}"),
        target_helper_id: b.target_helper_id,
        created_at: b.created_at,
        finished_at: b.finished_at,
      };

      const itemRows = db.prepare("SELECT * FROM batch_items WHERE batch_id = ? ORDER BY seq ASC").all(id) as any[];
      const items: BatchItem[] = itemRows.map((it) => ({
        id: it.id,
        batch_id: it.batch_id,
        seq: it.seq,
        card_id: it.card_id,
        template_id: it.template_id,
        palette_id: it.palette_id,
        avatar_id: it.avatar_id,
        track_id: it.track_id,
        music_track_id: it.track_id,
        background_video_url: it.background_video_url,
        story_payload: JSON.parse(it.story_payload_json || "{}"),
        progress: it.progress || 0,
        duration: it.duration || 10,
        resolution: it.resolution || "720x1280",
        status: it.status,
        output_path: it.output_path,
        output_video_url: it.output_video_url,
        error: it.error,
        created_at: it.created_at,
        finished_at: it.finished_at,
      }));

      return { batch, items };
    },

    create: async (
      batchData: {
        page_id: string;
        owner_staff_id: string;
        name: string;
        total_items: number;
        target_helper_id?: string | null;
        mode?: string;
        locale?: string;
      },
      itemsData: Array<{
        card_id?: string;
        template_id: string;
        palette_id: string;
        avatar_id?: string | null;
        music_track_id?: string | null;
        background_video_url?: string;
        duration?: number;
        resolution?: string;
        story_payload: any;
      }>
    ): Promise<Batch> => {
      const db = getDb();
      const batchId = `batch_${Date.now()}`;
      const now = new Date().toISOString();

      // Freeze settings snapshot
      let snapshot: any = {};
      const resolvedPageId = batchData.page_id || "free";
      if (resolvedPageId !== "free") {
        const page = await repository.pages.get(resolvedPageId);
        if (page) {
          snapshot = {
            ...(page.settings || {}),
            page_id: page.id,
            page_name: page.name,
            display_name: page.display_name || page.name || "The Story",
            locale: page.locale || "en",
          };
        }
      }
      if (!snapshot.page_id) {
        snapshot = {
          page_id: "free",
          page_name: "Lô tự do",
          display_name: "The Story",
          locale: batchData.locale || "en",
        };
      }

      const insertBatch = db.prepare(`
        INSERT INTO batches (id, name, page_id, staff_id, mode, status, count, done_count, failed_count, settings_snapshot_json, target_helper_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?)
      `);

      const insertItem = db.prepare(`
        INSERT INTO batch_items (id, batch_id, seq, card_id, template_id, palette_id, avatar_id, track_id, background_video_url, story_payload_json, duration, resolution, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
      `);

      const verifiedBg = "/assets/backgrounds/2.mp4";

      db.transaction(() => {
        insertBatch.run(
          batchId,
          batchData.name,
          resolvedPageId,
          batchData.owner_staff_id,
          batchData.mode || "custom_per_video",
          "queued",
          itemsData.length,
          JSON.stringify(snapshot),
          batchData.target_helper_id || null,
          now
        );

        itemsData.forEach((it, idx) => {
          const itemId = `item_${batchId}_${idx + 1}`;
          insertItem.run(
            itemId,
            batchId,
            idx + 1,
            it.card_id || null,
            it.template_id,
            it.palette_id,
            it.avatar_id || null,
            it.music_track_id || null,
            it.background_video_url || verifiedBg,
            JSON.stringify(it.story_payload || {}),
            it.duration || 10,
            it.resolution || "720x1280",
            now
          );
        });
      })();

      const res = await repository.batches.get(batchId);
      return res.batch!;
    },

    claimNextItem: async (helperId: string): Promise<BatchItem | null> => {
      const db = getDb();
      const now = new Date();
      const nowIso = now.toISOString();
      const leaseExpiresAt = new Date(now.getTime() + 5 * 60 * 1000).toISOString(); // 5 min lease
      const leaseToken = `lease_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      // Atomic lease fencing: find first pending or expired leased item
      let claimedItem: BatchItem | null = null;

      db.transaction(() => {
        const item = db.prepare(`
          SELECT bi.* FROM batch_items bi
          JOIN batches b ON bi.batch_id = b.id
          WHERE bi.status = 'pending' OR (bi.status = 'leased' AND bi.lease_expires_at < ?)
          ORDER BY bi.created_at ASC
          LIMIT 1
        `).get(nowIso) as any;

        if (item) {
          db.prepare(`
            UPDATE batch_items
            SET status = 'leased', lease_token = ?, leased_at = ?, lease_expires_at = ?
            WHERE id = ?
          `).run(leaseToken, nowIso, leaseExpiresAt, item.id);

          db.prepare(`
            UPDATE batches SET status = 'running' WHERE id = ? AND status = 'queued'
          `).run(item.batch_id);

          claimedItem = {
            id: item.id,
            batch_id: item.batch_id,
            seq: item.seq,
            card_id: item.card_id,
            template_id: item.template_id,
            palette_id: item.palette_id,
            avatar_id: item.avatar_id,
            track_id: item.track_id,
            music_track_id: item.track_id,
            background_video_url: item.background_video_url,
            story_payload: JSON.parse(item.story_payload_json || "{}"),
            status: "leased",
            created_at: item.created_at,
          };
        }
      })();

      return claimedItem;
    },

    completeItem: async (
      itemId: string,
      leaseToken: string,
      outputPath: string,
      outputVideoUrl: string
    ): Promise<boolean> => {
      const db = getDb();
      const now = new Date().toISOString();
      let success = false;

      db.transaction(() => {
        const item = db.prepare("SELECT * FROM batch_items WHERE id = ?").get(itemId) as any;
        if (!item) return;

        // Verify lease token if provided to prevent zombie workers from completing
        if (item.lease_token && item.lease_token !== leaseToken) {
          return;
        }

        db.prepare(`
          UPDATE batch_items
          SET status = 'completed', output_path = ?, output_video_url = ?, finished_at = ?
          WHERE id = ?
        `).run(outputPath, outputVideoUrl, now, itemId);

        // Update batch done_count
        db.prepare(`
          UPDATE batches
          SET done_count = (SELECT COUNT(*) FROM batch_items WHERE batch_id = ? AND status = 'completed')
          WHERE id = ?
        `).run(item.batch_id, item.batch_id);

        // Check if all items in batch are completed
        const counts = db.prepare(`
          SELECT
            COUNT(*) as total,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as done,
            SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
          FROM batch_items WHERE batch_id = ?
        `).get(item.batch_id) as any;

        if (counts.done + counts.failed >= counts.total) {
          const finalStatus = counts.failed === 0 ? "completed" : counts.done > 0 ? "partial_failed" : "failed";
          db.prepare(`UPDATE batches SET status = ?, finished_at = ? WHERE id = ?`).run(
            finalStatus,
            now,
            item.batch_id
          );
        }

        success = true;
      })();

      return success;
    },

    failItem: async (itemId: string, error: string): Promise<boolean> => {
      const db = getDb();
      const now = new Date().toISOString();
      let success = false;

      db.transaction(() => {
        const item = db.prepare("SELECT * FROM batch_items WHERE id = ?").get(itemId) as any;
        if (!item) return;

        db.prepare(`
          UPDATE batch_items
          SET status = 'failed', error = ?, finished_at = ?
          WHERE id = ?
        `).run(error, now, itemId);

        db.prepare(`
          UPDATE batches
          SET failed_count = (SELECT COUNT(*) FROM batch_items WHERE batch_id = ? AND status = 'failed')
          WHERE id = ?
        `).run(item.batch_id, item.batch_id);

        success = true;
      })();

      return success;
    },
  },

  cards: {
    list: async (filters?: { locale?: string; status?: string; search?: string }): Promise<Card[]> => {
      const db = getDb();
      let query = "SELECT * FROM cards WHERE 1=1";
      const params: any[] = [];

      if (filters?.locale) {
        query += " AND locale = ?";
        params.push(filters.locale);
      }
      if (filters?.status) {
        query += " AND status = ?";
        params.push(filters.status);
      }
      if (filters?.search) {
        query += " AND (title LIKE ? OR content LIKE ? OR author LIKE ?)";
        const term = `%${filters.search}%`;
        params.push(term, term, term);
      }

      query += " ORDER BY created_at DESC";
      const rows = db.prepare(query).all(...params) as any[];

      return rows.map((r) => ({
        id: r.id,
        author: r.author,
        author_name: r.author,
        page: r.page,
        locale: r.locale,
        title: r.title,
        content: r.content,
        body: r.content,
        highlights: JSON.parse(r.highlights_json || "[]"),
        cta: r.cta,
        caption: r.caption,
        comment1: r.comment1,
        first_comment: r.comment1,
        status: r.status,
        reserved_by_batch_id: r.reserved_by_batch_id,
        used_by_page_id: r.used_by_page_id,
        created_at: r.created_at,
        time_label: new Date(r.created_at).toLocaleDateString("vi-VN"),
        category: "Drama",
        avatar_hint: {
          gender: "nu",
          age_hint: 30,
        },
      }));
    },

    get: async (id: string): Promise<Card | null> => {
      const db = getDb();
      const r = db.prepare("SELECT * FROM cards WHERE id = ?").get(id) as any;
      if (!r) return null;
      return {
        id: r.id,
        author: r.author,
        author_name: r.author,
        page: r.page,
        locale: r.locale,
        title: r.title,
        content: r.content,
        body: r.content,
        highlights: JSON.parse(r.highlights_json || "[]"),
        cta: r.cta,
        caption: r.caption,
        comment1: r.comment1,
        first_comment: r.comment1,
        status: r.status,
        reserved_by_batch_id: r.reserved_by_batch_id,
        used_by_page_id: r.used_by_page_id,
        created_at: r.created_at,
        time_label: new Date(r.created_at).toLocaleDateString("vi-VN"),
        category: "Drama",
        avatar_hint: {
          gender: "nu",
          age_hint: 30,
        },
      };
    },

    create: async (data: Omit<Card, "id" | "created_at" | "time_label"> & { id?: string }): Promise<Card> => {
      const db = getDb();
      const id = data.id || `card_${Date.now()}`;
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO cards (id, author, page, locale, title, content, highlights_json, cta, caption, comment1, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        data.author_name || (data as any).author || "Anonymous",
        data.page || "Page",
        data.locale || "en",
        data.title,
        data.body || (data as any).content || "",
        JSON.stringify(data.highlights || []),
        data.cta || "Read more in comments",
        data.caption || "",
        data.first_comment || (data as any).comment1 || "",
        data.status || "ready",
        now,
        now
      );

      return (await repository.cards.get(id))!;
    },

    reserveForBatch: async (cardIds: string[], batchId: string): Promise<boolean> => {
      const db = getDb();
      const now = new Date().toISOString();
      let success = true;

      db.transaction(() => {
        for (const cid of cardIds) {
          const res = db.prepare(`
            UPDATE cards
            SET status = 'reserved', reserved_by_batch_id = ?, updated_at = ?
            WHERE id = ? AND (status = 'ready' OR status = 'draft')
          `).run(batchId, now, cid);
          if (res.changes === 0) {
            success = false;
            throw new Error(`Thẻ ${cid} đã bị người khác chọn hoặc không ở trạng thái sẵn sàng.`);
          }
        }
      })();

      return success;
    },
  },

  helpers: {
    list: async (staffId?: string): Promise<HelperMachine[]> => {
      const db = getDb();
      let rows: any[];
      if (staffId) {
        rows = db.prepare("SELECT * FROM helpers WHERE staff_id = ? ORDER BY created_at DESC").all(staffId);
      } else {
        rows = db.prepare("SELECT * FROM helpers ORDER BY created_at DESC").all();
      }

      return rows.map((r) => ({
        id: r.id,
        staff_id: r.staff_id,
        name: r.name,
        key_hash: r.key_hash,
        os: r.os,
        version: r.version,
        concurrency: r.concurrency,
        cache_mb: r.cache_mb,
        last_seen_at: r.last_seen_at,
        revoked: r.revoked === 1,
        created_at: r.created_at,
      }));
    },

    updateConcurrency: async (id: string, concurrency: number): Promise<boolean> => {
      const db = getDb();
      const res = db.prepare("UPDATE helpers SET concurrency = ? WHERE id = ?").run(concurrency, id);
      return res.changes > 0;
    },

    revoke: async (id: string): Promise<boolean> => {
      const db = getDb();
      const res = db.prepare("UPDATE helpers SET revoked = 1 WHERE id = ?").run(id);
      return res.changes > 0;
    },

    heartbeat: async (id: string, metrics?: { cache_mb?: number; os?: string; version?: string }): Promise<boolean> => {
      const db = getDb();
      const now = new Date().toISOString();
      const sets = ["last_seen_at = ?"];
      const vals: any[] = [now];

      if (metrics?.cache_mb !== undefined) {
        sets.push("cache_mb = ?");
        vals.push(metrics.cache_mb);
      }
      if (metrics?.os) {
        sets.push("os = ?");
        vals.push(metrics.os);
      }
      if (metrics?.version) {
        sets.push("version = ?");
        vals.push(metrics.version);
      }

      vals.push(id);
      const res = db.prepare(`UPDATE helpers SET ${sets.join(", ")} WHERE id = ? AND revoked = 0`).run(...vals);
      return res.changes > 0;
    },
  },

  monitoredPages: {
    list: async (): Promise<any[]> => {
      const db = getDb();
      return db.prepare("SELECT * FROM monitored_pages ORDER BY followers DESC").all();
    },
    create: async (data: any): Promise<any> => {
      const db = getDb();
      const id = data.id || `rad_${Date.now()}`;
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO monitored_pages (id, page_name, page_avatar, followers, delta_7d, posts_today, posts_7d, comments_7d, total_posts, target_domain, ads_status, last_scanned_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        data.page_name,
        data.page_avatar || "/assets/avatars/av_01.jpg",
        data.followers || 0,
        data.delta_7d || 0,
        data.posts_today || 0,
        data.posts_7d || 0,
        data.comments_7d || 0,
        data.total_posts || 0,
        data.target_domain || null,
        data.ads_status || "unknown",
        now,
        now
      );
      return db.prepare("SELECT * FROM monitored_pages WHERE id = ?").get(id);
    },
  },

  viralPosts: {
    list: async (filters?: { locale?: string; post_type?: string; search?: string }): Promise<ViralPost[]> => {
      const db = getDb();
      let query = "SELECT * FROM viral_posts WHERE 1=1";
      const params: any[] = [];

      if (filters?.locale && filters.locale !== "all") {
        query += " AND locale = ?";
        params.push(filters.locale);
      }
      if (filters?.post_type && filters.post_type !== "all") {
        query += " AND post_type = ?";
        params.push(filters.post_type);
      }
      if (filters?.search) {
        query += " AND (caption LIKE ? OR page_name LIKE ?)";
        const term = `%${filters.search}%`;
        params.push(term, term);
      }

      query += " ORDER BY comments_count DESC";
      const rows = db.prepare(query).all(...params) as any[];

      return rows.map((r) => ({
        id: r.id,
        source: r.source,
        page_name: r.page_name,
        page_followers: r.page_followers,
        locale: r.locale,
        post_type: r.post_type,
        published_at: r.published_at,
        comments_count: r.comments_count,
        comments: r.comments_count,
        reactions_count: r.reactions_count,
        reactions: r.reactions_count,
        shares_count: r.shares_count,
        shares: r.shares_count,
        caption: r.caption,
        image_url: r.image_url,
        post_url: r.post_url,
        has_website_link: r.has_website_link === 1,
        has_web_link: r.has_website_link === 1,
        created_at: r.created_at,
      }));
    },
  },

  websites: {
    list: async (ownerId?: string): Promise<any[]> => {
      const db = getDb();
      if (ownerId) {
        return db.prepare("SELECT * FROM websites WHERE owner_id = ? ORDER BY created_at DESC").all(ownerId);
      }
      return db.prepare("SELECT * FROM websites ORDER BY created_at DESC").all();
    },

    create: async (data: { name: string; domain: string; slug: string; owner_id: string; status?: string }): Promise<any> => {
      const db = getDb();
      const id = `web_${Date.now()}`;
      const now = new Date().toISOString();
      const secret = `sec_${Math.random().toString(36).substring(2, 12)}`;

      db.prepare(`
        INSERT INTO websites (id, name, domain, slug, owner_id, status, secret_key, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, data.name, data.domain, data.slug, data.owner_id, data.status || "approved", secret, now);

      return db.prepare("SELECT * FROM websites WHERE id = ?").get(id);
    },

    updateStatus: async (id: string, status: "approved" | "rejected"): Promise<boolean> => {
      const db = getDb();
      const res = db.prepare("UPDATE websites SET status = ? WHERE id = ?").run(status, id);
      return res.changes > 0;
    },
  },
};
