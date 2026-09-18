"use client"

import Image from "next/image"
import type {FC} from "react"

//////////////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////////////

type AvatarSize = "sm" | "md" | "lg" | "xl" | "2xl"

interface AvatarProps {
  readonly name?: string | null

  readonly image?: string | null

  readonly size?: AvatarSize

  readonly className?: string
}

//////////////////////////////////////////////////////////////
// SIZE
//////////////////////////////////////////////////////////////
const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",

  md: "h-10 w-10 text-sm",

  lg: "h-14 w-14 text-lg",

  xl: "h-20 w-20 text-2xl",

  "2xl": "h-28 w-28 text-4xl",
}

//////////////////////////////////////////////////////////////
// HELPERS
//////////////////////////////////////////////////////////////

function getInitials(name?: string | null): string {
  if (!name?.trim()) {
    return "?"
  }

  const words = name
    .trim()
    .split(/\s+/)
    .filter((word): word is string => word.length > 0)

  const first = words.at(0)
  const last = words.at(-1)

  if (!first) {
    return "?"
  }

  if (!last || first === last) {
    return first.charAt(0).toUpperCase()
  }

  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
}

//////////////////////////////////////////////////////////////
// COMPONENT
//////////////////////////////////////////////////////////////

const Avatar: FC<AvatarProps> = ({
  name,

  image,

  size = "md",

  className = "",
}) => {
  //////////////////////////////////////////////////////////
  // STATE
  //////////////////////////////////////////////////////////

  const initials = getInitials(name)

  const hasImage = Boolean(image?.trim())

  //////////////////////////////////////////////////////////
  // RENDER
  //////////////////////////////////////////////////////////

  return (
    <div
      className={[
        "relative inline-flex items-center justify-center overflow-hidden rounded-full font-semibold text-white select-none",
        sizeClasses[size],
        className || "bg-indigo-600",
      ].join(" ")}
    >
      {hasImage ? (
        <Image
          src={image!}
          alt={name ?? "Avatar"}
          fill
          sizes="100%"
          className="object-cover"
        />
      ) : (
        <span className="uppercase">{initials}</span>
      )}
    </div>
  )
}

export default Avatar
