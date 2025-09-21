import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface SoundItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  image: any;
  audio: any;
}

export interface Playlist {
  id: string;
  title: string;
  tracks: SoundItem[];
}

interface PlaylistContextType {
  playlists: Playlist[];
  createPlaylist: (title: string, initialTrack?: SoundItem) => void;
  deletePlaylist: (playlistId: string) => void;
  addTrackToPlaylist: (playlistId: string, track: SoundItem) => boolean;
  isFavorite: (trackId: string) => boolean;
  renamePlaylist: (playlistId: string, newTitle: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const usePlaylistContext = () => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylistContext must be used within a PlaylistProvider');
  }
  return context;
};

export const PlaylistProvider = ({ children }: { children: ReactNode }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([
    { id: '1', title: '내 찜1', tracks: [] },
    { id: '2', title: '내 찜2', tracks: [] },
    { id: '3', title: '내 찜3', tracks: [] },
  ]);

  const createPlaylist = (title: string, initialTrack?: SoundItem) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      title,
      tracks: initialTrack ? [initialTrack] : [],
    };
    setPlaylists(prev => [...prev, newPlaylist]);
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
  };

  const addTrackToPlaylist = (playlistId: string, track: SoundItem): boolean => {
    let trackAdded = false;
    setPlaylists(prev =>
      prev.map(playlist => {
        if (playlist.id === playlistId) {
          const isAlreadyAdded = playlist.tracks.some(t => t.id === track.id);
          if (!isAlreadyAdded) {
            trackAdded = true;
            return { ...playlist, tracks: [...playlist.tracks, track] };
          }
        }
        return playlist;
      })
    );
    return trackAdded;
  };

  const isFavorite = (trackId: string) => {
    return playlists.some(playlist => playlist.tracks.some(track => track.id === trackId));
  };

  const renamePlaylist = (playlistId: string, newTitle: string) => {
    setPlaylists(prev =>
      prev.map(p => p.id === playlistId ? { ...p, title: newTitle } : p)
    );
  };

  const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists(prev =>
      prev.map(p =>
        p.id === playlistId
          ? { ...p, tracks: p.tracks.filter(t => t.id !== trackId) }
          : p
      )
    );
  };

  const value = {
    playlists,
    createPlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    isFavorite,
    renamePlaylist,
    removeTrackFromPlaylist,
  };

  return (
    <PlaylistContext.Provider value={value}>
      {children}
    </PlaylistContext.Provider>
  );
};