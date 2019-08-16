export default attachment => {
  if (!attachment || !attachment.currentChunk) {
    return null;
  }

  let type = '';
  let formattedChunkSize = null;
  let formattedFullSize = null;
  const fullSize = attachment.byte_size;

  if (fullSize < 1024) {
    type = 'b';
    formattedChunkSize = attachment.currentChunk;
    formattedFullSize = fullSize;
  }

  if (fullSize >= 1024 && fullSize < 1048576) {
    type = 'kb';
    formattedChunkSize = Number(attachment.currentChunk / 1024).toFixed(2);
    formattedFullSize = Number(fullSize / 1024).toFixed(2);
  }

  if (fullSize >= 1048576) {
    type = 'mb';
    formattedChunkSize = Number(attachment.currentChunk / 1048576).toFixed(2);
    formattedFullSize = Number(fullSize / 1048576).toFixed(2);
  }

  if (attachment.currentChunk < attachment.byte_size) {
    return `${formattedChunkSize} / ${formattedFullSize} ${type}`;
  }

  return `${formattedFullSize} ${type}`;
};
