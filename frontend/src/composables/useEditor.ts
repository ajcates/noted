import { ref, computed, Ref } from 'vue';

export function useEditor(content: Ref<string>, textareaRef: Ref<HTMLTextAreaElement | null>) {
  const selectionStart = ref(0);
  const selectionEnd = ref(0);

  const updateSelection = () => {
    if (textareaRef.value) {
      selectionStart.value = textareaRef.value.selectionStart;
      selectionEnd.value = textareaRef.value.selectionEnd;
    }
  };

  const isHighlighted = computed(() => {
    const text = content.value;
    const pos = selectionStart.value;
    const regex = /==(.*?)==/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = match.index + match[0].length;
      if (pos >= start && pos <= end) {
        return true;
      }
    }
    return false;
  });

  const handleHighlight = () => {
    if (!textareaRef.value) return;
    const start = textareaRef.value.selectionStart;
    const end = textareaRef.value.selectionEnd;
    const text = content.value;

    if (isHighlighted.value) {
      const regex = /==/g;
      let match;
      let markers: number[] = [];
      while ((match = regex.exec(text)) !== null) {
        markers.push(match.index);
      }
      for (let i = 0; i < markers.length; i += 2) {
        const mStart = markers[i];
        const mEnd = (markers[i+1] || 0) + 2;
        if (start >= mStart && start <= mEnd) {
          content.value = text.slice(0, mStart) + text.slice(mStart + 2, markers[i+1]) + text.slice(mEnd);
          break;
        }
      }
    } else {
      if (start === end) {
        content.value = text.slice(0, start) + '====' + text.slice(end);
        setTimeout(() => {
          if (textareaRef.value) textareaRef.value.setSelectionRange(start + 2, start + 2);
        }, 0);
      } else {
        content.value = text.slice(0, start) + '==' + text.slice(start, end) + '==' + text.slice(end);
      }
    }
    textareaRef.value.focus();
  };

  const handleHeader = () => {
    if (!textareaRef.value) return;
    const start = textareaRef.value.selectionStart;
    const text = content.value;
    const lastNewline = text.lastIndexOf('\n', start - 1);
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
    const lineEnd = text.indexOf('\n', lineStart);
    const line = text.substring(lineStart, lineEnd === -1 ? text.length : lineEnd);

    if (line.startsWith('# ')) {
      content.value = text.slice(0, lineStart) + line.substring(2) + text.slice(lineStart + line.length);
    } else {
      content.value = text.slice(0, lineStart) + '# ' + line + text.slice(lineStart + line.length);
    }
    textareaRef.value.focus();
  };

  const handleList = () => {
    if (!textareaRef.value) return;
    const start = textareaRef.value.selectionStart;
    const end = textareaRef.value.selectionEnd;
    const text = content.value;
    const lastNewlineBefore = text.lastIndexOf('\n', start - 1);
    const startPos = lastNewlineBefore === -1 ? 0 : lastNewlineBefore + 1;
    const endPos = text.indexOf('\n', end) === -1 ? text.length : text.indexOf('\n', end);
    const selectedText = text.substring(startPos, endPos);
    const lines = selectedText.split('\n');
    const allList = lines.every(line => line.startsWith('- '));
    const newLines = allList 
      ? lines.map(line => line.substring(2))
      : lines.map(line => line.startsWith('- ') ? line : '- ' + line);
      
    content.value = text.slice(0, startPos) + newLines.join('\n') + text.slice(endPos);
    textareaRef.value.focus();
  };

  const handleLink = () => {
    if (!textareaRef.value) return;
    const start = textareaRef.value.selectionStart;
    const end = textareaRef.value.selectionEnd;
    const text = content.value;
    const selectedText = text.substring(start, end);
    const linkTemplate = `[${selectedText}](url)`;
    content.value = text.slice(0, start) + linkTemplate + text.slice(end);
    setTimeout(() => {
      if (textareaRef.value) {
        const newStart = start + linkTemplate.length - 4;
        textareaRef.value.setSelectionRange(newStart, newStart + 3);
        textareaRef.value.focus();
      }
    }, 0);
  };

  const handleEscape = () => {
    if (!textareaRef.value) return;
    const start = textareaRef.value.selectionStart;
    const end = textareaRef.value.selectionEnd;
    const text = content.value;
    const selectedText = text.substring(start, end);
    const escaped = selectedText.replace(/([\\`*_{}[\]()#+\-.!])/g, '\\$1');
    content.value = text.slice(0, start) + escaped + text.slice(end);
    textareaRef.value.focus();
  };

  const handleFormat = () => {
    const lines = content.value.split('\n');
    content.value = lines
      .map(line => line.trimEnd())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');
    textareaRef.value?.focus();
  };

  const handleUndo = () => {
    document.execCommand('undo');
    textareaRef.value?.focus();
  };

  return {
    selectionStart,
    selectionEnd,
    isHighlighted,
    updateSelection,
    handleHighlight,
    handleHeader,
    handleList,
    handleLink,
    handleEscape,
    handleFormat,
    handleUndo
  };
}
