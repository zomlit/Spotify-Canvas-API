import axios from 'axios';
import { getToken } from './spotifyAuthService.js';

export class SpotifyCanvasError extends Error {
  constructor(message, { status, body, cause } = {}) {
    super(message);
    this.name = "SpotifyCanvasError";
    this.stage = "canvas";
    this.status = status;
    this.body = body;
    this.cause = cause;
  }
}

export async function getCanvases(trackUri) {
  const { CanvasRequest, CanvasResponse } = (await import('../proto/_canvas_pb.cjs')).default;

  const accessToken = await getToken();

  const canvasRequest = new CanvasRequest();
  const track = new CanvasRequest.Track();
  track.setTrackUri(trackUri);
  canvasRequest.addTracks(track);

  const requestBytes = canvasRequest.serializeBinary();

  try {
    const response = await axios.post(
      'https://spclient.wg.spotify.com/canvaz-cache/v0/canvases',
      requestBytes,
      {
        responseType: 'arraybuffer',
        headers: {
          'Accept': 'application/protobuf',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept-Language': 'en',
          'User-Agent': 'Spotify/9.0.34.593 iOS/18.4 (iPhone15,3)',
          'Accept-Encoding': 'gzip, deflate, br',
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const parsed = CanvasResponse.deserializeBinary(response.data).toObject();
    return parsed;
  } catch (error) {
    throw new SpotifyCanvasError("Spotify canvas request failed", {
      status: error.response?.status,
      body: responseBody(error.response?.data),
      cause: error,
    });
  }
}

function responseBody(data) {
  if (data == null) return undefined;
  if (Buffer.isBuffer(data) || data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
    return Buffer.from(data).toString("utf8").slice(0, 500);
  }
  if (typeof data === "string") {
    return data.slice(0, 500);
  }
  return JSON.stringify(data).slice(0, 500);
}
