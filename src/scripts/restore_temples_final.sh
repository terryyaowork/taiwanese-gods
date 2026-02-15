#!/bin/bash
set -x

ARTIFACTS_DIR="/Users/terryyao/.gemini/antigravity/brain/73b3ef71-bcab-47cc-a751-c7d936d4ef37"
DEST_DIR="src/assets/images/temples"

# Function to restore a single file
restore_file() {
    src="$1"
    dest="$2"
    echo "Restoring $dest from $src"
    rm -f "$DEST_DIR/$dest"
    cp "$ARTIFACTS_DIR/$src" "$DEST_DIR/$dest"
    ls -l "$DEST_DIR/$dest"
}

restore_file "fagushan_temple_realism_v2_1771079110111.png" "temple-fagushan.jpg"
restore_file "foguangshan_temple_realism_1771079123858.png" "temple-foguangshan.jpg"
restore_file "taipei_confucius_temple_realism_1771079139777.png" "temple-taipei-confucius.jpg"
restore_file "songshan_fengtian_temple_realism_1771079211658.png" "temple-songshan-fengtian.jpg"
restore_file "yilan_sanqing_temple_realism_1771079280033.png" "temple-yilan-sanqing.jpg"
restore_file "taichung_fahua_temple_realism_1771079313034.png" "temple-taichung-fahua.jpg"
restore_file "tainan_tiantan_temple_realism_1771079329082.png" "temple-tainan-tiantan.jpg"
restore_file "donggang_donglong_temple_realism_1771079345316.png" "temple-donglong.jpg"
restore_file "zhushan_zinan_temple_realism_retry_2_1771079421760.png" "temple-zhushan-zinan.jpg"
restore_file "hsinchu_puxian_temple_realism_1771079452274.png" "temple-hsinchu-puxian.jpg"
restore_file "taipei_wenchang_temple_realism_1771079481972.png" "temple-taipei-wenchang.jpg"

echo "Restoration complete."
