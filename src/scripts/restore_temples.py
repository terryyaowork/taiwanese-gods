import os
import shutil
import subprocess

# Map artifact filenames to destination filenames
# Source is in artifacts dir: /Users/terryyao/.gemini/antigravity/brain/73b3ef71-bcab-47cc-a751-c7d936d4ef37
# Dest is in: src/assets/images/temples

ARTIFACTS_DIR = "/Users/terryyao/.gemini/antigravity/brain/73b3ef71-bcab-47cc-a751-c7d936d4ef37"
DEST_DIR = "src/assets/images/temples"

MAPPING = {
    "fagushan_temple_realism_v2_1771079110111.png": "temple-fagushan.jpg",
    "foguangshan_temple_realism_1771079123858.png": "temple-foguangshan.jpg",
    "taipei_confucius_temple_realism_1771079139777.png": "temple-taipei-confucius.jpg",
    "songshan_fengtian_temple_realism_1771079211658.png": "temple-songshan-fengtian.jpg",
    "yilan_sanqing_temple_realism_1771079280033.png": "temple-yilan-sanqing.jpg",
    "taichung_fahua_temple_realism_1771079313034.png": "temple-taichung-fahua.jpg",
    "tainan_tiantan_temple_realism_1771079329082.png": "temple-tainan-tiantan.jpg",
    "donggang_donglong_temple_realism_1771079345316.png": "temple-donglong.jpg",
    "zhushan_zinan_temple_realism_retry_2_1771079421760.png": "temple-zhushan-zinan.jpg",
    "hsinchu_puxian_temple_realism_1771079452274.png": "temple-hsinchu-puxian.jpg",
    "taipei_wenchang_temple_realism_1771079481972.png": "temple-taipei-wenchang.jpg"
}

def restore_images():
    print(f"Starting restoration of {len(MAPPING)} images...")
    
    # Ensure dest dir exists
    if not os.path.exists(DEST_DIR):
        print(f"Creating directory: {DEST_DIR}")
        os.makedirs(DEST_DIR, exist_ok=True)

    success_count = 0
    fail_count = 0

    for artifact_name, dest_name in MAPPING.items():
        src_path = os.path.join(ARTIFACTS_DIR, artifact_name)
        dest_path_jpg = os.path.join(DEST_DIR, dest_name)
        temp_png_path = os.path.join(DEST_DIR, "temp_" + artifact_name)
        
        print(f"\nProcessing: {dest_name}")
        
        # 1. Verify source exists
        if not os.path.exists(src_path):
            print(f"Error: Source file not found: {src_path}")
            fail_count += 1
            continue
            
        try:
            # 2. Copy to temp location
            print(f"  Copying {src_path} -> {temp_png_path}")
            shutil.copy2(src_path, temp_png_path)
            
            # 3. Convert using sips
            print(f"  Converting to JPG: {dest_path_jpg}")
            # If sips fails, we might just rename it, but let's try sips first
            cmd = ["sips", "-s", "format", "jpeg", temp_png_path, "--out", dest_path_jpg]
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                print("  Conversion successful.")
                success_count += 1
            else:
                print(f"  sips conversion failed: {result.stderr}")
                print("  Falling back to direct copy/rename (browser might handle it).")
                shutil.copy2(temp_png_path, dest_path_jpg)
                success_count += 1
                
            # 4. Cleanup temp file
            if os.path.exists(temp_png_path):
                os.remove(temp_png_path)
                
        except Exception as e:
            print(f"  Exception during processing: {e}")
            fail_count += 1
            
    print(f"\nRestoration complete. Success: {success_count}, Failed: {fail_count}")

if __name__ == "__main__":
    restore_images()
