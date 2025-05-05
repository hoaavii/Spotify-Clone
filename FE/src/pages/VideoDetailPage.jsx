// src/pages/VideoDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import './VideoDetailPage.css';

export default function VideoDetailPage() {
  const { id } = useParams();
  const [video, setVideo]       = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNew]    = useState('');
  const [isFav, setIsFav]       = useState(false);
  const [favId, setFavId]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/videos/${id}/`),
      api.get(`/comments/?video=${id}`),    // if you add video filter
      api.get('/favorites/')
    ]).then(([rVid, rComm, rFav]) => {
      setVideo(rVid.data);
      // adjust comment fetch if your Comment model supports video
      setComments(rComm.data.filter(c=>c.video===+id));
      const f = rFav.data.find(f=>f.video===+id);
      if (f) { setIsFav(true); setFavId(f.id); }
    }).catch(()=> setError('Could not load details'))
      .finally(()=> setLoading(false));
  }, [id]);

  const postComment = () => {
    if (!newComment.trim()) return;
    api.post('/comments/', { video: id, content: newComment })
      .then(r => setComments([r.data, ...comments]))
      .finally(()=> setNew(''));
  };

  const toggleFav = () => {
    if (isFav) {
      api.delete(`/favorites/${favId}/`).then(()=>{
        setIsFav(false); setFavId(null);
      });
    } else {
      api.post('/favorites/', { video: id }).then(r=>{
        setIsFav(true); setFavId(r.data.id);
      });
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error)   return <p className="error">{error}</p>;

  return (
    <div className="video-detail-page">
      <h1>{video.title}</h1>
      <p><strong>Artist:</strong> {video.artist}</p>
      <video controls src={video.video_file} style={{ maxWidth:'100%' }} />

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
