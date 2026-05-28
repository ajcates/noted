import { ref, Ref } from 'vue';

export function useSearch(content: Ref<string>, textareaRef: Ref<HTMLTextAreaElement | null>) {
  const searchOpen = ref(false);
  const searchQuery = ref('');
  const replaceQuery = ref('');
  const searchResults = ref<number[]>([]);
  const currentResultIndex = ref(-1);

  const toggleSearch = () => {
    searchOpen.value = !searchOpen.value;
    if (!searchOpen.value) {
      searchResults.value = [];
      currentResultIndex.value = -1;
    }
  };

  const performSearch = () => {
    if (!searchQuery.value) {
      searchResults.value = [];
      return;
    }
    const text = content.value;
    try {
      const regex = new RegExp(searchQuery.value, 'gi');
      let match;
      const indices: number[] = [];
      while ((match = regex.exec(text)) !== null) {
        indices.push(match.index);
      }
      searchResults.value = indices;
      if (indices.length > 0) {
        currentResultIndex.value = 0;
        highlightSearchResult();
      } else {
        currentResultIndex.value = -1;
      }
    } catch (e) {
      searchResults.value = [];
    }
  };

  const nextSearchResult = () => {
    if (searchResults.value.length === 0) return;
    currentResultIndex.value = (currentResultIndex.value + 1) % searchResults.value.length;
    highlightSearchResult();
  };

  const prevSearchResult = () => {
    if (searchResults.value.length === 0) return;
    currentResultIndex.value = (currentResultIndex.value - 1 + searchResults.value.length) % searchResults.value.length;
    highlightSearchResult();
  };

  const highlightSearchResult = () => {
    if (textareaRef.value && currentResultIndex.value !== -1) {
      const start = searchResults.value[currentResultIndex.value];
      textareaRef.value.setSelectionRange(start, start + searchQuery.value.length);
      textareaRef.value.focus();
      
      const lineHeight = 1.5 * 14; 
      const line = content.value.substring(0, start).split('\n').length;
      textareaRef.value.scrollTop = (line - 5) * lineHeight;
    }
  };

  const performReplace = () => {
    if (!searchQuery.value || currentResultIndex.value === -1) return;
    const text = content.value;
    const s = textareaRef.value?.selectionStart || 0;
    const e = textareaRef.value?.selectionEnd || 0;
    content.value = text.slice(0, s) + replaceQuery.value + text.slice(e);
    performSearch();
  };

  const replaceAll = () => {
    if (!searchQuery.value) return;
    const regex = new RegExp(searchQuery.value, 'gi');
    content.value = content.value.replace(regex, replaceQuery.value);
    toggleSearch();
  };

  return {
    searchOpen,
    searchQuery,
    replaceQuery,
    searchResults,
    currentResultIndex,
    toggleSearch,
    performSearch,
    nextSearchResult,
    prevSearchResult,
    performReplace,
    replaceAll
  };
}
