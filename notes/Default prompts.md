# Default Prompts & Descriptions

This document outlines the default AI prompts to be implemented in the 'noted' application, detailing the exact behavior, goals, and target outcomes for each action.

### Content Refinement & Structure
- **Restructure:** Reorganize the information within the note to improve logical flow, readability, and structural clarity. 
  - *Behavior:* Group related ideas together, establish a clear hierarchy using Markdown headings, convert dense paragraphs into bulleted lists where appropriate, and ensure chronological or thematic consistency without altering the core message.
- **Clarify:** Simplify complex or ambiguous language to make the content highly accessible.
  - *Behavior:* Identify jargon, passive voice, or convoluted sentence structures and rephrase them. When encountering highly ambiguous statements, the AI should flag them and suggest clearer alternatives.

### Content Expansion
- **Elaborate:** Expand on the existing ideas by adding depth, explanations, and context.
  - *Behavior:* Analyze the current concepts in the note and build upon them by providing detailed explanations, illustrative examples, and foundational context that enriches the reader's understanding.
- **Add Info:** Identify and fill in missing gaps in the content.
  - *Behavior:* Scan the text for logical gaps, missing steps in a process, or omitted historical/technical context, and seamlessly inject relevant facts, definitions, or supplementary details.
- **Add Perspective:** Introduce alternative viewpoints to foster critical thinking and well-rounded notes.
  - *Behavior:* Analyze the stance of the text and introduce counter-arguments, objective pros and cons, or alternative professional/cultural angles to give the content more balance.

### Quality Control
- **Fact Check:** Review the text for factual accuracy and logical soundness.
  - *Behavior:* Scan the note for names, dates, historical events, scientific claims, or statistics. Highlight claims that seem inaccurate or unverified, and suggest corrected data or add a disclaimer advising verification.

### Interactive & Custom Actions
- **Better Suggestion:** Generate alternative stylistic variations of the content to give the user creative choices.
  - *Behavior:* Generate 4 distinct rewrites of the selected content (e.g., professional, casual, concise, and persuasive) and present them as interactive options using multiple-choice questions for the user to select and apply.
- **Last Line Command:** Allow the user to execute custom ad-hoc instructions directly from the document.
  - *Behavior:* Treat the very last line of the note as a direct command to the AI (e.g., "Translate the above to Spanish" or "Summarize this into three bullet points"). The AI executes this command specifically on the preceding content and replaces or appends the result accordingly.