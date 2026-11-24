import { $ } from "bun"
import { mkdir } from "node:fs/promises"
import path from "node:path"

const directory = path.resolve(import.meta.dir, "../icons/trustedrouter")
const source = path.join(directory, "trustedrouter-dark.svg")
const installed = path.join(directory, "icon.png")
const ios = path.join(directory, "ios")
const android = path.join(directory, "android/mipmap-xxxhdpi")
const background = "#171c16"

await Promise.all([mkdir(ios, { recursive: true }), mkdir(android, { recursive: true })])

// Keep the mark within the circle used to crop maskable web app icons.
await $`magick -background none ${source} -resize 384x384 -gravity center -background ${background} -extent 512x512 -alpha remove -depth 8 -strip ${installed}`

await Promise.all([
  $`magick ${installed} -resize 180x180 -strip ${path.join(ios, "AppIcon-60x60@3x.png")}`,
  $`magick ${installed} -resize 192x192 -strip ${path.join(android, "ic_launcher.png")}`,
  $`magick -respect-parentheses ${"("} -size 128x128 xc:none -fill ${background} -draw ${"roundrectangle 0,0 127,127 26,26"} ${")"} ${"("} -background none ${source} -resize 108x108 ${")"} -gravity center -compose over -composite -depth 8 -strip -define icon:auto-resize=64,48,32,16 ${path.join(directory, "icon.ico")}`,
])
