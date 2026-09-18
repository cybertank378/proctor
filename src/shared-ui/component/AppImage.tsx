// Files: src/shared-ui/component/AppImage.tsx
"use client";

import clsx from "clsx";
import Image, { type ImageProps } from "next/image";
import type { CSSProperties } from "react";

//////////////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////////////

export interface AppImageProps
  extends Omit<
    ImageProps,
    | "fill"
    | "width"
    | "height"
    | "className"
    | "style"
    | "sizes"
    | "loading"
    | "priority"
    | "preload"
  > {
  /**
   * Class pembungkus untuk ukuran, margin, border, dan sebagainya.
   * Wajib menyediakan tinggi atau aspect-ratio.
   */
  readonly className: string;

  /**
   * Perkiraan lebar gambar pada masing-masing ukuran layar.
   * Contoh: "(max-width: 640px) 100vw, 320px".
   */
  readonly sizes: string;

  /**
   * true untuk gambar yang langsung terlihat saat halaman dibuka.
   * Menggunakan loading="eager".
   */
  readonly aboveFold?: boolean;

  /**
   * contain: seluruh gambar terlihat tanpa terpotong.
   * cover: memenuhi area dengan kemungkinan sebagian terpotong.
   */
  readonly fit?: "contain" | "cover";

  /**
   * Posisi gambar di dalam pembungkus.
   * Contoh: "center", "center bottom", "right center".
   */
  readonly position?: CSSProperties["objectPosition"];

  /**
   * Style tambahan untuk pembungkus.
   */
  readonly containerStyle?: CSSProperties;
}

//////////////////////////////////////////////////////////////
// COMPONENT
//////////////////////////////////////////////////////////////

export default function AppImage({
  src,
  alt,
  className,
  sizes,
  aboveFold = false,
  fit = "contain",
  position = "center",
  containerStyle,
  ...imageProps
}: AppImageProps) {
  return (
    <span
      className={clsx("relative block overflow-hidden", className)}
      style={containerStyle}
    >
      <Image
        {...imageProps}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        loading={aboveFold ? "eager" : "lazy"}
        style={{
          objectFit: fit,
          objectPosition: position,
        }}
      />
    </span>
  );
}
