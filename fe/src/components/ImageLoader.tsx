import React from "react";

interface ImageLoaderProps {
  name: string;
  alt?: string;
}

const ImageLoader: React.FC<ImageLoaderProps> = ({ name, alt }) => {
  // Nếu ảnh trong public/
  return <img src={`/${name}.png`} alt={alt || name} />;
};

export default ImageLoader;
