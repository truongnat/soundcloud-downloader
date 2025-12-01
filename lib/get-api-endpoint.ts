import { baseUrl } from "./get-base-url";

export const buildApiEndpoint = (path: string) => {
  return `${baseUrl}${path}`;
};

export const getSearchApiPath = (
  query: string,
  clientId: string,
  offset: number = 0,
  limit: number = 10
) => {
  return buildApiEndpoint(
    `/api/soundcloud/search?q=${encodeURIComponent(
      query
    )}&limit=${limit}&offset=${offset}&client_id=${clientId}`
  );
};

export const getClientIdApiPath = () => {
  return buildApiEndpoint("/api/soundcloud/get-client-id");
};

export const getDownloadApiPath = (
  trackUrl: string,
  title: string,
  clientId: string
) => {
  return buildApiEndpoint(
    `/api/soundcloud/download?url=${encodeURIComponent(
      trackUrl
    )}&title=${encodeURIComponent(title)}&client_id=${encodeURIComponent(
      clientId
    )}`
  );
};

export const getPlaylistApiPath = (playlistUrl: string) => {
  return buildApiEndpoint(
    `/api/soundcloud/playlist?url=${encodeURIComponent(playlistUrl)}`
  );
};

export const getSongAPiPath = (songUrl: string) => {
  return buildApiEndpoint(
    `/api/soundcloud/song?url=${encodeURIComponent(songUrl)}`
  );
};
