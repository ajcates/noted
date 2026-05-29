export type PromptBuilder = (
  instructionPrefix: string,
  contextInfo: string,
  selection: string,
  fullContent: string
) => string;

export const prompts: Record<string, PromptBuilder> = {
  restructure: (prefix, context, selection, content) =>
    `${prefix}Restructure the following note to improve logical flow and structural clarity. Group related ideas, use headings, and bulleted lists where appropriate. Focus on the selection if provided.${context}\n\nSelection: ${selection || 'None'}\n\nFull Content:\n${content}`,
    
  clarify: (prefix, context, selection, content) =>
    `${prefix}Clarify the following note by simplifying complex language and rephrasing jargon or convoluted sentences. Focus on the selection if provided.${context}\n\nSelection: ${selection || 'None'}\n\nFull Content:\n${content}`,
    
  elaborate: (prefix, context, selection, content) =>
    `${prefix}Elaborate on the following note by adding depth, explanations, and context. Build upon existing ideas with examples. Focus on the selection if provided.${context}\n\nSelection: ${selection || 'None'}\n\nFull Content:\n${content}`,
    
  add_info: (prefix, context, selection, content) =>
    `${prefix}Identify and fill in missing gaps in the following note. Inject relevant facts, definitions, or supplementary details. Focus on the selection if provided.${context}\n\nSelection: ${selection || 'None'}\n\nFull Content:\n${content}`,
    
  add_perspective: (prefix, context, selection, content) =>
    `${prefix}Introduce alternative viewpoints, counter-arguments, or different professional/cultural angles to the following note. Focus on the selection if provided.${context}\n\nSelection: ${selection || 'None'}\n\nFull Content:\n${content}`,
    
  fact_check: (prefix, context, selection, content) =>
    `${prefix}Fact check the following note for accuracy and logical soundness. Highlight potentially inaccurate claims and suggest corrections. Focus on the selection if provided.${context}\n\nSelection: ${selection || 'None'}\n\nFull Content:\n${content}`,
    
  better_suggestion: (prefix, context, selection, content) =>
    `${prefix}Generate 4 distinct stylistic variations (e.g., professional, casual, concise, persuasive) for the following content. Present them ONLY as options in the "questions" field of your JSON response, with the question being "Which style do you prefer?". Set "content" to null in your response.${context}\n\nSelection: ${selection || 'None'}\n\nFull Content:\n${content}`,
    
  last_line: (prefix, context, selection, content) => {
    const lines = (content || '').trim().split('\n');
    const lastLine = lines[lines.length - 1];
    const precedingContent = lines.slice(0, -1).join('\n');
    return `${prefix}Execute the following command on the preceding content. Replace or append the result as appropriate.${context}\n\nCommand: "${lastLine}"\n\nPreceding Content:\n${precedingContent}`;
  },
  
  chat: (prefix, context, selection, content) =>
    `${prefix}User message: ${selection || ''}\n\nNote Context:\n${content}${context}`,
};

export const defaultPrompt: PromptBuilder = (prefix, context, selection, content) =>
  `${prefix}Process the following note based on user request. Focus on selection if provided.${context}\n\nSelection: ${selection || 'None'}\n\nFull Content:\n${content}`;
