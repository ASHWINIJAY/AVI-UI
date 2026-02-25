import imageCompression from "browser-image-compression";

export const compressImage = async (file) => {
  if (!file) throw new Error("No file provided");

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: "image/jpeg",
  };

  const compressedBlob = await imageCompression(file, options);

  // ✅ Create proper File with extension
  const compressedFile = new File(
    [compressedBlob],
    `photo_${Date.now()}.jpg`,
    { type: "image/jpeg" }
  );

  console.log(
    "Compressed:",
    (compressedFile.size / 1024 / 1024).toFixed(2),
    "MB"
  );

  return compressedFile;
};