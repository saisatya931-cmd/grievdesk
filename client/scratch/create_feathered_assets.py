import os
import math
from PIL import Image, ImageFilter

def create_feathered_assets():
    # Load clean cards
    card_l = Image.open('client/public/card_l_clean.png').convert('RGBA')
    card_d = Image.open('client/public/card_d_clean.png').convert('RGBA')
    w, h = card_l.size

    # Crop from x=415 to w (826), width = 411, height = 154
    crop_x_start = 415
    art_l = card_l.crop((crop_x_start, 0, w, h))
    art_d = card_d.crop((crop_x_start, 0, w, h))

    art_w, art_h = art_l.size
    px_l = art_l.load()
    px_d = art_d.load()

    # Target background colors for seamless blending
    # Light theme card background: #FFFFFF
    bg_l = (255, 255, 255)
    # Dark theme card background: #141A26
    bg_d = (20, 26, 38)

    # 1. Fix bottom-left notch in Light mode
    for x in range(0, 30):
        for y in range(135, art_h):
            px_l[x, y] = (246, 227, 186, 255)

    # 2. Fix bottom-left border line and stray dot in Dark mode
    for x in range(0, 150):
        for y in range(135, art_h):
            px_d[x, y] = (bg_d[0], bg_d[1], bg_d[2], 255)
    # Stray dot under steps at x=270, y=113
    for dx in range(-3, 4):
        for dy in range(-3, 4):
            x = 697 - crop_x_start + dx
            y = 113 + dy
            if 0 <= x < art_w and 0 <= y < art_h:
                px_d[x, y] = (bg_d[0], bg_d[1], bg_d[2], 255)

    # 3. Soften the plinth light under left wing in dark mode (x in [600, 680] -> local x in [185, 265])
    for x in range(600 - crop_x_start, 680 - crop_x_start):
        for y in range(104, 110):
            r, g, b, _ = px_d[x, y]
            # Tone down overly bright pixels
            if r > 60:
                px_d[x, y] = (int(r * 0.45 + bg_d[0] * 0.55),
                              int(g * 0.45 + bg_d[1] * 0.55),
                              int(b * 0.45 + bg_d[2] * 0.55),
                              255)

    # 4. Smooth feathering on left edge (width 55px)
    feather_w = 55

    for x in range(art_w):
        for y in range(art_h):
            if x < feather_w:
                t = x / float(feather_w)
                # Smooth sinusoidal ease curve
                ease = 0.5 - 0.5 * math.cos(math.pi * t)
                
                # Blend Light mode RGB towards pure white and set alpha
                r_l, g_l, b_l, _ = px_l[x, y]
                blended_r_l = int(bg_l[0] * (1 - ease) + r_l * ease)
                blended_g_l = int(bg_l[1] * (1 - ease) + g_l * ease)
                blended_b_l = int(bg_l[2] * (1 - ease) + b_l * ease)
                alpha_l = int(255 * ease)
                px_l[x, y] = (blended_r_l, blended_g_l, blended_b_l, alpha_l)

                # Blend Dark mode RGB towards #141A26 and set alpha
                r_d, g_d, b_d, _ = px_d[x, y]
                blended_r_d = int(bg_d[0] * (1 - ease) + r_d * ease)
                blended_g_d = int(bg_d[1] * (1 - ease) + g_d * ease)
                blended_b_d = int(bg_d[2] * (1 - ease) + b_d * ease)
                alpha_d = int(255 * ease)
                px_d[x, y] = (blended_r_d, blended_g_d, blended_b_d, alpha_d)

    art_l.save('client/public/campus-hero-light.png')
    art_d.save('client/public/campus-hero-dark.png')
    print('Refined campus-hero-light.png and campus-hero-dark.png saved!')

create_feathered_assets()
