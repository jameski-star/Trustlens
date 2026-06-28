export function renderMarkdown(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/`(.+?)`/g, '<code class="text-sm bg-[#F1F5F9] px-1.5 py-0.5 rounded text-[#DC2626]">$1</code>');

  const lines = html.split('\n');
  const result: string[] = [];
  let inList = false;
  let listType = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('### ')) {
      if (inList) { result.push(`</${listType}>`); inList = false; }
      result.push(`<h3 class="text-lg font-semibold text-[#0F172A] mt-6 mb-3">${line.slice(4)}</h3>`);
    } else if (line.startsWith('## ')) {
      if (inList) { result.push(`</${listType}>`); inList = false; }
      result.push(`<h2 class="text-xl font-semibold text-[#0F172A] mt-8 mb-4">${line.slice(3)}</h2>`);
    } else if (line.match(/^\d+\.\s/)) {
      const content = line.replace(/^\d+\.\s/, '');
      if (!inList || listType !== 'ol') {
        if (inList) result.push(`</${listType}>`);
        result.push('<ol class="list-decimal ml-6 space-y-1 mb-4">');
        inList = true;
        listType = 'ol';
      }
      result.push(`<li class="text-[#475569]">${content}</li>`);
    } else if (line.startsWith('- ')) {
      const content = line.slice(2);
      if (!inList || listType !== 'ul') {
        if (inList) result.push(`</${listType}>`);
        result.push('<ul class="list-disc ml-6 space-y-1 mb-4">');
        inList = true;
        listType = 'ul';
      }
      result.push(`<li class="text-[#475569]">${content}</li>`);
    } else if (line.trim() === '') {
      if (inList) { result.push(`</${listType}>`); inList = false; }
      result.push('<div class="h-3"></div>');
    } else {
      if (inList) { result.push(`</${listType}>`); inList = false; }
      result.push(`<p class="text-[#475569] mb-3 leading-relaxed">${line}</p>`);
    }
  }

  if (inList) result.push(`</${listType}>`);

  return result.join('\n');
}
