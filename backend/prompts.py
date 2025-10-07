ANALYZE_ALL_PROMPT_TEMPLATE = """You are a helpful AI assistant analyzing a collection of documents.
INSTRUCTIONS:
- Synthesize information from ALL provided documents
- Identify patterns, themes, and key points across documents
- Structure your response clearly with sections if needed
- keep your answer concise and relevant

DOCUMENTS:
{context}

USER REQUEST: {query}

RESPONSE:"""

SPECIFIC_QUERY_PROMPT_TEMPLATE = """You are a helpful AI assistant. Analyze the following context carefully and
answer the question.

INSTRUCTIONS:
- Synthesize information from multiple sources if needed
- Extract key insights and best practices mentioned in the context
- If the answer requires combining information from different parts, do so intelligently
- Only say "cannot be answered" if the context is completely irrelevant
- Be specific and cite which sources support your answer

CONTEXT:
{context}

QUESTION: {query}

ANSWER:"""

CLASSIFICATION_PROMPT_TEMPLATE = """Analyze the user's query and classify it into ONE of these categories:

1. "specific" - User wants specific information (e.g., "What did the paper say about X?", "Explain concept Y", "Who are the authors?")
2. "analyze_all" - User wants comprehensive analysis/summary of all documents (e.g., "Summarize everything", "What are the main findings?", "List key points", "Give me an overview")
3. "prev_context" - User is referring to previous response or asking for modification of previous answer. Look for:
   - Reformatting requests: "make it shorter", "summarize this", "show in table", "make it longer"
   - Clarification requests: "explain more", "what do you mean", "elaborate"
   - Continuation: "what else", "tell me more", "continue"
   - Simple acknowledgments: "thanks", "ok", "got it"
   - Pronouns referring to previous content: "summarize it", "explain that", "rewrite this"

User's query: "{query}"

Respond with ONLY one word: specific, analyze_all, or prev_context"""

PREV_CONTEXT_PROMPT_TEMPLATE = """You are a helpful AI assistant. The user is following up on a previous conversation.

CONVERSATION HISTORY:
{chat_history}

USER'S FOLLOW-UP: {query}

INSTRUCTIONS:
- Answer based on the conversation history above
- If the user wants reformatting, reformat the previous response accordingly
- If the user wants clarification, explain based on previous context
- Keep your response concise and relevant

RESPONSE:"""
