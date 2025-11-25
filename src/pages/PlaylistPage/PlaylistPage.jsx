import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import PlaylistPage from './PlaylistPage';
import * as spotifyApi from '../../api/spotify-playlists';

// 1. FIX: Mock the hooks to return values so useEffect doesn't return early
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ playlistId: 'test-playlist-id' }), // Must provide ID
  useNavigate: () => jest.fn(),
}));

jest.mock('../../hooks/useRequireToken', () => ({
  useRequireToken: () => ({ token: 'mock-token-123' }), // Must provide Token
}));

// 2. FIX: Correct import path (up two levels)
jest.mock('../../utils/handleTokenError', () => ({
  handleTokenError: jest.fn(() => false),
}));

describe('PlaylistPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset title before each test
    document.title = 'Original Title';
  });

  test('fetches and renders playlist, sets title', async () => {
    // Mock successful data
    const mockPlaylist = {
      id: 'test-playlist-id',
      name: 'My Cool Playlist',
      description: 'Test Description',
      owner: { display_name: 'Test Owner' },
      images: [{ url: 'http://test.com/image.jpg' }],
      tracks: {
        total: 1,
        items: [
          {
            track: {
              id: 't1',
              name: 'Test Track',
              artists: [{ name: 'Test Artist' }],
              album: { name: 'Test Album' },
            },
          },
        ],
      },
      external_urls: { spotify: 'http://spotify.com/playlist' },
    };

    jest.spyOn(spotifyApi, 'fetchPlaylistById').mockResolvedValue({
      data: mockPlaylist,
      error: null,
    });

    render(
      <MemoryRouter>
        <PlaylistPage />
      </MemoryRouter>
    );

    // Initial loading check
    expect(screen.getByRole('status')).toHaveTextContent(/loading playlist/i);

    // 3. FIX: Use findByText to wait for the data to appear. 
    // This implicitly waits for loading to finish.
    await screen.findByText('My Cool Playlist');
    await screen.findByText('Test Description');
    await screen.findByText('Test Track');

    // Now we can safely check that loading is gone
    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();

    // 4. FIX: Correct Title expectation
    expect(document.title).toBe('My Cool Playlist | Music Discovery App');
  });

  test('displays error message on fetch failure', async () => {
    // Mock generic error
    jest.spyOn(spotifyApi, 'fetchPlaylistById').mockRejectedValue(new Error('Network Error'));

    render(
      <MemoryRouter>
        <PlaylistPage />
      </MemoryRouter>
    );

    // Wait for the specific error text your component sets on catch
    await screen.findByText(/Failed to fetch playlist/i);

    // Verify loading is gone
    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
  });

  test('displays error message on API returned error', async () => {
    // Mock API returning { error: ... }
    jest.spyOn(spotifyApi, 'fetchPlaylistById').mockResolvedValue({
      data: null,
      error: 'Playlist not found API error',
    });

    render(
      <MemoryRouter>
        <PlaylistPage />
      </MemoryRouter>
    );

    // Wait for the specific error text
    await screen.findByText(/Playlist not found API error/i);

    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
  });

  test('handleTokenError called on token expiry error', async () => {
    // Mock the specific token error
    const handleTokenErrorModule = require('../../utils/handleTokenError');
    const handleTokenErrorSpy = handleTokenErrorModule.handleTokenError;
    
    // Setup spy to return true (handled) or false (not handled) depending on your utils logic
    // Usually mockResolvedValue is not needed for spies on functions, just mockReturnValue
    handleTokenErrorSpy.mockReturnValue(true);

    jest.spyOn(spotifyApi, 'fetchPlaylistById').mockResolvedValue({
        data: null,
        error: 'The access token expired'
    });

    render(
      <MemoryRouter>
        <PlaylistPage />
      </MemoryRouter>
    );

    // Since loading might not disappear if handleTokenError redirects immediately, 
    // we just check if the function was called.
    await waitFor(() => {
        expect(handleTokenErrorSpy).toHaveBeenCalled();
    });
  });
});