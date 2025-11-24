// src/components/PlayListItem/PlayListItem.jsx

import './PlayListItem.css';

/**
 * Playlist list item
 * @param {Object} props
 * @param {Object} props.playlist - Playlist object from Spotify API
 * @param {Function} [props.onClick] - Called when user clicks the item
 */
export default function PlayListItem({ playlist, onClick }) {
  const coverUrl = playlist?.images?.[0]?.url ?? '';
  const ownerName = playlist?.owner?.display_name ?? 'Unknown';
  const totalTracks = playlist?.tracks?.total ?? 0;
  const spotifyUrl = playlist?.external_urls?.spotify ?? '';

  const handleKeyDown = (event) => {
    if (!onClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <li
      className="playlist-item"
      data-testid={`playlist-item-${playlist.id}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : -1}
    >
      {coverUrl && (
        <img
          src={coverUrl}
          alt={playlist.name}
          className="playlist-item-cover"
        />
      )}

      <div className="playlist-item-main">
        <div className="playlist-item-title">{playlist.name}</div>
        <div className="playlist-item-meta">
          <span className="playlist-item-owner">By {ownerName}</span>
          <span className="playlist-item-separator"> · </span>
          <span className="playlist-item-tracks">{totalTracks} tracks</span>
        </div>
      </div>

      {spotifyUrl && (
        <a
          href={spotifyUrl}
          target="_blank"
          rel="noreferrer"
          className="playlist-item-open-link"
          onClick={(e) => e.stopPropagation()} // ne déclenche pas la navigation interne
        >
          Open in Spotify
        </a>
      )}
    </li>
  );
}
