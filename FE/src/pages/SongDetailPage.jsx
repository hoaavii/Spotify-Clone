// src/pages/SongDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Player from '../components/Player/Player';
import './SongDetailPage.css';

export default function SongDetailPage() {
  const { id } = useParams();
  const [song, setSong]         = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNew]    = useState('');
  const [isFav, setIsFav]       = useState(false);
  const [favId, setFavId]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/songs/${id}/`),
      api.get(`/comments/?song=${id}`),
      api.get('/favorites/')
    ]).then(([rSong, rComm, rFav]) => {
      setSong(rSong.data);
      setComments(rComm.data);
      const f = rFav.data.find(f=>f.song===+id);
      if (f) { setIsFav(true); setFavId(f.id); }
    }).catch(()=> setError('Could not load details'))
      .finally(()=> setLoading(false));
  }, [id]);

  const postComment = () => {
    if (!newComment.trim()) return;
    api.post('/comments/', { song: id, content: newComment })
      .then(r => setComments([r.data, ...comments]))
      .finally(()=> setNew(''));
  };

  const toggleFav = () => {
    if (isFav) {
      api.delete(`/favorites/${favId}/`).then(()=>{
        setIsFav(false); setFavId(null);
      });
    } else {
      api.post('/favorites/', { song: id }).then(r=>{
        setIsFav(true); setFavId(r.data.id);
      });
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error)   return <p className="error">{error}</p>;

  return (
    <div className="song-detail-page">
      <h1>{song.title}</h1>
      <p><strong>Artist:</strong> {song.artist}</p>
      {song.album && <p><strong>Album:</strong> {song.album}</p>}
      <Player
  src={song.audio_file}
  title={song.title}
  artist={song.artist}
/>
      <button onClick={toggleFav} className={isFav?'btn-unfav':'btn-fav'}>
        {isFav?'★ Unfavorite':'☆ Favorite'}
      </button>

      <hr/>

      <h2>Comments</h2>
      <textarea
        value={newComment}
        onChange={e=>setNew(e.target.value)}
        placeholder="Write comment…"
      />
      <button onClick={postComment}>Post</button>

      <ul className="comments-list">
        {comments.map(c=>(
          <li key={c.id}>
            <strong>{c.user}</strong> <em>{new Date(c.created_at).toLocaleString()}</em>
            <p>{c.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
