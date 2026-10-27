export function migrateAssetArchive(db){db.exec('CREATE TABLE IF NOT EXISTS asset_archive(asset_id TEXT PRIMARY KEY,archived_at TEXT NOT NULL)');}
export function archiveAssets(db,ids,restore=false){
 if(!Array.isArray(ids)||!ids.length||ids.length>500||ids.some(id=>typeof id!=='string'))throw Error('Chọn 1–500 video hợp lệ.');
 const unique=[...new Set(ids)];
 for(const id of unique){const asset=db.prepare('SELECT * FROM assets WHERE id=?').get(id);if(!asset)throw Error('Không tìm thấy video.');if(!restore&&(asset.page_id||db.prepare('SELECT 1 FROM jobs WHERE asset_id=?').get(id)))throw Error('Chỉ lưu trữ video chưa gắn Page và không có lịch sử/lịch đăng.');}
 db.exec('BEGIN IMMEDIATE');try{for(const id of unique){if(restore)db.prepare('DELETE FROM asset_archive WHERE asset_id=?').run(id);else db.prepare('INSERT OR IGNORE INTO asset_archive VALUES(?,?)').run(id,new Date().toISOString());}db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
 return {ok:true,count:unique.length};
}
