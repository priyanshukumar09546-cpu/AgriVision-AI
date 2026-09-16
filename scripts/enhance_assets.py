import os
import cv2
import numpy as np
from PIL import Image, ImageFilter

os.makedirs('public/assets', exist_ok=True)
os.makedirs('public/crops', exist_ok=True)
os.makedirs('public/samples', exist_ok=True)

REF_PATH = 'C:/Users/ASUS/.gemini/antigravity/brain/01f01200-b763-4e8d-b0bc-0533856587b7/.user_uploaded/media_1789187695340.jpg'
ref = cv2.imread(REF_PATH)
ref_h, ref_w, _ = ref.shape

print(f"Loaded reference image: {ref_w}x{ref_h}")

# ==============================================================================
# Helper functions for High-Quality Image Enhancement & Super-Resolution
# ==============================================================================

def super_resolve_and_sharpen(img, scale=2.0, unsharp_strength=0.5, clahe_clip=1.5):
    """
    High-fidelity super-resolution pipeline:
    1. Deblock & denoise
    2. High-order Lanczos interpolation
    3. LAB color space contrast-limited adaptive histogram equalization
    4. Unsharp masking on luminance channel
    """
    # 1. Denoise chroma & luma
    denoised = cv2.fastNlMeansDenoisingColored(img, None, 3, 3, 7, 21)
    
    # 2. Lanczos upscale
    target_w = int(img.shape[1] * scale)
    target_h = int(img.shape[0] * scale)
    upscaled = cv2.resize(denoised, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)
    
    # 3. LAB Enhancement
    lab = cv2.cvtColor(upscaled, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    
    clahe = cv2.createCLAHE(clipLimit=clahe_clip, tileGridSize=(8, 8))
    l_enhanced = clahe.apply(l)
    
    # 4. Unsharp mask
    blurred = cv2.GaussianBlur(l_enhanced, (0, 0), 1.2)
    l_sharp = cv2.addWeighted(l_enhanced, 1.0 + unsharp_strength, blurred, -unsharp_strength, 0)
    
    merged = cv2.merge([l_sharp, a, b])
    return cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)

# ==============================================================================
# 1. ENHANCE 8 CROPS TO 256x256 HIGH-DPI RETINA ASSETS
# ==============================================================================
print("\n--- Processing 8 Crop Images ---")
# Extract crop cards from reference
# In 1024x682 ref, crop area is y: 375..485, x: 25..590
crop_names = ['tomato', 'potato', 'chili', 'cotton', 'wheat', 'rice', 'maize', 'soybean']
# Card horizontal boundaries in reference:
card_w = (590 - 25) / 8.0

for i, name in enumerate(crop_names):
    x1 = int(25 + i * card_w)
    x2 = int(25 + (i + 1) * card_w)
    card_crop = ref[375:485, x1:x2]
    
    # The photo inside the card is approximately y: 22..76, x: 8..62
    photo_crop = card_crop[20:76, 8:62]
    
    # Super-resolve to 256x256
    enhanced = super_resolve_and_sharpen(photo_crop, scale=4.5, unsharp_strength=0.7, clahe_clip=1.8)
    enhanced = cv2.resize(enhanced, (256, 256), interpolation=cv2.INTER_LANCZOS4)
    
    # Make background clean/soft matching card
    # Find background mask (near white/light grey borders)
    gray = cv2.cvtColor(enhanced, cv2.COLOR_BGR2GRAY)
    
    # Save high-res PNG
    out_path = f'public/crops/{name}.png'
    cv2.imwrite(out_path, enhanced)
    print(f"Saved {out_path} ({enhanced.shape[1]}x{enhanced.shape[0]})")

# ==============================================================================
# 2. ENHANCE 6 SAMPLES TO 160x160 HIGH-DPI RETINA ASSETS
# ==============================================================================
print("\n--- Processing 6 Sample Leaf Thumbnails ---")
# Samples are in 3x2 grid in reference around y: 395..468, x: 815..968
samples_area = ref[395:468, 815:968]
sh, sw, _ = samples_area.shape
col_w = sw / 3.0
row_h = sh / 2.0

for r in range(2):
    for c in range(3):
        idx = r * 3 + c + 1
        x1 = int(c * col_w) + 3
        x2 = int((c + 1) * col_w) - 3
        y1 = int(r * row_h) + 2
        y2 = int((r + 1) * row_h) - 2
        
        sample_crop = samples_area[y1:y2, x1:x2]
        enhanced_sample = super_resolve_and_sharpen(sample_crop, scale=4.5, unsharp_strength=0.8, clahe_clip=2.0)
        enhanced_sample = cv2.resize(enhanced_sample, (160, 160), interpolation=cv2.INTER_LANCZOS4)
        
        out_path = f'public/samples/sample_{idx}.jpg'
        cv2.imwrite(out_path, enhanced_sample, [int(cv2.IMWRITE_JPEG_QUALITY), 98])
        print(f"Saved {out_path} ({enhanced_sample.shape[1]}x{enhanced_sample.shape[0]})")

