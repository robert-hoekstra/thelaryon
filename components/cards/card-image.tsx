import Image, { type ImageProps } from "next/image"

import { cn } from "@/lib/utils"

type CardImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string
  alt: string
}

/**
 * Scryfall image CDN rejects the Node User-Agent used by Next.js image
 * optimization, so we load images directly in the browser.
 */
export function CardImage({ src, alt, className, ...props }: CardImageProps) {
  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      unoptimized
      className={cn(className)}
    />
  )
}
