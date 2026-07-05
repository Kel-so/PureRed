#!/bin/bash
FFMPEG="$HOME/Downloads/ffmpeg-static/ffmpeg"
IN_DIR="$HOME/Downloads/PURERED"
OUT_DIR="$HOME/Documentos/PureRed/assets/previews"

"$FFMPEG" -y -ss 00:00:01 -t 4 -i "$IN_DIR/Portfólio.MP4" -an -vf "scale='min(1080,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -crf 20 -preset fast -r 24 "$OUT_DIR/banners_portfolio.mp4"
"$FFMPEG" -y -ss 00:00:01 -t 4 -i "$IN_DIR/Valorant - minute.MP4" -an -vf "scale='min(1080,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -crf 20 -preset fast -r 24 "$OUT_DIR/valorant1.mp4"
"$FFMPEG" -y -ss 00:00:01 -t 4 -i "$IN_DIR/Valorant - tate.MP4" -an -vf "scale='min(1080,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -crf 20 -preset fast -r 24 "$OUT_DIR/valorant2.mp4"
"$FFMPEG" -y -ss 00:00:00 -t 4 -i "$IN_DIR/Intro.MP4" -an -vf "scale='min(1080,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -crf 20 -preset fast -r 24 "$OUT_DIR/intro.mp4"
"$FFMPEG" -y -ss 00:00:00 -t 4 -i "$IN_DIR/MeuPdi.MP4" -an -vf "scale='min(1080,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -crf 20 -preset fast -r 24 "$OUT_DIR/logo_anim.mp4"