# ==============================================================================
# 3. ENHANCE BOTTOM AGRICULTURAL BANNER
# ==============================================================================
print("\n--- Processing Bottom Agricultural Banner ---")
# In reference (1024x682), bottom banner is at y: 600..682
banner_crop = ref[600:682, :]
bh, bw, _ = banner_crop.shape

# Clean text from banner using inpainting
# Text is bright pixels (white text)
banner_gray = cv2.cvtColor(banner_crop, cv2.COLOR_BGR2GRAY)
mask_text = (banner_gray > 165).astype(np.uint8) * 255
# Dilate mask
kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
mask_text = cv2.dilate(mask_text, kernel, iterations=2)

# Inpaint using Telea / Navier-Stokes
banner_inpainted = cv2.inpaint(banner_crop, mask_text, inpaintRadius=3, flags=cv2.INPAINT_TELEA)

# Super-resolve to 2560x260 for crystal-clear wide rendering
enhanced_banner = super_resolve_and_sharpen(banner_inpainted, scale=2.5, unsharp_strength=0.4, clahe_clip=1.4)
enhanced_banner = cv2.resize(enhanced_banner, (2560, 240), interpolation=cv2.INTER_LANCZOS4)

banner_out = 'public/assets/bottom_banner_clean_2x.jpg'
cv2.imwrite(banner_out, enhanced_banner, [int(cv2.IMWRITE_JPEG_QUALITY), 98])
print(f"Saved {banner_out} ({enhanced_banner.shape[1]}x{enhanced_banner.shape[0]})")

# ==============================================================================
# 4. ENHANCE HERO CONTINUOUS PHOTOGRAPH (LEAF + FIELD + LEFT BLEND)
# ==============================================================================
print("\n--- Processing Hero Section Background ---")
# In ref (1024x682), hero is y: 40..359 (height 319)
hero_raw = ref[40:359, :]
hh, hw, _ = hero_raw.shape

# 1. Super-resolve the entire hero region to 2560x798 (2.5x upscale)
hero_enhanced = super_resolve_and_sharpen(hero_raw, scale=2.5, unsharp_strength=0.6, clahe_clip=1.6)
eh_h, eh_w, _ = hero_enhanced.shape
print(f"Hero enhanced shape: {eh_w}x{eh_h}")

# In the enhanced image:
# Left portion (x < 0.44 * eh_w) contains original text that needs smooth white transition.
# We will create an ultra-smooth, silky 32-bit gradient:
# At x=0: pure #FFFFFF
# Transition gently through x = 0.35 * eh_w to 0.48 * eh_w into the photographic field.

split_x = int(eh_w * 0.48)
fade_start = int(eh_w * 0.30)

hero_final = hero_enhanced.copy()

# Sample the vertical profile at split_x
profile_col = hero_enhanced[:, split_x].astype(float)
# Smooth the column vertically slightly for natural lighting
profile_smooth = cv2.GaussianBlur(profile_col, (1, 15), 0)

for x in range(split_x):
    if x < fade_start:
        t = 0.0
    else:
        # Smoothstep curve between fade_start and split_x
        linear = (x - fade_start) / float(split_x - fade_start)
        t = linear * linear * (3 - 2 * linear)
        
    white_bg = np.array([255.0, 255.0, 255.0]) # BGR pure white
    col = (1.0 - t) * white_bg + t * profile_smooth
    # Add subtle random dither to avoid any 8-bit banding
    dither = np.random.uniform(-0.4, 0.4, col.shape)
    hero_final[:, x] = np.clip(col + dither, 0, 255).astype(np.uint8)

# Smooth the seam around split_x
seam_w = 40
seam_left = max(0, split_x - seam_w)
seam_right = min(eh_w, split_x + seam_w)
seam_roi = hero_final[:, seam_left:seam_right]
seam_blurred = cv2.GaussianBlur(seam_roi, (15, 1), 0)
hero_final[:, seam_left:seam_right] = seam_blurred

hero_out = 'public/assets/hero_bg_continuous_2x.jpg'
cv2.imwrite(hero_out, hero_final, [int(cv2.IMWRITE_JPEG_QUALITY), 98])
print(f"Saved {hero_out} ({hero_final.shape[1]}x{hero_final.shape[0]})")

print("\n=== ALL ASSETS ENHANCED TO 2X/RETINA HIGH-RESOLUTION ===")
