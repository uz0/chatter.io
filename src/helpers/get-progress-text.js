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
    formattedChunkSize = Math.ceil(attachment.currentChunk / 1024);
    formattedFullSize = Math.ceil(fullSize / 1024);
  }

  if (fullSize >= 1048576) {
    type = 'mb';
    formattedChunkSize = Math.ceil(attachment.currentChunk / 1048576);
    formattedFullSize = Math.ceil(fullSize / 1048576);
  }

  if (attachment.currentChunk < attachment.byte_size) {
    return `${formattedChunkSize} / ${formattedFullSize} ${type}`;
  }

  return `${formattedFullSize} ${type}`;
};
