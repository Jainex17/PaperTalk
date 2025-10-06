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
