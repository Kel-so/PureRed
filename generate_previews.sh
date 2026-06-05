#!/bin/bash

FFMPEG="$HOME/Downloads/ffmpeg-static/ffmpeg"
IN_DIR="$HOME/Downloads/PORTFOLIO PURERED"
OUT_DIR="$HOME/Documentos/PureRed/assets/previews"

# -t 4: duration 4 seconds
# -ss 00:00:05: start at 5 seconds (to skip intros)
# -an: no audio
# -vf "scale='min(480,iw)':min'(480,ih)':force_original_aspect_ratio=decrease": scale down
# -r 24: 24 fps
# -crf 30: higher compression
# -y: overwrite

generate() {
  in_file="$1"
  out_name="$2"
  if [ -f "$IN_DIR/$in_file" ]; then
    echo "Processing $in_file -> $out_name"
    "$FFMPEG" -y -ss 00:00:03 -t 4 -i "$IN_DIR/$in_file" -an -vf "scale='min(480,iw)':'min(480,ih)':force_original_aspect_ratio=decrease" -c:v libx264 -crf 32 -preset veryfast -r 24 "$OUT_DIR/$out_name"
  else
    echo "Warning: $in_file not found"
  fi
}

generate "SAMEDAY_04_00_widescreen.MP4" "sameday04.mp4"
generate "GAME_01_00_wide.mp4" "futsal01.mp4"
generate "DRIFT_01_00_mobile.MP4" "drift01.mp4"
generate "LDJR_01_00_wide.mp4" "ldjr01.mp4"
generate "SAMEDAY_01_wide.MP4" "sameday01.mp4"
generate "SAMEDAY_02_wide.MP4" "sameday02.mp4"
generate "SAMEDAY_03_wide.MP4" "sameday03.mp4"
generate "SKORIA_01_mobile.mp4" "skoria01.mp4"

echo "Done generating previews!"
