<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { aiApi } from '@/api';
import '@mdui/icons/close.js';
import '@mdui/icons/send.js';
import '@mdui/icons/auto-awesome.js';
import '@mdui/icons/content-copy.js';
import '@mdui/icons/check.js';

const props = defineProps<{
  open: boolean;
  selectedText: string;
  fullContent: string;
}>();

const emit = defineEmits(['close', 'apply']);

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  updatedContent?: string | null;
  questions?: { question: string, options: string[] }[];
}

const chatLog = ref<ChatMessage[]>([]);
const userInput = ref('');
const isProcessing = ref(false);
const chatContainer = ref<HTMLElement | null>(null);

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

const handleAIAction = async (promptId: string, customText?: string) => {
  const selection = props.selectedText;
  const fullContent = props.fullContent;
  
  const displayMessage = customText ? customText : `Apply ${promptId} to ${selection ? 'selection' : 'full content'}`;
  
  chatLog.value.push({ role: 'user', content: displayMessage });
  isProcessing.value = true;
  userInput.value = '';
  await scrollToBottom();

  try {
    const history = chatLog.value.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    const response = await aiApi.process(promptId, fullContent, customText || selection, history);
    
    chatLog.value.push({ 
      role: 'model', 
      content: response.comment,
      updatedContent: response.content,
      questions: response.questions
    });
  } catch (error) {
    console.error('AI error:', error);
    chatLog.value.push({ role: 'model', content: 'Sorry, I encountered an error processing your request.' });
  } finally {
    isProcessing.value = false;
    await scrollToBottom();
  }
};

const handleQuestionClick = (option: string) => {
  handleAIAction('chat', option);
};

const handleChatSubmit = () => {
  if (!userInput.value.trim() || isProcessing.value) return;
  handleAIAction('chat', userInput.value.trim());
};

const applyResult = (content: string) => {
  emit('apply', content);
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};
</script>

<template>
  <div class="ai-panel" :class="{ 'open': open }">
    <div class="panel-header">
      <div class="header-title">
        <mdui-icon-auto-awesome style="margin-right: 8px; color: #CDDC39;"></mdui-icon-auto-awesome>
        AI Assistant
      </div>
      <mdui-button-icon @click="emit('close')">
        <mdui-icon-close></mdui-icon-close>
      </mdui-button-icon>
    </div>

    <div class="presets-grid">
      <mdui-button 
        v-for="p in prompts" 
        :key="p.id"
        variant="tonal"
        class="preset-btn"
        @click="handleAIAction(p.id)"
        :disabled="isProcessing"
      >
        {{ p.name }}
      </mdui-button>
    </div>

    <div class="chat-log" ref="chatContainer">
      <div v-if="chatLog.length === 0" class="chat-empty">
        Select a preset above or type an instruction below to get started.
      </div>
      <div 
        v-for="(msg, index) in chatLog" 
        :key="index" 
        class="chat-msg" 
        :class="msg.role"
      >
        <div class="msg-content">{{ msg.content }}</div>
        
        <!-- Updated Content Preview/Apply -->
        <div v-if="msg.updatedContent" class="updated-content-alert">
          <div class="alert-text">AI suggested changes to the note.</div>
          <mdui-button variant="filled" size="small" @click="applyResult(msg.updatedContent)">
            Apply Changes
          </mdui-button>
        </div>

        <!-- Multiple Choice Questions -->
        <div v-if="msg.questions && msg.questions.length > 0" class="questions-area">
          <div v-for="(q, qIdx) in msg.questions" :key="qIdx" class="question-item">
            <div class="question-text">{{ q.question }}</div>
            <div class="options-grid">
              <mdui-button 
                v-for="(opt, oIdx) in q.options" 
                :key="oIdx" 
                variant="outlined" 
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

    <div class="chat-input-area">
      <mdui-text-field
        v-model="userInput"
        placeholder="Type an instruction..."
        @keyup.enter="handleChatSubmit"
        :disabled="isProcessing"
        variant="outlined"
        class="chat-input"
      >
        <mdui-button-icon 
          slot="end-icon" 
          @click="handleChatSubmit" 
          :disabled="!userInput.trim() || isProcessing"
        >
          <mdui-icon-send></mdui-icon-send>
        </mdui-button-icon>
      </mdui-text-field>
    </div>
  </div>
</template>

<style scoped>
.ai-panel {
  position: fixed;
  top: 56px;
  right: -320px;
  width: 320px;
  height: calc(100dvh - 56px);
  background-color: rgb(var(--mdui-color-surface-container));
  box-shadow: var(--mdui-elevation-level3);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.ai-panel.open {
  right: 0;
}

.panel-header {
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-title {
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 16px;
}

.presets-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.preset-btn {
  --mdui-button-height: 36px;
  font-size: 12px;
}

.chat-log {
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-empty {
  text-align: center;
  opacity: 0.5;
  font-size: 13px;
  margin-top: 40px;
}

.chat-msg {
  max-width: 90%;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  position: relative;
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
  width: 100px;
  padding: 12px;
}

.updated-content-alert {
  margin-top: 12px;
  padding: 8px;
  background-color: rgba(205, 220, 57, 0.1);
  border: 1px dashed #CDDC39;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alert-text {
  font-size: 12px;
  font-weight: 500;
  color: #CDDC39;
}

.questions-area {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.question-text {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
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

.chat-input-area {
  padding: 16px;
  background-color: rgb(var(--mdui-color-surface-container-high));
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-input {
  width: 100%;
}

/* Mobile adjustments */
@media (max-width: 600px) {
  .ai-panel {
    width: 100%;
    right: -100%;
  }
}
</style>
