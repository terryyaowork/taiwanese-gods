#!/bin/bash
set -x

ARTIFACTS_DIR="/Users/terryyao/.gemini/antigravity/brain/73b3ef71-bcab-47cc-a751-c7d936d4ef37"
DEST_DIR="src/assets/images/temples"

# Function to copy and convert
restore_image() {
    SRC="$1"
    DEST="$2"
    echo "Restoring $DEST from $SRC"
    
    # Remove existing file to be sure
    rm -f "$DEST_DIR/$DEST"
    
    # Copy png to temp
    cp "$ARTIFACTS_DIR/$SRC" "$DEST_DIR/temp_$SRC"
    
    # Convert to jpg
    sips -s format jpeg "$DEST_DIR/temp_$SRC" --out "$DEST_DIR/$DEST"
    
    # Remove temp
    rm "$DEST_DIR/temp_$SRC"
    
    # Verify
    ls -l "$DEST_DIR/$DEST"
}

restore_image "fagushan_temple_realism_v2_1771079110111.png" "temple-fagushan.jpg"
restore_image "foguangshan_temple_realism_1771079123858.png" "temple-foguangshan.jpg"
restore_image "taipei_confucius_temple_realism_1771079139777.png" "temple-taipei-confucius.jpg"
restore_image "songshan_fengtian_temple_realism_1771079211658.png" "temple-songshan-fengtian.jpg"
restore_image "yilan_sanqing_temple_realism_1771079280033.png" "temple-yilan-sanqing.jpg"
restore_image "taichung_fahua_temple_realism_1771079313034.png" "temple-taichung-fahua.jpg"
restore_image "tainan_tiantan_temple_realism_1771079329082.png" "temple-tainan-tiantan.jpg"
restore_image "donggang_donglong_temple_realism_1771079345316.png" "temple-donglong.jpg"
restore_image "zhushan_zinan_temple_realism_retry_2_1771079421760.png" "temple-zhushan-zinan.jpg"
restore_image "hsinchu_puxian_temple_realism_1771079452274.png" "temple-hsinchu-puxian.jpg"
restore_image "taipei_wenchang_temple_realism_1771079481972.png" "temple-taipei-wenchang.jpg"
