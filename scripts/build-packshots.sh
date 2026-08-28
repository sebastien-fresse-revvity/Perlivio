#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
bead_dir="$project_root/assets/beads"
media_dir="$project_root/assets/media"
work_dir="$(mktemp -d)"
trap 'rm -rf "$work_dir"' EXIT

positions=(
  "500,1094" "357,996" "258,853" "216,685"
  "236,513" "317,359" "446,244" "608,183"
  "782,183" "944,244" "1073,359" "1154,513"
  "1174,685" "1132,853" "1033,996" "890,1094"
)

prepare_bead() {
  local stone="$1"
  local prepared="$work_dir/bead-${stone}.png"
  if [[ ! -f "$prepared" ]]; then
    convert "$bead_dir/${stone}.webp" -trim +repage -resize 210x210 \
      -gravity center -background none -extent 210x210 "$prepared"
  fi
  printf '%s' "$prepared"
}

prepare_spacer() {
  local collection="$1"
  local angle="$2"
  local spacer="$work_dir/spacer-${collection}-${angle}.png"
  local fill stroke
  case "$collection" in
    metal) fill="#737b85"; stroke="#303843" ;;
    inox) fill="#dce2e7"; stroke="#7f8993" ;;
    argent) fill="#f4f6f8"; stroke="#a9b0b8" ;;
    *) return 1 ;;
  esac
  convert -size 80x80 xc:none -fill "$fill" -stroke "$stroke" -strokewidth 2 \
    -draw 'roundrectangle 16,33 64,47 7,7' -fill 'rgba(255,255,255,.55)' -stroke none \
    -draw 'roundrectangle 21,35 59,38 2,2' -virtual-pixel transparent \
    -distort SRT "40,40 1 ${angle} 40,40" "$spacer"
  printf '%s' "$spacer"
}

build_packshot() {
  local name="$1"
  shift
  local stones=("$@")
  local frame="$work_dir/${name}.png"

  if [[ "${#stones[@]}" -ne 16 ]]; then
    printf 'Packshot %s: 16 pierres attendues, %s reçues.\n' "$name" "${#stones[@]}" >&2
    return 1
  fi

  convert -size 1600x1600 radial-gradient:'#ffffff-#e9e1d5' \
    -colorspace sRGB "$frame"
  convert -size 1600x1600 xc:none -fill none -stroke 'rgba(28,42,68,.14)' \
    -strokewidth 25 -draw 'ellipse 800,760 480,480 0,360' -blur 0x22 \
    "$work_dir/ring-shadow.png"
  convert "$frame" "$work_dir/ring-shadow.png" -composite "$frame"

  local index stone xy x y prepared
  local command=(convert "$frame")
  for index in "${!stones[@]}"; do
    stone="${stones[$index]}"
    xy="${positions[$index]}"
    x="${xy%,*}"
    y="${xy#*,}"
    prepared="$(prepare_bead "$stone")"
    command+=(\( "$prepared" \) -geometry "+${x}+${y}" -composite)
  done
  if [[ "$name" == "metal" || "$name" == "inox" || "$name" == "argent" ]]; then
    local spacer spec angle
    for spec in "145:372,989" "-132:446,366" "-48:1074,366" "35:1148,989"; do
      angle="${spec%%:*}"
      xy="${spec#*:}"
      spacer="$(prepare_spacer "$name" "$angle")"
      command+=(\( "$spacer" \) -geometry "+${xy%,*}+${xy#*,}" -composite)
    done
  fi
  command+=(\( "$media_dir/clasp-cutout.webp" -resize 390x390 \) \
    -geometry +605+1150 -composite -quality 88 "$media_dir/packshot-${name}.webp")
  "${command[@]}"
}

build_packshot essentiel \
  agate-blanche quartz-clair howlite agate-blanche aventurine-verte agate-blanche quartz-clair howlite \
  agate-blanche quartz-clair onyx-noir agate-blanche aventurine-verte howlite quartz-clair agate-blanche

build_packshot metal \
  howlite onyx-noir oeil-de-tigre howlite onyx-noir oeil-de-tigre howlite onyx-noir \
  oeil-de-tigre howlite onyx-noir oeil-de-tigre howlite onyx-noir oeil-de-tigre howlite

build_packshot inox \
  sodalite lapis-lazuli onyx-noir howlite sodalite lapis-lazuli onyx-noir howlite \
  sodalite lapis-lazuli onyx-noir howlite sodalite lapis-lazuli onyx-noir howlite

build_packshot argent \
  quartz-rose amethyste quartz-clair agate-blanche quartz-rose amethyste quartz-clair agate-blanche \
  quartz-rose amethyste quartz-clair agate-blanche quartz-rose amethyste quartz-clair agate-blanche

build_packshot signature \
  onyx-noir onyx-noir onyx-noir onyx-noir onyx-noir onyx-noir onyx-noir onyx-noir \
  onyx-noir onyx-noir onyx-noir onyx-noir onyx-noir onyx-noir onyx-noir onyx-noir

printf 'Packshots reconstruits : 5 bracelets complets de 16 perles.\n'
