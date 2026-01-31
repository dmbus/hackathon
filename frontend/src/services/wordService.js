
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const wordService = {
    getDecks: async () => {
        try {
            const response = await fetch(`${API_URL}/words/`);
            if (!response.ok) throw new Error('Failed to fetch decks');
            return await response.json();
        } catch (error) {
            console.error("Error fetching decks:", error);
            // Return null to indicate error
            return null;
        }
    },

    getWordsByLevel: async (level) => {
        try {
            const response = await fetch(`${API_URL}/words/${level}`);
            if (!response.ok) throw new Error('Failed to fetch words');
            return await response.json();
        } catch (error) {
            console.error("Error fetching words:", error);
            return [];
        }
    }
};
