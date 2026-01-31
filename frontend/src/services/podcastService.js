import { api } from './api';

/**
 * Fetch available contexts for podcast generation
 */
export const getContexts = async () => {
    const response = await api.get('/podcasts/contexts');
    return response.data;
};

/**
 * Fetch available CEFR levels
 */
export const getLevels = async () => {
    const response = await api.get('/podcasts/levels');
    return response.data;
};

/**
 * Fetch available voices from ElevenLabs
 */
export const getVoices = async () => {
    const response = await api.get('/podcasts/voices');
    return response.data;
};

/**
 * Fetch list of podcasts with optional filters
 */
export const getPodcasts = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.level) params.append('level', filters.level);
    if (filters.context) params.append('context', filters.context);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.skip) params.append('skip', filters.skip);

    const response = await api.get(`/podcasts/?${params.toString()}`);
    return response.data;
};

/**
 * Fetch a single podcast by ID
 */
export const getPodcast = async (podcastId) => {
    const response = await api.get(`/podcasts/${podcastId}`);
    return response.data;
};

/**
 * Create a new podcast
 */
export const createPodcast = async (podcastData) => {
    const response = await api.post('/podcasts/', podcastData);
    return response.data;
};

/**
 * Delete a podcast by ID
 */
export const deletePodcast = async (podcastId) => {
    const response = await api.delete(`/podcasts/${podcastId}`);
    return response.data;
};
