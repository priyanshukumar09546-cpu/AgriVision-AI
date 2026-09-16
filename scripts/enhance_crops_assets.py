import os
import cv2
import numpy as np

os.makedirs('public/crops_assets', exist_ok=True)

REF_PATH = 'C:/Users/ASUS/.gemini/antigravity/brain/01f01200-b763-4e8d-b0bc-0533856587b7/.user_uploaded/media_1789190317363.jpg'
ref = cv2.imread(REF_PATH)
ref_h, ref_w, _ = ref.shape
print(f"Loaded Crops reference image: {ref_w}x{ref_h}")

def super_resolve(img, scale=3.5, unsharp=0.6, clahe_clip=1.8):
    denoised = cv2.fastNlMeansDenoisingColored(img, None, 3, 3, 7, 21)
    target_w = int(img.shape[1] * scale)
    target_h = int(img.shape[0] * scale)
    up = cv2.resize(denoised, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
    lab = cv2.cvtColor(up, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=clahe_clip, tileGridSize=(8, 8))
    l_c = clahe.apply(l)
    blurred = cv2.GaussianBlur(l_c, (0, 0), 1.0)
    l_s = cv2.addWeighted(l_c, 1.0 + unsharp, blurred, -unsharp, 0)
    return cv2.cvtColor(cv2.merge([l_s, a, b]), cv2.COLOR_LAB2BGR)

# ==============================================================================
# 1. ENHANCE ALL 18 CROP IMAGES
# ==============================================================================
print("\n--- Processing 18 Crop Photographs ---")
crop_names = [
    'tomato', 'potato', 'chili', 'cotton', 'wheat', 'rice',
    'maize', 'soybean', 'sugarcane', 'apple', 'grapes', 'orange',
    'banana', 'mango', 'groundnut', 'sunflower', 'mustard', 'onion'
]

# Grid in reference is y: 205..595, x: 195..995
grid_y1, grid_y2 = 205, 595
grid_x1, grid_x2 = 195, 995
grid_area = ref[grid_y1:grid_y2, grid_x1:grid_x2]
gh, gw, _ = grid_area.shape
col_w = gw / 6.0
row_h = gh / 3.0

for r in range(3):
    y_start = int(r * row_h)
    y_end = int((r + 1) * row_h)
    row_crop = grid_area[y_start:y_end, :]
    
    for c in range(6):
        idx = r * 6 + c
        name = crop_names[idx]
        x_start = int(c * col_w)
        x_end = int((c + 1) * col_w)
        card_crop = row_crop[:, x_start:x_end]
        
        # Photo is in the top 58% of the card
        ch, cw, _ = card_crop.shape
        photo_raw = card_crop[4:int(ch * 0.58), 4:cw - 4]
        
        # Super-resolve to high-DPI 400x230
        enhanced = super_resolve(photo_raw, scale=3.5, unsharp=0.65, clahe_clip=1.8)
        enhanced = cv2.resize(enhanced, (400, 230), interpolation=cv2.INTER_LANCZOS4)
        
        out_path = f'public/crops_assets/crop_{name}_2x.jpg'
        cv2.imwrite(out_path, enhanced, [int(cv2.IMWRITE_JPEG_QUALITY), 98])
        print(f"Saved {out_path} ({enhanced.shape[1]}x{enhanced.shape[0]})")

# ==============================================================================
# 2. ENHANCE FULL-WIDTH HERO AGRICULTURAL BACKGROUND
# ==============================================================================
print("\n--- Processing Hero Background ---")
# In reference (1024x682), hero is y: 40..170 (height 130)
hero_raw = ref[40:170, :]
enhanced_hero = super_resolve(hero_raw, scale=2.5, unsharp=0.5, clahe_clip=1.5)
eh_h, eh_w, _ = enhanced_hero.shape
print(f"Hero enhanced shape: {eh_w}x{eh_h}")

# In the enhanced hero image, create smooth white/light-tinted fade on the left:
# Pure white at x=0..0.30*eh_w, then smoothstep into the field around 0.45*eh_w
hero_final = enhanced_hero.copy()
fade_start = int(eh_w * 0.22)
fade_end = int(eh_w * 0.48)
profile_col = enhanced_hero[:, fade_end].astype(float)
profile_smooth = cv2.GaussianBlur(profile_col, (1, 15), 0)

for x in range(fade_end):
    if x < fade_start:
        t = 0.0
    else:
        linear = (x - fade_start) / float(fade_end - fade_start)
        t = linear * linear * (3 - 2 * linear)
    white_bg = np.array([255.0, 255.0, 255.0])
    col = (1.0 - t) * white_bg + t * profile_smooth
    hero_final[:, x] = np.clip(col, 0, 255).astype(np.uint8)

# Smooth seam
seam_roi = hero_final[:, fade_end - 25:fade_end + 25]
hero_final[:, fade_end - 25:fade_end + 25] = cv2.GaussianBlur(seam_roi, (15, 1), 0)

hero_out = 'public/crops_assets/hero_crops_bg_2x.jpg'
cv2.imwrite(hero_out, hero_final, [int(cv2.IMWRITE_JPEG_QUALITY), 98])
print(f"Saved {hero_out} ({hero_final.shape[1]}x{hero_final.shape[0]})")

# ==============================================================================
# 3. ENHANCE BOTTOM BANNER RIGHT SPROUT IMAGE
# ==============================================================================
print("\n--- Processing Bottom Banner Sprout Image ---")
# In reference, bottom banner sprout is around y: 605..682, x: 860..1024
sprout_raw = ref[605:682, 850:1024]
enhanced_sprout = super_resolve(sprout_raw, scale=3.0, unsharp=0.6, clahe_clip=1.6)
sprout_out = 'public/crops_assets/bottom_plant_sprout_2x.jpg'
cv2.imwrite(sprout_out, enhanced_sprout, [int(cv2.IMWRITE_JPEG_QUALITY), 98])
print(f"Saved {sprout_out} ({enhanced_sprout.shape[1]}x{enhanced_sprout.shape[0]})")

print("\n=== ALL CROPS ASSETS ENHANCED TO 2X/RETINA ===")
