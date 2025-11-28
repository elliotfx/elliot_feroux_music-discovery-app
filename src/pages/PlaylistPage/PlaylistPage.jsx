import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { buildTitle } from '../../constants/appMeta.js';
import { useRequireToken } from '../../hooks/useRequireToken.js';
import '../PageLayout.css';
import '../PlaylistPage.css';
import TrackItem from '../../components/TrackItem/TrackItem.jsx';
import { fetchPlaylistById } from '../../api/spotify-playlists.js';
import { handleTokenError } from '../../utils/handleTokenError.js';
import { useNavigate } from 'react-router-dom';

/**
 * Playlist Detail Page
 * @returns {JSX.Element}
 */
export default function PlaylistPage() {
  // Get playlist ID from URL params
  const { id } = useParams();
  
  // Initialize navigate function
  const navigate = useNavigate();

  // state for playlist data
  const [playlist, setPlaylist] = useState(null);

  // state for loading and error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // require token to fetch playlist
  const { token } = useRequireToken();

  // set document title
  useEffect(() => { 
    document.title = buildTitle('Playlist'); 
  }, []);

  useEffect(() => {
    if (!token) return; // wait for check or redirect
    
    // fetch playlist by ID when token changes
    fetchPlaylistById(token, id)
      .then(res => {
        if (res.error) {
          if (!handleTokenError(res.error, navigate)) {
            setError(res.error);
          }
        } else {
          setPlaylist(res.data);
        }
      })
      .catch(err => { 
        setError(err.message); 
      })
      .finally(() => { 
        setLoading(false); 
      });
  }, [token, id, navigate]);

  return (
    <section className="playlist-container page-container" aria-labelledby="playlist-title">
      {loading && <output className="playlist-loading" role="status" data-testid="loading-indicator">Loading playlist…</output>}
      {error && !loading && <div className="playlist-error" role="alert">{error}</div>}
      {!loading && !error && playlist && (
        <>
          <header className="playlist-header">
            <div className="playlist-header-image">
              <img 
                src={playlist.images?.[0]?.url || 'https://via.placeholder.com/180?text=No+Image'}
                alt={`Cover of ${playlist.name}`}
                className="playlist-cover"
              />
            </div>
            <div className="playlist-header-text-with-link">
              <div className="playlist-header-text">
                <h1 id="playlist-title" className="playlists-title">{playlist.name}</h1>
                <h2 className="playlists-subtitle">{playlist.description}</h2>
              </div>
              <a 
                href={playlist.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="playlist-spotify-link"
              >
                Open in Spotify
              </a>
            </div>
          </header>
          <ol className="playlist-list">
            {playlist.tracks.items.map(item => (
              <TrackItem key={item.track.id} track={item.track} />
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
