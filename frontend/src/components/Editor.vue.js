import { ref, watch, computed } from 'vue';
import { useFileStore } from '@/stores/fileStore';
import debounce from 'lodash/debounce';
import BottomBar from './BottomBar.vue';
import { aiApi } from '@/api';
const fileStore = useFileStore();
const textareaRef = ref(null);
// Local state for the textarea to avoid immediate store updates on every keystroke
const localContent = ref(fileStore.currentContent);
const isProcessingAI = ref(false);
const selectedPrompt = ref('summarize');
// Selection state for highlight detection
const selectionStart = ref(0);
const selectionEnd = ref(0);
const debouncedSave = debounce((content) => {
    fileStore.saveFile(content);
}, 1000);
// Detect if the caret is currently inside a ==highlight== block
const isHighlighted = computed(() => {
    const content = localContent.value;
    const pos = selectionStart.value;
    // Find all == ranges in the current content
    const regex = /==(.*?)==/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const start = match.index;
        const end = match.index + match[0].length;
        if (pos >= start && pos <= end) {
            return true;
        }
    }
    return false;
});
const updateSelection = () => {
    if (textareaRef.value) {
        selectionStart.value = textareaRef.value.selectionStart;
        selectionEnd.value = textareaRef.value.selectionEnd;
    }
};
// --- Action Handlers ---
const handleHighlight = () => {
    if (!textareaRef.value)
        return;
    const start = textareaRef.value.selectionStart;
    const end = textareaRef.value.selectionEnd;
    const content = localContent.value;
    if (isHighlighted.value) {
        // Logic to REMOVE highlight (find the surrounding ==)
        const regex = /==(.*?)==/g;
        let match;
        let foundRange = null;
        while ((match = regex.exec(content)) !== null) {
            const mStart = match.index;
            const mEnd = match.index + match[0].length;
            if (start >= mStart && start <= mEnd) {
                foundRange = { start: mStart, end: mEnd, text: match[1] };
                break;
            }
        }
        if (foundRange) {
            localContent.value = content.slice(0, foundRange.start) + foundRange.text + content.slice(foundRange.end);
        }
    }
    else {
        // Logic to ADD highlight
        if (start === end) {
            // Empty highlight
            localContent.value = content.slice(0, start) + '====' + content.slice(end);
            setTimeout(() => {
                if (textareaRef.value)
                    textareaRef.value.setSelectionRange(start + 2, start + 2);
            }, 0);
        }
        else {
            localContent.value = content.slice(0, start) + '==' + content.slice(start, end) + '==' + content.slice(end);
        }
    }
    textareaRef.value.focus();
};
const handleUndo = () => {
    document.execCommand('undo');
    textareaRef.value?.focus();
};
const handleFormat = () => {
    const lines = localContent.value.split('\n');
    const formatted = lines
        .map(line => line.trimEnd())
        .join('\n')
        .replace(/\n{3,}/g, '\n\n'); // Max 2 newlines
    localContent.value = formatted;
    textareaRef.value?.focus();
};
const handleRunPrompt = async () => {
    if (!localContent.value)
        return;
    isProcessingAI.value = true;
    try {
        // Determine the text to process: selection or whole line/content
        let textToProcess = '';
        const start = textareaRef.value?.selectionStart || 0;
        const end = textareaRef.value?.selectionEnd || 0;
        if (start !== end) {
            textToProcess = localContent.value.substring(start, end);
        }
        else {
            // Find the current line if no selection
            const content = localContent.value;
            const lastNewline = content.lastIndexOf('\n', start - 1);
            const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
            const nextNewline = content.indexOf('\n', start);
            const lineEnd = nextNewline === -1 ? content.length : nextNewline;
            textToProcess = content.substring(lineStart, lineEnd);
        }
        const { result } = await aiApi.process(selectedPrompt.value, textToProcess);
        // Replace the text
        if (start !== end) {
            localContent.value = localContent.value.slice(0, start) + result + localContent.value.slice(end);
        }
        else {
            // If it was a line, replace the line
            const content = localContent.value;
            const lastNewline = content.lastIndexOf('\n', start - 1);
            const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
            const nextNewline = content.indexOf('\n', start);
            const lineEnd = nextNewline === -1 ? content.length : nextNewline;
            localContent.value = content.slice(0, lineStart) + result + content.slice(lineEnd);
        }
    }
    catch (e) {
        console.error('AI processing failed', e);
    }
    finally {
        isProcessingAI.value = false;
        textareaRef.value?.focus();
    }
};
const handleEscape = () => {
    if (!textareaRef.value)
        return;
    const start = textareaRef.value.selectionStart;
    const end = textareaRef.value.selectionEnd;
    const content = localContent.value;
    const selectedText = content.substring(start, end);
    // Escape Markdown characters
    const escaped = selectedText.replace(/([\\`*_{}[\]()#+\-.!])/g, '\\$1');
    localContent.value = content.slice(0, start) + escaped + content.slice(end);
    textareaRef.value.focus();
};
const handleHeader = () => {
    if (!textareaRef.value)
        return;
    const start = textareaRef.value.selectionStart;
    const content = localContent.value;
    // Find start of current line
    const lastNewline = content.lastIndexOf('\n', start - 1);
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
    const line = content.substring(lineStart, content.indexOf('\n', lineStart) === -1 ? content.length : content.indexOf('\n', lineStart));
    if (line.startsWith('# ')) {
        localContent.value = content.slice(0, lineStart) + line.substring(2) + content.slice(lineStart + line.length);
    }
    else {
        localContent.value = content.slice(0, lineStart) + '# ' + line + content.slice(lineStart + line.length);
    }
    textareaRef.value.focus();
};
const handleList = () => {
    if (!textareaRef.value)
        return;
    const start = textareaRef.value.selectionStart;
    const end = textareaRef.value.selectionEnd;
    const content = localContent.value;
    // Find the lines covered by the selection
    const lastNewlineBefore = content.lastIndexOf('\n', start - 1);
    const startPos = lastNewlineBefore === -1 ? 0 : lastNewlineBefore + 1;
    const endPos = content.indexOf('\n', end) === -1 ? content.length : content.indexOf('\n', end);
    const selectedText = content.substring(startPos, endPos);
    const lines = selectedText.split('\n');
    const allList = lines.every(line => line.startsWith('- '));
    const newLines = allList
        ? lines.map(line => line.substring(2))
        : lines.map(line => line.startsWith('- ') ? line : '- ' + line);
    localContent.value = content.slice(0, startPos) + newLines.join('\n') + content.slice(endPos);
    textareaRef.value.focus();
};
const handleLink = () => {
    if (!textareaRef.value)
        return;
    const start = textareaRef.value.selectionStart;
    const end = textareaRef.value.selectionEnd;
    const content = localContent.value;
    const selectedText = content.substring(start, end);
    const linkTemplate = `[${selectedText}](url)`;
    localContent.value = content.slice(0, start) + linkTemplate + content.slice(end);
    setTimeout(() => {
        if (textareaRef.value) {
            const newStart = start + linkTemplate.length - 4; // Inside (url)
            textareaRef.value.setSelectionRange(newStart, newStart + 3);
            textareaRef.value.focus();
        }
    }, 0);
};
// Sync local content when store changes (e.g. file opened or websocket update)
watch(() => fileStore.currentContent, (newContent) => {
    if (newContent !== localContent.value) {
        localContent.value = newContent;
    }
});
// Update store when local content changes
watch(localContent, (newContent) => {
    if (newContent !== fileStore.currentContent && !fileStore.readonly) {
        debouncedSave(newContent);
    }
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "editor-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['editor-wrapper']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.textarea, __VLS_intrinsics.textarea)({
    ...{ onKeyup: (__VLS_ctx.updateSelection) },
    ...{ onClick: (__VLS_ctx.updateSelection) },
    ...{ onSelect: (__VLS_ctx.updateSelection) },
    ref: "textareaRef",
    value: (__VLS_ctx.localContent),
    readonly: (__VLS_ctx.fileStore.readonly),
    ...{ class: "native-textarea" },
    placeholder: "Start typing...",
    spellcheck: "false",
});
/** @type {__VLS_StyleScopedClasses['native-textarea']} */ ;
const __VLS_0 = BottomBar;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onHighlight': {} },
    ...{ 'onUndo': {} },
    ...{ 'onFormat': {} },
    ...{ 'onRunPrompt': {} },
    ...{ 'onSelectPrompt': {} },
    ...{ 'onHeader': {} },
    ...{ 'onList': {} },
    ...{ 'onLink': {} },
    ...{ 'onEscape': {} },
    isHighlighted: (__VLS_ctx.isHighlighted),
    canUndo: (true),
    isProcessing: (__VLS_ctx.isProcessingAI),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onHighlight': {} },
    ...{ 'onUndo': {} },
    ...{ 'onFormat': {} },
    ...{ 'onRunPrompt': {} },
    ...{ 'onSelectPrompt': {} },
    ...{ 'onHeader': {} },
    ...{ 'onList': {} },
    ...{ 'onLink': {} },
    ...{ 'onEscape': {} },
    isHighlighted: (__VLS_ctx.isHighlighted),
    canUndo: (true),
    isProcessing: (__VLS_ctx.isProcessingAI),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ highlight: {} },
    { onHighlight: (__VLS_ctx.handleHighlight) });
const __VLS_7 = ({ undo: {} },
    { onUndo: (__VLS_ctx.handleUndo) });
const __VLS_8 = ({ format: {} },
    { onFormat: (__VLS_ctx.handleFormat) });
const __VLS_9 = ({ runPrompt: {} },
    { onRunPrompt: (__VLS_ctx.handleRunPrompt) });
const __VLS_10 = ({ selectPrompt: {} },
    { onSelectPrompt: ((id) => __VLS_ctx.selectedPrompt = id) });
const __VLS_11 = ({ header: {} },
    { onHeader: (__VLS_ctx.handleHeader) });
const __VLS_12 = ({ list: {} },
    { onList: (__VLS_ctx.handleList) });
const __VLS_13 = ({ link: {} },
    { onLink: (__VLS_ctx.handleLink) });
const __VLS_14 = ({ escape: {} },
    { onEscape: (__VLS_ctx.handleEscape) });
var __VLS_3;
var __VLS_4;
// @ts-ignore
[updateSelection, updateSelection, updateSelection, localContent, fileStore, isHighlighted, isProcessingAI, handleHighlight, handleUndo, handleFormat, handleRunPrompt, selectedPrompt, handleHeader, handleList, handleLink, handleEscape,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
