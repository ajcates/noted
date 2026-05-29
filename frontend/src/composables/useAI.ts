import { ref } from 'vue';
import { aiApi, filesApi } from '@/api';
import { useFileStore } from '@/stores/fileStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { db } from '@/utils/db';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  promptId?: string;
  updatedContent?: string | null;
  questions?: { question: string, options: string[] }[];
}

export function useAI(props: { selectedText: string, fullContent: string }) {
  const fileStore = useFileStore();
  const settingsStore = useSettingsStore();

  const chatLog = ref<ChatMessage[]>([]);
  const isProcessing = ref(false);

  const handleAIAction = async (promptId: string, customText?: string) => {
    const selection = props.selectedText;
    const fullContent = props.fullContent;
    const fileList = fileStore.fileList;
    
    const rawInput = customText || selection;
    const displayMessage = customText ? customText : `Apply ${promptId} to ${selection ? 'selection' : 'full content'}`;
    
    chatLog.value.push({ role: 'user', content: displayMessage });
    isProcessing.value = true;

    try {
      // Context Injection: find @filename references
      let injectedContext = '';
      const contextMatches = rawInput?.match(/@([\w.-]+\.md)/g) || [];
      
      for (const match of contextMatches) {
        const filename = match.substring(1);
        // Try to find the full path if it's just a filename
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

      // Prepend context to the last user message in history
      if (injectedContext && history.length > 0) {
        history[history.length - 1].parts[0].text = injectedContext + "\nUser Input:\n" + history[history.length - 1].parts[0].text;
      }

      // Add placeholder for model response
      const modelMsgIndex = chatLog.value.push({ role: 'model', content: '' }) - 1;

      const response = await aiApi.streamProcess(
        promptId, 
        fullContent, 
        rawInput, 
        history, 
        fileList, 
        settingsStore.aiInstructions,
        (partialText) => {
          // Attempt to extract the comment from partial JSON
          const commentMatch = partialText.match(/"comment":\s*"((?:[^"\\]|\\.)*)/);
          if (commentMatch) {
            let comment = commentMatch[1];
            // Unescape common JSON escapes
            comment = comment.replace(/\\n/g, '\n').replace(/\\"/g, '"');
            chatLog.value[modelMsgIndex].content = comment;
          } else {
            // If we can't find the comment yet, just show a loading indicator or similar
            // But usually it starts with {"comment": "
          }
        }
      );
      
      // Final update with the parsed response
      chatLog.value[modelMsgIndex] = { 
        role: 'model', 
        content: response.comment,
        promptId,
        updatedContent: response.content,
        questions: response.questions
      };
      
      return response;
    } catch (error: any) {
      console.error('AI error:', error);
      const errorMsg = error.message || 'Sorry, I encountered an error processing your request.';
      if (modelMsgIndex !== undefined && chatLog.value[modelMsgIndex]) {
        chatLog.value[modelMsgIndex].content = errorMsg;
      } else {
        chatLog.value.push({ role: 'model', content: errorMsg });
      }
      throw error;
    } finally {
      isProcessing.value = false;
    }
  };

  const clearChat = () => {
    chatLog.value = [];
  };

  return {
    chatLog,
    isProcessing,
    handleAIAction,
    clearChat
  };
}
