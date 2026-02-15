#!/bin/bash

# Define source directory (artifacts) and destination directory
ARTIFACTS_DIR="/Users/terryyao/.gemini/antigravity/brain/70a15c6f-26b2-4fae-b93a-2ac78e60ec6c"
DEST_DIR="src/assets/images/gods"

# Ensure destination directory exists
mkdir -p "$DEST_DIR"

echo "Applying V3 Ink Wash Images..."

# Array of source_file:dest_file pairs
targets=(
    "god_wangmu_v3_ink_wash_1771101882361.png:god-wangmu.png"
    "god_medicine_buddha_v2_ink_wash_1771101895982.png:god-medicine-buddha.png"
    "god_dazhongye_v2_ink_wash_1771101910777.png:god-dazhongye.png"
    "god_door_gods_v2_ink_wash_1771101929246.png:god-door-gods.png"
    "guanyin_v2_ink_wash_1771101951846.png:guanyin.png"
    "fudomyoo_v2_ink_wash_1771101969245.png:fudomyoo.png"
    "qiniangma_v2_ink_wash_1771101984648.png:qiniangma.png"
)

for target in "${targets[@]}"; do
    IFS=":" read -r src_file dest_file <<< "$target"
    
    if [ -f "$ARTIFACTS_DIR/$src_file" ]; then
        echo "Copying $src_file to $dest_file..."
        /bin/cp -f "$ARTIFACTS_DIR/$src_file" "$DEST_DIR/$dest_file"
    else
        echo "Warning: Source file $src_file not found in artifacts directory."
    fi
done

echo "Image update complete."
ls -l "$DEST_DIR"
