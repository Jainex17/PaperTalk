MAX_CONTEXT_TOKENS_ANALYZE_ALL = 4000
MAX_CONTEXT_TOKENS_SPECIFIC = 3000
MAX_OUTPUT_TOKENS = 8192

TOP_K_CHUNKS = 10
MAX_CHUNKS_ANALYZE_ALL = 30
MAX_RELEVANT_CHUNKS = 5
DISTANCE_THRESHOLD = 1.0

CHUNK_TOKENS = 500
CHUNK_OVERLAP = 100

MAX_FILE_SIZE_MB = 5
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
MAX_PDF_PAGES = 25
MAX_TEXT_CHARACTERS = 50000  # Max characters for pasted text (roughly equivalent to 5MB text file)
ALLOWED_FILE_EXTENSIONS = ('.pdf', '.txt', '.md')

GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_MODELS = {
    "gemini-3.5-flash": "gemini-3.5-flash",
    "gemini-3.1-flash-lite": "gemini-3.1-flash-lite",
    "gemini-2.5-pro": "gemini-2.5-pro",
    "gemini-2.5-flash": "gemini-2.5-flash",
    "gemini-2.5-flash-lite": "gemini-2.5-flash-lite",
}

OPENROUTER_MODEL = "openai/gpt-oss-20b:free"
OPENROUTER_MODELS = {
    "openai/gpt-oss-20b:free": "openai/gpt-oss-20b:free",
    "openai/gpt-oss-120b:free": "openai/gpt-oss-120b:free",
    "google/gemma-4-31b-it:free": "google/gemma-4-31b-it:free",
    "z-ai/glm-4.5-air:free": "z-ai/glm-4.5-air:free",
    "meta-llama/llama-3.3-70b-instruct:free": "meta-llama/llama-3.3-70b-instruct:free",
    "qwen/qwen3-coder:free": "qwen/qwen3-coder:free",
    "nvidia/nemotron-3-super-120b-a12b:free": "nvidia/nemotron-3-super-120b-a12b:free",
}

TEMPERATURE = 0.4
TOP_P = 0.9
TOP_K = 40

TIKTOKEN_ENCODING = "cl100k_base"

QUERY_TYPE_ANALYZE_ALL = "analyze_all"
QUERY_TYPE_SPECIFIC = "specific"
QUERY_TYPE_PREV_CONTEXT = "prev_context"
QUERY_TYPE_CROSS_DOCUMENT = "cross_document"

MAX_CONTEXT_TOKENS_CROSS_DOCUMENT = 5000

DEFAULT_SPACE_NAME = "Untitled Space"

OPENROUTER_API_KEY = "z-ai/glm-4.5-air:free"