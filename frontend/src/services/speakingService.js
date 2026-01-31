/**
 * Speaking practice service for API interactions.
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Get authentication headers from localStorage.
 * Uses the same approach as other services for consistency.
 */
const getAuthHeaders = () => {
    // Try the direct token storage (used by email/password login and AuthContext)
    const token = localStorage.getItem('token');
    if (token) {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }
    
    return {
        'Content-Type': 'application/json'
    };
};

/**
 * Extract error message from response or error object
 */
const getErrorMessage = (error, defaultMessage) => {
    if (!error) {
        return defaultMessage;
    }
    if (typeof error === 'string') {
        return error;
    }
    if (error && typeof error === 'object') {
        // Handle FastAPI detail which could be a string or array of validation errors
        if (error.detail) {
            if (typeof error.detail === 'string') {
                return error.detail;
            }
            // FastAPI validation errors are arrays
            if (Array.isArray(error.detail) && error.detail.length > 0) {
                const firstError = error.detail[0];
                return firstError.msg || firstError.message || JSON.stringify(firstError);
            }
            // If detail is some other object, stringify it
            if (typeof error.detail === 'object') {
                return error.detail.msg || error.detail.message || JSON.stringify(error.detail);
            }
        }
        return error.message || error.error || defaultMessage;
    }
    return defaultMessage;
};

export const speakingService = {
    /**
     * Get a new practice session with random words and a generated question.
     * @param {Object} options - Filter options
     * @param {string} options.theme - Optional theme to filter questions by
     * @param {string} options.level - Optional CEFR level to filter by (A1, A2, B1, etc.)
     * @returns {Promise<{question: {text: string, text_en?: string, theme?: string, level?: string, audioUrl?: string}, targetWords: Array, maxDuration: number}>}
     */
    getPracticeSession: async ({ theme = null, level = null } = {}) => {
        try {
            const params = new URLSearchParams();
            if (theme) params.append('theme', theme);
            if (level) params.append('level', level);
            
            let url = `${API_URL}/speaking/practice`;
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            
            const response = await fetch(url, {
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Session expired. Please log in again.');
                }
                const errorData = await response.json().catch(() => null);
                throw new Error(getErrorMessage(errorData, 'Failed to fetch practice session'));
            }
            
            return await response.json();
        } catch (error) {
            console.error("Error fetching practice session:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(getErrorMessage(error, 'Failed to fetch practice session'));
        }
    },

    /**
     * Get available question themes.
     * @param {string} level - Optional level to filter themes by
     * @returns {Promise<string[]>}
     */
    getThemes: async (level = null) => {
        try {
            let url = `${API_URL}/speaking/questions/themes`;
            if (level) {
                url += `?level=${encodeURIComponent(level)}`;
            }
            
            const response = await fetch(url, {
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Session expired. Please log in again.');
                }
                const errorData = await response.json().catch(() => null);
                throw new Error(getErrorMessage(errorData, 'Failed to fetch themes'));
            }
            
            return await response.json();
        } catch (error) {
            console.error("Error fetching themes:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(getErrorMessage(error, 'Failed to fetch themes'));
        }
    },

    /**
     * Get available CEFR levels.
     * @returns {Promise<string[]>}
     */
    getLevels: async () => {
        try {
            const response = await fetch(`${API_URL}/speaking/questions/levels`, {
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Session expired. Please log in again.');
                }
                const errorData = await response.json().catch(() => null);
                throw new Error(getErrorMessage(errorData, 'Failed to fetch levels'));
            }
            
            return await response.json();
        } catch (error) {
            console.error("Error fetching levels:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(getErrorMessage(error, 'Failed to fetch levels'));
        }
    },

    /**
     * Get a random speaking question.
     * @param {Object} options - Filter options
     * @param {string} options.theme - Optional theme to filter by
     * @param {string} options.level - Optional CEFR level to filter by
     * @returns {Promise<{id: number, level: string, theme: string, question: string, question_en: string, target_words: string[]}>}
     */
    getRandomQuestion: async ({ theme = null, level = null } = {}) => {
        try {
            const params = new URLSearchParams();
            if (theme) params.append('theme', theme);
            if (level) params.append('level', level);
            
            let url = `${API_URL}/speaking/questions/random`;
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            
            const response = await fetch(url, {
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Session expired. Please log in again.');
                }
                const errorData = await response.json().catch(() => null);
                throw new Error(getErrorMessage(errorData, 'Failed to fetch random question'));
            }
            
            return await response.json();
        } catch (error) {
            console.error("Error fetching random question:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(getErrorMessage(error, 'Failed to fetch random question'));
        }
    },

    /**
     * Submit an audio recording for analysis.
     * @param {Blob} audioBlob - The recorded audio blob
     * @param {string} questionText - The question that was asked
     * @param {Array} targetWords - Array of target word objects
     * @returns {Promise<Object>} - Analysis result including score, feedback, etc.
     */
    submitRecording: async (audioBlob, questionText, targetWords) => {
        try {
            const formData = new FormData();
            
            // Append audio file - try to use webm format, fallback to mp3
            const mimeType = audioBlob.type || 'audio/webm';
            const extension = mimeType.includes('webm') ? 'webm' : 'mp3';
            formData.append('audio', audioBlob, `recording.${extension}`);
            
            // Append question and target words
            formData.append('questionText', questionText);
            formData.append('targetWords', JSON.stringify(targetWords));
            
            // For FormData, only include Authorization header, not Content-Type
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            
            const response = await fetch(`${API_URL}/speaking/analyze`, {
                method: 'POST',
                headers: headers,
                body: formData
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Session expired. Please log in again.');
                }
                const errorData = await response.json().catch(() => null);
                throw new Error(getErrorMessage(errorData, 'Failed to analyze recording'));
            }
            
            return await response.json();
        } catch (error) {
            console.error("Error submitting recording:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(getErrorMessage(error, 'Failed to analyze recording'));
        }
    },

    /**
     * Get the user's speaking practice history.
     * @param {number} skip - Number of records to skip (for pagination)
     * @param {number} limit - Maximum number of records to return
     * @returns {Promise<{sessions: Array, total: number}>}
     */
    getHistory: async (skip = 0, limit = 20) => {
        try {
            const response = await fetch(
                `${API_URL}/speaking/history?skip=${skip}&limit=${limit}`,
                { headers: getAuthHeaders() }
            );
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Session expired. Please log in again.');
                }
                const errorData = await response.json().catch(() => null);
                throw new Error(getErrorMessage(errorData, 'Failed to fetch speaking history'));
            }
            
            return await response.json();
        } catch (error) {
            console.error("Error fetching speaking history:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(getErrorMessage(error, 'Failed to fetch speaking history'));
        }
    },

    /**
     * Get details of a specific speaking session.
     * @param {string} sessionId - The session ID
     * @returns {Promise<Object>} - Full session details including analysis
     */
    getSession: async (sessionId) => {
        try {
            const response = await fetch(
                `${API_URL}/speaking/session/${sessionId}`,
                { headers: getAuthHeaders() }
            );
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Session expired. Please log in again.');
                }
                const errorData = await response.json().catch(() => null);
                throw new Error(getErrorMessage(errorData, 'Failed to fetch session'));
            }
            
            return await response.json();
        } catch (error) {
            console.error("Error fetching session:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(getErrorMessage(error, 'Failed to fetch session'));
        }
    }
};

export default speakingService;
