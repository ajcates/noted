<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import { useAI } from '@/composables/useAI';
import { marked } from 'marked';
import '@mdui/icons/close.js';
import '@mdui/icons/send.js';
import '@mdui/icons/auto-awesome.js';
import '@mdui/icons/content-copy.js';
import '@mdui/icons/check.js';
import '@mdui/icons/stop-circle.js';
import '@mdui/icons/delete.js';
import '@mdui/icons/history.js';
import '@mdui/icons/chat.js';

const props = defineProps<{
  open: boolean;
  selectedText: string;
  fullContent: string;
  filePath: string;
}>();

const emit = defineEmits(['close', 'apply']);

const { chatLog, isProcessing, handleAIAction, abortAction, clearChat, getGlobalHistory } = useAI(props);
const userInput = ref('');
const chatContainer = ref<HTMLElement | null>(null);
const viewMode = ref<'chat' | 'history'>('chat');
const globalHistory = ref<any[]>([]);

const loadGlobalHistory = async () => {
  globalHistory.value = await getGlobalHistory();
};

watch(viewMode, (newMode) => {
  if (newMode === 'history') {
    loadGlobalHistory();
  }
});

const prompts = [
  { id: 'restructure', name: 'Restructure', icon: 'reorder' },
  { id: 'clarify', name: 'Clarify', icon: 'lightbulb' },
  { id: 'elaborate', name: 'Elaborate', icon: 'add_circle' },
  { id: 'add_info', name: 'Add Info', icon: 'info' },
  { id: 'add_perspective', name: 'Add Perspective', icon: 'people' },
  { id: 'fact_check', name: 'Fact Check', icon: 'fact_check' },
  { id: 'better_suggestion', name: 'Better Suggestion', icon: 'auto_awesome' },
  { id: 'last_line', name: 'Last Line Cmd', icon: 'terminal' },
];

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

// Auto-scroll when new messages arrive
watch(chatLog, () => {
  scrollToBottom();
}, { deep: true });

const handleAIActionWrapped = async (promptId: string, customText?: string) => {
  userInput.value = '';
  const response = await handleAIAction(promptId, customText);
  if (response && response.content) {
    applyResult(response.content, promptId);
  }
};

const handlePresetClick = (presetName: string) => {
  const currentVal = userInput.value.trim();
  if (!currentVal) {
    userInput.value = presetName;
  } else {
    let parts = currentVal.split(/\s+/).map(s => s.trim()).filter(Boolean);
    if (parts.includes(presetName)) {
      parts = parts.filter(p => p !== presetName);
    } else {
      parts.push(presetName);
    }
    userInput.value = parts.join(' ');
  }
};

const handleQuestionClick = (option: string) => {
  const currentVal = userInput.value.trim();
  if (!currentVal) {
    userInput.value = option;
    return;
  }

  let answers = currentVal.split(',').map(s => s.trim()).filter(Boolean);
  if (answers.includes(option)) {
    answers = answers.filter(a => a !== option);
  } else {
    answers.push(option);
  }
  userInput.value = answers.join(', ');
};

const handleChatSubmit = () => {
  if (!userInput.value.trim() || isProcessing.value) return;
  handleAIActionWrapped('chat', userInput.value.trim());
};

