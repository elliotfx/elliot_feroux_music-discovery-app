// src/pages/PlaylistPage/PlaylistPage.jsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buildTitle } from '../../constants/appMeta.js';
import { useRequireToken } from '../../hooks/useRequireToken.js';
import { fetchPlaylistById } from '../../api/spotify-playlists.js';
import { handleTokenError } from '../../utils/handleTokenError.js';

import '../../styles/PlaylistDetailPage.css';
import '../PageLayout.css';

/**
 * Single playlist detail page.
 * Route: /playlists/:playlistId
 */
export default function PlaylistPage() {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { token } = useRequireToken();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Titre de la page
  useEffect(() => {
    if (playlist?.name) {
      document.title = buildTitle(playlist.name);
    } else {
      document.title = buildTitle('Playlist');
    }
  }, [playlist]);

  // Récupération de la playlist
  useEffect(() => {
    if (!token || !playlistId) return;

    setLoading(true);
    setError(null);

    fetchPlaylistById(token, playlistId)
      .then((res) => {
        if (res.error) {
          if (!handleTokenError(res.error, navigate)) {
            setError(res.error);
          }
          setPlaylist(null);
          return;
        }
        setPlaylist(res.data);
      })
      .catch(() => {
        setError('Failed to fetch playlist.');
        setPlaylist(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, playlistId, navigate]);

  const coverUrl = playlist?.images?.[0]?.url ?? null;
  const playlistName = playlist?.name ?? 'Playlist';
  const playlistDescription =
    playlist?.description?.trim() || 'No description provided.';
  const playlistOwner = playlist?.owner?.display_name ?? 'Unknown';
  const playlistTotalTracks = playlist?.tracks?.total ?? 0;
  const playlistSpotifyUrl = playlist?.external_urls?.spotify ?? '';

  const hasTracks =
    playlist &&
    playlist.tracks &&
    Array.isArray(playlist.tracks.items) &&
    playlist.tracks.items.length > 0;

  return (
    <section
      className="playlist-container page-container"
      aria-labelledby="playlist-title"
    >
      {/* Loading */}
      {loading && (
        <div
          className="playlist-loading"
          data-testid="loading-indicator"
          role="status"
        >
          Loading playlist…
        </div>
      )}

      {/* Erreur */}
      {error && !loading && (
        <div className="playlist-error" role="alert">
          {error}
        </div>
      )}

      {/* Playlist introuvable */}
      {!loading && !error && !playlist && (
        <div className="playlist-error" role="alert">
          Playlist not found.
        </div>
      )}

      {/* Contenu principal */}
      {!loading && !error && playlist && (
        <>
          <header className="playlist-header">
            <div className="playlist-header-image">
              {coverUrl && (
                <img
                  src={coverUrl}
                  alt={playlistName}
                  className="playlist-cover"
                />
              )}
            </div>

            <div className="playlist-header-text-with-link">
              <div className="playlist-header-text">
                <h1 id="playlist-title" className="playlist-title">
                  {playlistName}
                </h1>

                <p className="playlist-subtitle">{playlistDescription}</p>

                <p>
                  By <strong>{playlistOwner}</strong> · {playlistTotalTracks}{' '}
                  tracks
                </p>
              </div>

              {playlistSpotifyUrl && (
                <a
                  href={playlistSpotifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="playlist-spotify-link"
                >
                  Lire la playlist
                </a>
              )}
            </div>
          </header>

          <main>
            {hasTracks ? (
              <div className="playlist-list" aria-label="Playlist tracks">
                {playlist.tracks.items.map((item) => {
                  const track = item.track;
                  if (!track) return null;

                  const trackName = track.name;
                  const artistsNames = (track.artists || [])
                    .map((a) => a.name)
                    .join(', ');
                  const albumName = track.album?.name ?? '';
                  const popularity =
                    typeof track.popularity === 'number'
                      ? track.popularity
                      : null;
                  const trackSpotifyUrl =
                    track.external_urls?.spotify ?? '';

                  return (
                    <div
                      key={track.id}
                      className="playlist-track-row"
                      data-testid={`playlist-track-${track.id}`}
                    >
                      <div>
                        <div>{trackName}</div>
                        <div>
                          {artistsNames}
                          {albumName ? ` • ${albumName}` : ''}
                        </div>
                      </div>

                      <div>
                        {popularity !== null && (
                          <span>Popularity: {popularity}</span>
                        )}
                        {trackSpotifyUrl && (
                          <>
                            {' '}
                            ·{' '}
                            <a
                              href={trackSpotifyUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="playlist-loading">This playlist is empty.</p>
            )}
          </main>
        </>
      )}
    </section>
  );
}
