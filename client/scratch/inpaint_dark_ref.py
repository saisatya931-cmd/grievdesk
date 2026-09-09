import os
from PIL import Image, ImageFilter

def inpaint_dark_reference():
    im = Image.open(r'C:\Users\Lenovo\.gemini\antigravity-ide\brain\baeeefc1-d7a8-4b2f-b86b-83e1428e6f38\.user_uploaded\media_1788852984926.png').convert('RGBA')
    w, h = im.size
    px = im.load()

    # Dark ground color matching the bottom of the card
    bg_ground = (12, 20, 29) # #0C141D
    center_x = 798 # clock tower center

    # Button 1 is at x in [625, 775], y in [118, 158]
    # Button 2 is at x in [780, 930], y in [118, 158]

    # 1. Entrance steps under clock tower (x in [782, 814], y in [118, 126])
    for y in range(118, 126):
        for x in range(782, 814):
            if y % 2 == 0:
                px[x, y] = (25, 32, 42, 255) # dark riser
            else:
                px[x, y] = (56, 62, 54, 255) # step tread highlight

    # 2. Left wing plinth [690, 782] and Right wing plinth [814, 905] at y in [118, 124]
    for y in range(118, 124):
        for x in range(690, 782):
            top_col = px[x, 115]
            if top_col[0] > 40 and top_col[1] > 35:
                # foliage continuation
                px[x, y] = (top_col[0] - 4, top_col[1] - 4, top_col[2] - 2, 255)
            else:
                # plinth
                px[x, y] = (30, 36, 48, 255)

    # Mirror to right wing plinth
    for y in range(118, 124):
        for x in range(814, 905):
            sym_x = center_x - (x - center_x)
            if 690 <= sym_x <= 782:
                px[x, y] = px[sym_x, y]
            else:
                px[x, y] = (30, 36, 48, 255)

    # 3. Gold hill ribbon continuation for x in [620, 695]
    # The crest slopes from (620, 118) down to meet the trees around (695, 124)
    for x in range(620, 695):
        crest_y = int(118 + (x - 620) * 0.08)
        # sample crest color from x=620, y=116
        crest_col = px[x, 114]
        for y in range(116, crest_y):
            px[x, y] = crest_col

    # 4. Right side trees continuation for x in [905, 935], y in [118, 126]
    for x in range(905, 935):
        for y in range(118, 126):
            px[x, y] = px[x, 115]

    # 5. Clean dark ground below y_start to bottom (h=177) across all button area [620, 935]
    for x in range(620, 935):
        y_start = 126 if (782 <= x <= 814) else 124
        for y in range(y_start, h):
            t = (y - y_start) / float(h - y_start)
            r = int(20 * (1 - t) + bg_ground[0] * t)
            g = int(26 * (1 - t) + bg_ground[1] * t)
            b = int(36 * (1 - t) + bg_ground[2] * t)
            px[x, y] = (r, g, b, 255)

    # Subtle gaussian blur on the reconstructed region to blend seamlessly
    patch = im.crop((615, 116, 940, h))
    blurred = patch.filter(ImageFilter.GaussianBlur(radius=0.5))
    im.paste(blurred, (615, 116))

    # Save full clean dark card
    im.save('client/public/hero_dark_clean_full.png')
    print('Clean dark hero full saved!')

    # Now create the right-side artwork asset (from x=470 to w, width 472, height 177)
    # With a smooth 55px alpha feather on the left edge
    art_d = im.crop((470, 0, w, h))
    px_art = art_d.load()
    art_w, art_h = art_d.size
    feather_w = 55

    for x in range(art_w):
        for y in range(art_h):
            if x < feather_w:
                t = x / float(feather_w)
                alpha = int(255 * (t ** 1.5))
                r, g, b, _ = px_art[x, y]
                # blend RGB towards bg_ground
                blended_r = int(bg_ground[0] * (1 - t) + r * t)
                blended_g = int(bg_ground[1] * (1 - t) + g * t)
                blended_b = int(bg_ground[2] * (1 - t) + b * t)
                px_art[x, y] = (blended_r, blended_g, blended_b, alpha)

    art_d.save('client/public/campus-hero-dark.png')
    print('Clean campus-hero-dark.png saved!')

inpaint_dark_reference()