const applyResult = (content: string, promptId?: string) => {
  emit('apply', { content, promptId });
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

const renderMarkdown = (content: string) => {
  return marked.parse(content);
};

const formatTime = (ts: number) => {
  return new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// Swipe DOWN to close logic
let touchStartY = 0;
const onTouchStart = (e: TouchEvent) => {
  touchStartY = e.changedTouches[0].screenY;
};
const onTouchEnd = (e: TouchEvent) => {
  const touchEndY = e.changedTouches[0].screenY;
  // Swipe down (threshold 80px)
  if (touchEndY - touchStartY > 80) {
    emit('close');
  }
};
</script>

<template>
  <div 
    class="ai-panel" 
    :class="{ 'open': open }"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <div class="panel-header">
      <div class="header-title">
        <mdui-icon-auto-awesome style="margin-right: 8px; color: #CDDC39;"></mdui-icon-auto-awesome>
        {{ viewMode === 'chat' ? 'AI Assistant' : 'AI History' }}
      </div>
      <div class="header-actions">
        <mdui-button-icon 
          @click="viewMode = viewMode === 'chat' ? 'history' : 'chat'" 
          :tooltip="viewMode === 'chat' ? 'View History' : 'Back to Chat'"
        >
          <mdui-icon-history v-if="viewMode === 'chat'"></mdui-icon-history>
          <mdui-icon-chat v-else></mdui-icon-chat>
        </mdui-button-icon>
        <mdui-button-icon @click="clearChat" tooltip="Clear Current History" v-if="viewMode === 'chat' && chatLog.length > 0">
          <mdui-icon-delete></mdui-icon-delete>
        </mdui-button-icon>
        <mdui-button-icon @click="emit('close')">
          <mdui-icon-close></mdui-icon-close>
        </mdui-button-icon>
      </div>
    </div>

    <div class="panel-body">
      <!-- Left side: presets & input -->
      <div v-if="viewMode === 'chat'" class="presets-and-input">
        <div class="presets-container">
          <div class="section-title">Presets</div>
          <div class="presets-grid">
            <mdui-button 
              v-for="p in prompts" 
              :key="p.id"
              :variant="userInput.includes(p.name) ? 'filled' : 'tonal'"
              class="preset-btn"
              @click="handlePresetClick(p.name)"
              :disabled="isProcessing"
            >
              {{ p.name }}
            </mdui-button>
          </div>
        </div>
        
        <div class="chat-input-area">
          <div style="display: flex; align-items: center; gap: 8px;">
            <mdui-text-field
              v-model="userInput"
              placeholder="Type an instruction..."
              @keyup.enter="handleChatSubmit"
              :disabled="isProcessing"
              variant="outlined"
              style="flex-grow: 1;"
            >
              <mdui-button-icon 
                slot="end-icon" 
                @click="handleChatSubmit" 
                :disabled="!userInput.trim() || isProcessing"
              >
                <mdui-icon-send></mdui-icon-send>
              </mdui-button-icon>
            </mdui-text-field>
            <mdui-button-icon 
              v-if="isProcessing" 
              @click="abortAction"
              tooltip="Stop generation"
              style="color: #f44336;"
            >
              <mdui-icon-stop-circle></mdui-icon-stop-circle>
            </mdui-button-icon>
          </div>
        </div>
      </div>

      <!-- Right side: chat log or history -->
      <div class="main-content-area">
        <div v-if="viewMode === 'chat'" class="chat-log" ref="chatContainer">
          <div v-if="chatLog.length === 0" class="chat-empty">
            Select a preset or type an instruction to get started.
          </div>
          <div 
            v-for="(msg, index) in chatLog" 
            :key="index" 
            class="chat-msg" 
            :class="msg.role"
          >
            <div class="msg-content" v-html="renderMarkdown(msg.content)"></div>
            
            <div v-if="msg.updatedContent" class="updated-content-badge">
              <span class="badge-text">Suggestion generated</span>
            </div>

            <!-- Multiple Choice Questions -->
            <div v-if="msg.questions && msg.questions.length > 0" class="questions-area">
              <div v-for="(q, qIdx) in msg.questions" :key="qIdx" class="question-item">
                <div class="question-text">{{ q.question }}</div>
                <div class="options-grid">
                  <mdui-button 
                    v-for="(opt, oIdx) in q.options" 
                    :key="oIdx" 
                    :variant="userInput.split(',').map(s => s.trim()).includes(opt) ? 'filled' : 'outlined'" 
                    size="small"
                    @click="handleQuestionClick(opt)"
                    :disabled="isProcessing"
                  >
                    {{ opt }}
                  </mdui-button>
                </div>
              </div>
            </div>

            <div v-if="msg.role === 'model'" class="msg-actions">
              <mdui-button-icon size="small" tooltip="Copy Comment" @click="copyToClipboard(msg.content)">
                <mdui-icon-content-copy style="font-size: 16px;"></mdui-icon-content-copy>
              </mdui-button-icon>
            </div>
          </div>
          <div v-if="isProcessing" class="chat-msg model loading">
            <mdui-linear-progress></mdui-linear-progress>
          </div>
        </div>

        <div v-else class="history-view">
          <div v-if="globalHistory.length === 0" class="chat-empty">
            No conversation history found.
          </div>
          <mdui-list v-else>
            <mdui-list-item 
              v-for="item in globalHistory" 
              :key="item.filePath"
              @click="viewMode = 'chat'"
            >
              <div slot="description">{{ formatTime(item.timestamp) }}</div>
              {{ item.filePath.split('/').pop() }}
              <div class="history-preview">{{ item.content.substring(0, 60) }}...</div>
            </mdui-list-item>
          </mdui-list>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-panel {
  position: fixed;
  bottom: -380px;
  left: 0;
  right: 0;
  height: 380px;
  background-color: rgb(var(--mdui-color-surface-container));
  box-shadow: var(--mdui-elevation-level3);
  z-index: 999;
  display: flex;
  flex-direction: column;
  transition: bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.ai-panel.open {
  bottom: 56px;
}

.panel-header {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.panel-body {
  display: flex;
  flex-direction: row;
  flex: 1;
  overflow: hidden;
}

.presets-and-input {
  width: 320px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  background-color: rgba(var(--mdui-color-surface-container-low), 0.3);
}

.presets-container {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.section-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: rgb(var(--mdui-color-primary));
  margin-bottom: 8px;
  padding-left: 4px;
}

.presets-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.preset-btn {
  --mdui-button-height: 32px;
  font-size: 11px;
  padding: 0 8px;
  text-transform: none;
}

.chat-input-area {
  padding: 12px;
  background-color: rgb(var(--mdui-color-surface-container-high));
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.main-content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-log {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-empty {
  text-align: center;
  opacity: 0.5;
  font-size: 13px;
  margin-top: 40px;
}

.chat-msg {
  max-width: 85%;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 13.5px;
  line-height: 1.5;
  position: relative;
}

.msg-content :deep(p) {
  margin-bottom: 0.5em;
}

.msg-content :deep(p:last-child) {
  margin-bottom: 0;
}

.msg-content :deep(pre) {
  background-color: rgba(0, 0, 0, 0.2);
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 8px 0;
}

.msg-content :deep(code) {
  font-family: 'Fira Code', monospace;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 2px 4px;
  border-radius: 2px;
}

.msg-content :deep(.code-block-wrapper) {
  position: relative;
  margin: 8px 0;
}

.msg-content :deep(.code-block-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
}

.msg-content :deep(.copy-button) {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #CDDC39;
  padding: 0px 4px;
  border-radius: 2px;
  cursor: pointer;
  font-size: 9px;
}

.msg-content :deep(.code-block-wrapper pre) {
  margin-top: 0;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.chat-msg.user {
  align-self: flex-end;
  background-color: rgb(var(--mdui-color-primary-container));
  color: rgb(var(--mdui-color-on-primary-container));
  border-bottom-right-radius: 2px;
}

.chat-msg.model {
  align-self: flex-start;
  background-color: rgb(var(--mdui-color-secondary-container));
  color: rgb(var(--mdui-color-on-secondary-container));
  border-bottom-left-radius: 2px;
}

.chat-msg.loading {
  width: 80px;
  padding: 8px 12px;
}

.updated-content-badge {
  margin-top: 6px;
  font-size: 11px;
  font-weight: 500;
  color: #CDDC39;
  display: flex;
  align-items: center;
  gap: 4px;
}
.updated-content-badge::before {
  content: '●';
  font-size: 8px;
}

.questions-area {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 6px;
}

.question-text {
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 2px;
}

.options-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.msg-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
  gap: 4px;
}

.history-view {
  flex: 1;
  overflow-y: auto;
}

.history-preview {
  font-size: 11px;
  opacity: 0.6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 4px;
}

/* Mobile responsive */
@media (max-width: 767px) {
  .ai-panel {
    height: 400px;
    bottom: -400px;
    top: auto;
  }
  
  .ai-panel.open {
    bottom: 56px;
    top: auto;
  }
  
  .panel-body {
    flex-direction: column;
  }
  
  .presets-and-input {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background-color: transparent;
  }
  
  .presets-container {
    flex: none;
    padding: 6px 12px;
    overflow-y: visible;
  }
  
  .presets-grid {
    display: flex;
    overflow-x: auto;
    gap: 6px;
    padding-bottom: 4px;
    grid-template-columns: none;
  }
  
  .presets-grid::-webkit-scrollbar {
    display: none;
  }
  
  .preset-btn {
    flex-shrink: 0;
  }
  
  .chat-input-area {
    padding: 8px 12px;
  }
}
</style>

