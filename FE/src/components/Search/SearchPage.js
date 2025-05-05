import React, { useState } from 'react'
import api from '../../services/api'
import Player from '../Player/Player'

export default function SearchPage() {
  const [query, setQuery]   = useState('')
  const [results, setResults] = useState([])

  const doSearch = () => {
    api.get(`/songs/search/?q=${encodeURIComponent(query)}`)
       .then(r => setResults(r.data))
  }

  return (
    <div className="search-page">
      <h1>Search Songs</h1>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Type to search…"
      />
      <button onClick={doSearch}>Search</button>

      {results.map(s => (
        <div key={s.id}>
          <strong>{s.title}</strong> — {s.artist}
          <Player src={s.audio_file} />
          <Comments songId={s.id} />
        </div>
      ))}
    </div>
  )
}
