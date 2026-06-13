import { ref, onMounted, watch } from 'vue';
import { aiApi, filesApi } from '@/api';
import { useFileStore } from '@/stores/fileStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { db } from '@/utils/db';

export interface ChatMessage {
  id?: number;
  role: 'user' | 'model';
  content: string;
  promptId?: string;
  updatedContent?: string | null;
  questions?: { question: string, options: string[] }[];
  timestamp?: number;
}

export function useAI(props: { selectedText: string, fullContent: string, filePath: string }) {
  const fileStore = useFileStore();
  const settingsStore = useSettingsStore();

  const chatLog = ref<ChatMessage[]>([]);
  const isProcessing = ref(false);
  const currentController = ref<AbortController | null>(null);

  const loadHistory = async () => {
    const history = await db.aiHistory
      .where('filePath')
      .equals(props.filePath)
      .sortBy('timestamp');
    chatLog.value = history;
  };

  onMounted(() => {
    loadHistory();
  });

  // Reload history when filePath changes
  watch(() => props.filePath, () => {
    loadHistory();
  });

  const saveMessage = async (msg: ChatMessage) => {
    const entry = {
      ...msg,
      filePath: props.filePath,
      timestamp: Date.now()
    };
    const id = await db.aiHistory.add(entry as any);
    msg.id = id as number;
  };

  const handleAIAction = async (promptId: string, customText?: string) => {
    let modelMsgIndex: number | undefined;
    const selection = props.selectedText;
    const fullContent = props.fullContent;
    const fileList = fileStore.fileList;
    
    const rawInput = customText || selection;
    const displayMessage = customText ? customText : `Apply ${promptId} to ${selection ? 'selection' : 'full content'}`;
    
    const userMsg: ChatMessage = { role: 'user', content: displayMessage };
    chatLog.value.push(userMsg);
    await saveMessage(userMsg);
    
    isProcessing.value = true;
    currentController.value = new AbortController();

    try {
      // ... (context injection logic)
      let injectedContext = '';
      const contextMatches = rawInput?.match(/@([\w.-]+\.md)/g) || [];
      
      for (const match of contextMatches) {
        const filename = match.substring(1);
        const fileMeta = fileStore.files.find(f => f.name === filename);
        const filePath = fileMeta ? fileMeta.path : filename;
        
        try {
          let content = '';
          const cached = await db.files.get(filePath);
          if (cached) {
            content = cached.content;
          } else if (fileStore.isOnline) {
            content = await filesApi.read(filePath);
          }
          
          if (content) {
            injectedContext += `\n--- Context from @${filename} ---\n${content}\n----------------------------\n`;
          }
        } catch (e) {
          console.warn(`Failed to inject context for ${filename}`, e);
        }
      }

      const history = chatLog.value.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      if (injectedContext && history.length > 0) {
        history[history.length - 1].parts[0].text = injectedContext + "\nUser Input:\n" + history[history.length - 1].parts[0].text;
      }

      modelMsgIndex = chatLog.value.push({ role: 'model', content: '' }) - 1;

      const response = await aiApi.streamProcess(
        promptId, 
        fullContent, 
        rawInput, 
        history, 
        (partialText) => {
          const commentMatch = partialText.match(/"comment":\s*"((?:[^"\\]|\\.)*)/);
          if (commentMatch) {
            let comment = commentMatch[1];
            comment = comment.replace(/\\n/g, '\n').replace(/\\"/g, '"');
            if (modelMsgIndex !== undefined) {
              chatLog.value[modelMsgIndex].content = comment;
            }
          }
        },
        fileList, 
        settingsStore.aiInstructions,
        currentController.value.signal
      );
      
      if (modelMsgIndex !== undefined) {
        const modelMsg: ChatMessage = { 
          role: 'model', 
          content: response.comment,
          promptId,
          updatedContent: response.content,
          questions: response.questions
        };
        chatLog.value[modelMsgIndex] = modelMsg;
        await saveMessage(modelMsg);
      }
      
      return response;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('AI generation aborted');
        if (modelMsgIndex !== undefined && chatLog.value[modelMsgIndex]) {
          const msg = chatLog.value[modelMsgIndex];
          msg.content += '\n\n[Generation stopped by user]';
          await saveMessage(msg);
        }
        return;
      }
      console.error('AI error:', error);
      const errorMsg = error.message || 'Sorry, I encountered an error processing your request.';
      if (modelMsgIndex !== undefined && chatLog.value[modelMsgIndex]) {
        const msg = chatLog.value[modelMsgIndex];
        msg.content = errorMsg;
        await saveMessage(msg);
      } else {
        const errorModelMsg: ChatMessage = { role: 'model', content: errorMsg };
        chatLog.value.push(errorModelMsg);
        await saveMessage(errorModelMsg);
      }
      throw error;
    } finally {
      isProcessing.value = false;
      currentController.value = null;
    }
  };

  const abortAction = () => {
    if (currentController.value) {
      currentController.value.abort();
    }
  };

  const clearChat = async () => {
    chatLog.value = [];
    await db.aiHistory.where('filePath').equals(props.filePath).delete();
  };

  const getGlobalHistory = async () => {
    const all = await db.aiHistory.toArray();
    // Group by filePath and get the latest message for each
    const grouped = all.reduce((acc: any, msg) => {
      if (!acc[msg.filePath] || acc[msg.filePath].timestamp < msg.timestamp) {
        acc[msg.filePath] = msg;
      }
      return acc;
    }, {});
    return Object.values(grouped).sort((a: any, b: any) => b.timestamp - a.timestamp);
  };

  return {
    chatLog,
    isProcessing,
    handleAIAction,
    abortAction,
    clearChat,
    getGlobalHistory
  };
}
