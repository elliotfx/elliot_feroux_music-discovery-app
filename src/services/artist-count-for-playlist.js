// src/services/artist-count-for-playlist.js

import { fetchPlaylistById } from '../api/spotify-playlists.js';

/**
 * Count the number of appearances of each artist in a Spotify playlist
 * @param {string} token - Spotify access token
 * @param {string} playlistId - The ID of the playlist
 * @returns {Promise<Object|undefined>} - An object with artist names as keys and counts as values, or undefined on error
 */
export async function artistCountForPlaylist(token, playlistId) {
    try {
        // Fetch playlist data using the existing API function
        const result = await fetchPlaylistById(token, playlistId);

        // Check for errors in the response
        if (result.error) {
            console.error('Error fetching playlist:', result.error);
            return undefined;
        }

        const playlist = result.data;
        const artistCounts = {};

        // Iterate through playlist tracks and count artist appearances
        if (playlist?.tracks?.items) {
            for (const item of playlist.tracks.items) {
                if (item?.track?.artists) {
                    for (const artist of item.track.artists) {
                        const artistName = artist.name;
                        artistCounts[artistName] = (artistCounts[artistName] || 0) + 1;
                    }
                }
            }
        }

        return artistCounts;
    } catch (error) {
        console.error('Error fetching playlist:', error);
        return undefined;
    }
}
