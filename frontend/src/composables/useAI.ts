import { ref } from 'vue';
import { aiApi } from '@/api';
import { useFileStore } from '@/stores/fileStore';
import { useSettingsStore } from '@/stores/settingsStore';

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
    
    const displayMessage = customText ? customText : `Apply ${promptId} to ${selection ? 'selection' : 'full content'}`;
    
    chatLog.value.push({ role: 'user', content: displayMessage });
    isProcessing.value = true;

    try {
      const history = chatLog.value.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      const response = await aiApi.process(
        promptId, 
        fullContent, 
        customText || selection, 
        history, 
        fileList, 
        settingsStore.aiInstructions
      );
      
      chatLog.value.push({ 
        role: 'model', 
        content: response.comment,
        promptId,
        updatedContent: response.content,
        questions: response.questions
      });
      
      return response;
    } catch (error) {
      console.error('AI error:', error);
      chatLog.value.push({ role: 'model', content: 'Sorry, I encountered an error processing your request.' });
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
