const {execFileSync}=require('node:child_process');
const path=require('node:path');const fs=require('node:fs');const os=require('node:os');const assert=require('node:assert/strict');
const output=fs.mkdtempSync(path.join(os.tmpdir(),'story-parser-test-'));
execFileSync(path.resolve('node_modules/.bin/tsc'),['src/lib/storyImport.ts','--outDir',output,'--module','commonjs','--target','ES2020','--skipLibCheck']);
const {parseStories,serializeStories}=require(path.join(output,'storyImport.js'));
const input='\ufeff=== STORY 1 ===\r\nAuthor: QA\r\nContent:\r\nLine one.\r\nLine two.\r\nHighlights: "Line one."\r\nCaption:\r\nFirst\r\nSecond\r\nComment 1:\r\nPart one\r\nPart two';
const [s]=parseStories(input);assert.equal(s.content,'Line one.\nLine two.');assert.equal(s.caption,'First\nSecond');assert.equal(s.comment1,'Part one\nPart two');assert.deepEqual(s.highlights,['Line one.']);assert.deepEqual(parseStories(serializeStories([s])),[s]);assert.equal(parseStories(JSON.stringify({stories:[s]})).length,1);assert.throws(()=>parseStories('=== STORY 1 ===\nAuthor: No content'));console.log('PASS UTF-8 BOM, CRLF, multiline fields, highlights, TXT roundtrip, JSON, missing content');
fs.rmSync(output,{recursive:true,force:true});
