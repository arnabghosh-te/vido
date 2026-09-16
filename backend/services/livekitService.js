const { AccessToken, RoomServiceClient } = require('livekit-server-sdk');

const endRoom = async (roomName) => {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitHost = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !livekitHost) {
    throw new Error('LiveKit credentials are required to end a room.');
  }

  const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);
  await roomService.deleteRoom(roomName);
};

const generateToken = (roomName, participantName, participantIdentity) => {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('LiveKit API Key and Secret are required.');
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantIdentity,
    name: participantName,
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  return at.toJwt();
};

module.exports = {
  generateToken,
  endRoom,
};
