#!/bin/sh
# Converte um vídeo da AJ em quadros para o modelo (story.html).
# Uso: ./preparar-videos.sh video.mp4 nome [inicio_seg]
# Depois, em story.html, troque o clipe por: nome:{type:'seq',dir:'clips/nome',fps:30,n:<qtd>,start:0}
set -e
mkdir -p "clips/$2"
ffmpeg -y -loglevel error -ss "${3:-0}" -i "$1" -t 4 -vf "fps=30,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" -q:v 3 "clips/$2/%04d.jpg"
echo "$2: $(ls clips/$2 | wc -l) quadros"
