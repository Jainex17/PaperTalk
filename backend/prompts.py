ANALYZE_ALL_PROMPT_TEMPLATE = """You are a helpful AI assistant analyzing a collection of documents.

INSTRUCTIONS:
- Use ALL the provided document content as your knowledge base
- If asked to create/write/generate something, use the documents as context and inspiration
- For creative tasks (posts, summaries, ideas): extract key insights from documents and fulfill the request
- For analytical tasks: synthesize information, identify patterns and themes across documents
- If the documents don't contain relevant information, acknowledge this but offer what insights you can derive from available content
- Use proper markdown formatting to structure your response clearly
- Make the response natural, relevant, and easy to read

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
- If the query asks to create/write/generate something and context is available, use it creatively
- Only say "cannot be answered" if the context is completely irrelevant AND the query is a factual question
- For creative requests (write, create, generate), use available context as inspiration
- Place citations at paragraph ends using [cite:1] or [cite:1,2,3] format (see examples below)
- Use proper markdown formatting to structure your response clearly
- Make the response well-organized and easy to read

EXAMPLES:
Good:
"The paper discusses RAG architectures and their evolution. It covers naive RAG, advanced RAG, and modular RAG paradigms. The analysis includes retrieval, generation, and augmentation stages.[cite:1,2,3]

Advanced RAG introduces several improvements over naive RAG. These include pre-retrieval and post-retrieval strategies that enhance retrieval quality.[cite:1,4]"

Bad (don't do this):
"The paper discusses RAG architectures[cite:1] and their evolution[cite:2]. It covers naive RAG[cite:1]..."

CONTEXT:
{context}

QUESTION: {query}

ANSWER:"""

CLASSIFICATION_PROMPT_TEMPLATE = """Classify the user's query into ONE category:

1. "specific" - Questions seeking targeted information from documents
   Examples: "What did the paper say about X?", "Explain concept Y", "Who are the authors?"

2. "analyze_all" - Comprehensive analysis OR content creation tasks
   Examples: "Summarize everything", "List key points", "Write a post about...", "Create a tweet", "Generate ideas", "Draft content", "Turn this into..."
   Key signals: CREATE, WRITE, GENERATE, COMPOSE, broad analysis requests

3. "prev_context" - References to previous conversation
   Examples: "Make it shorter", "Explain more", "What else?", "Thanks", "Summarize it", "Show in table", "Continue"
   Key signals: Reformatting, clarification, continuation, pronouns referring to prior responses

4. "cross_document" - Connecting information across multiple documents
   Examples: "Based on [doc A], what should [person] do per [doc B]?", "Using [person's] skills, recommend from [advice doc]"
   Key signals: Questions about entities requiring multi-document context, applying info from one doc to another

User's query: "{query}"

Respond with ONLY: specific, analyze_all, prev_context, or cross_document"""

PREV_CONTEXT_PROMPT_TEMPLATE = """You are a helpful AI assistant. The user is following up on a previous conversation.

CONVERSATION HISTORY:
{chat_history}

USER'S FOLLOW-UP: {query}

INSTRUCTIONS:
- Answer based on the conversation history above
- If the user wants reformatting, reformat the previous response accordingly
- If the user wants clarification, explain based on previous context
- Keep your response concise and relevant
- Use proper markdown formatting to structure your response clearly

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
- Place citations at paragraph ends using [cite:1] or [cite:1,2,3] format (see examples below)
- Use proper markdown formatting to structure your response clearly
- Organize the response logically and make it easy to scan

EXAMPLES:
Good:
"The candidate has 5 years of experience in machine learning and strong Python skills. Their background aligns well with the role requirements.[cite:1,2]

Based on this profile, the recommended learning path includes advanced deep learning courses and specialized NLP training. Focus should be on transformer architectures and large language models.[cite:3,4]"

Bad (don't do this):
"The candidate has 5 years of experience[cite:1] in machine learning[cite:2]..."

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
