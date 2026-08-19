/**
 * A favicon.ico at the site root.
 *
 * Google says a declared icon of any valid format is enough, but browsers, feed
 * readers and assorted crawlers still probe /favicon.ico directly and get a 404
 * without one. The file is a plain ICO container around PNGs rendered from the
 * same favicon.svg, so there is still only one drawing of the icon.
 */
export function pngsToIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);            // reserved
  header.writeUInt16LE(1, 2);            // 1 = icon
  header.writeUInt16LE(images.length, 4);

  const directory = Buffer.alloc(16 * images.length);
  let offset = header.length + directory.length;

  images.forEach(({ size, data }, index) => {
    const entry = index * 16;
    directory.writeUInt8(size >= 256 ? 0 : size, entry);     // width, 0 means 256
    directory.writeUInt8(size >= 256 ? 0 : size, entry + 1); // height
    directory.writeUInt8(0, entry + 2);                      // palette colours
    directory.writeUInt8(0, entry + 3);                      // reserved
    directory.writeUInt16LE(1, entry + 4);                   // colour planes
    directory.writeUInt16LE(32, entry + 6);                  // bits per pixel
    directory.writeUInt32LE(data.length, entry + 8);
    directory.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });

  return Buffer.concat([header, directory, ...images.map((image) => image.data)]);
}
