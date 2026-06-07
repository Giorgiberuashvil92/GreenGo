import Image from "next/image";
import {
  isDisplayableImageUrl,
  isNextImageAllowedUrl,
} from "@/lib/imageUrl";

type SafeRemoteImageProps = {
  src?: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
  placeholderClassName?: string;
};

export default function SafeRemoteImage({
  src,
  alt,
  width,
  height,
  className,
  placeholderClassName,
}: SafeRemoteImageProps) {
  const placeholder = (
    <div
      className={
        placeholderClassName ??
        "flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-400 dark:bg-gray-800"
      }
    >
      N/A
    </div>
  );

  if (!src?.trim() || !isDisplayableImageUrl(src)) {
    return placeholder;
  }

  if (isNextImageAllowedUrl(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
    />
  );
}
