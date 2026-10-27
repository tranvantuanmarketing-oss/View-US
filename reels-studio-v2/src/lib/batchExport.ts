export function exportBaseName(pageName: string, batchId: string, seq: number = 0): string {
  const page = pageName.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,65) || 'video';
  return `${page}_${batchId.replace(/[^a-zA-Z0-9_-]/g,'_')}_${String(seq).padStart(3,'0')}`;
}
export function exportStoryText(payload: any): string {
  return `${payload.locale ? `Locale: ${payload.locale}\n` : ''}Title: ${payload.title || ''}\nAuthor: ${payload.author || ''}\nContent:\n${payload.content || ''}\n\nCaption:\n${payload.caption || ''}\n\nComment 1:\n${payload.comment1 || ''}\n`;
}
