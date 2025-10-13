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
- IMPORTANT: Cite sources using the format (Source 1), (Source 2), etc. exactly as they appear in the context
- Add citations immediately after relevant statements

CONTEXT:
{context}

QUESTION: {query}

ANSWER:"""

CLASSIFICATION_PROMPT_TEMPLATE = """Analyze the user's query and classify it into ONE of these categories:

1. "specific" - User wants specific information from a single document (e.g., "What did the paper say about X?", "Explain concept Y", "Who are the authors?")
2. "analyze_all" - User wants comprehensive analysis/summary of all documents (e.g., "Summarize everything", "What are the main findings?", "List key points", "Give me an overview")
3. "prev_context" - User is referring to previous response or asking for modification of previous answer. Look for:
   - Reformatting requests: "make it shorter", "summarize this", "show in table", "make it longer"
   - Clarification requests: "explain more", "what do you mean", "elaborate"
   - Continuation: "what else", "tell me more", "continue"
   - Simple acknowledgments: "thanks", "ok", "got it"
   - Pronouns referring to previous content: "summarize it", "explain that", "rewrite this"
4. "cross_document" - User wants to connect/apply information from multiple documents. Look for:
   - Questions about a person/entity that require combining their info with advice/content from other documents
   - "Based on [document A], what should [person] do according to [document B]"
   - "Using [person's] background, suggest [advice/path] from [other document]"
   - Queries mentioning specific people/entities that need context from multiple sources
   - "What skills does [person] have?" when person info is in one doc but query context suggests cross-reference
   - Questions that implicitly need information from one document to properly answer using another

IMPORTANT: If the query mentions a specific person, entity, or situation that likely requires information from multiple documents to answer properly, classify as "cross_document".

User's query: "{query}"

Respond with ONLY one word: specific, analyze_all, prev_context, or cross_document"""

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

CROSS_DOCUMENT_PROMPT_TEMPLATE = """You are a helpful AI assistant performing cross-document analysis.

The user wants to connect information from multiple documents. Your task is to:
1. Extract relevant information from the SOURCE document(s)
2. Use that information to query/apply insights from the TARGET document(s)
3. Synthesize a comprehensive answer

DOCUMENT CONTEXT:
{context}

USER REQUEST: {query}

INSTRUCTIONS:
- Identify which document(s) serve as the source and which as the target
- Extract key information from source document(s)
- Apply or connect that information with content from target document(s)
- Provide a clear, actionable response that bridges both documents
- IMPORTANT: Cite sources using the format (Source 1), (Source 2), etc. exactly as they appear in the context
- Add citations immediately after relevant statements to show which document each piece of information comes from

RESPONSE:"""

EXTRACT_SOURCE_INFO_TEMPLATE = """You are extracting key information from a source document to answer a cross-document query.

SOURCE DOCUMENT CHUNKS:
{source_chunks}

ORIGINAL USER QUERY: {original_query}

TASK: Extract the most important information from the source document that will help answer the user's query.
Focus on:
- Person names, backgrounds, skills, experience, and attributes
- Key facts, themes, or context mentioned in the query
- Specific details that would help find relevant advice or information in other documents
- Professional background, education, or expertise areas

Be specific and include person names and their key characteristics.

EXTRACTED KEY INFORMATION:"""
