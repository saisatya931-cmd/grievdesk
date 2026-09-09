import os
import math
from PIL import Image, ImageFilter

def perfect_reconstruction():
    card_l = Image.open('client/public/card_l_full.png').convert('RGB')
    w, h = card_l.size
    px_l = card_l.load()
    center_x = 697

    # Curve of the foreground hill crest from x=450 to x=600
    def get_crest_y(x):
        if x >= 590:
            return 105
        if x <= 450:
            return 145
        t = (x - 450) / 140.0
        return int(145 - 40 * (t ** 1.3))

    # 1. Clean hill slope and remove any Button 1 artifacts
    for x in range(540, 610):
        crest_y = get_crest_y(x)
        # fill above crest_y if needed with midground hill
        for y in range(98, crest_y):
            # midground hill color around (246, 230, 200) down to (235, 218, 180)
            mid_t = (y - 98) / max(1.0, float(crest_y - 98))
            px_l[x, y] = (int(246 * (1 - mid_t) + 233 * mid_t),
                          int(232 * (1 - mid_t) + 217 * mid_t),
                          int(202 * (1 - mid_t) + 180 * mid_t))

    # 2. Reconstruct the classical stone steps at x in [682, 712]
    # y=103 to 110: 4 steps
    for y in range(103, 111):
        for x in range(682, 712):
            if y % 2 == 0:
                px_l[x, y] = (195, 186, 170)
            else:
                px_l[x, y] = (235, 226, 208)

    # 3. Base foundation wall & shrubs for Left Wing [600, 682] and Right Wing [712, 795]
    for y in range(103, 109):
        for x in range(600, 682):
            top_col = px_l[x, 100]
            if top_col[0] < 170 and top_col[1] > top_col[0] * 0.85:
                # green foliage
                px_l[x, y] = (top_col[0] + 5, top_col[1] + 4, top_col[2] + 8)
            else:
                # stone wall
                if y == 108:
                    px_l[x, y] = (175, 162, 130)
                elif y == 107:
                    px_l[x, y] = (212, 196, 160)
                else:
                    px_l[x, y] = (195, 180, 145)

    # Mirror to Right Wing [712, 794]
    for y in range(103, 109):
        for x in range(712, 795):
            sym_x = center_x - (x - center_x)
            if 600 <= sym_x <= 682:
                px_l[x, y] = px_l[sym_x, y]
            else:
                px_l[x, y] = (195, 180, 145)

    # 4. Clean right side trees and boundary [795, w]
    for x in range(795, w):
        for y in range(101, 110):
            # sample trees above
            px_l[x, y] = px_l[x, 99]

    # 5. Fill foreground lawn seamlessly from crest_y down to h=154
    for x in range(450, w):
        if x < 600:
            y_start = get_crest_y(x)
        elif 682 <= x <= 712:
            y_start = 111
        else:
            y_start = 109

        for y in range(y_start, h):
            t = (y - y_start) / float(h - y_start)
            if y == y_start:
                # crest edge tone
                r, g, b = (220, 206, 175) if x < 600 else (210, 195, 160)
            elif y <= y_start + 2:
                r = int(225 * (1 - t) + 246 * t)
                g = int(210 * (1 - t) + 228 * t)
                b = int(172 * (1 - t) + 188 * t)
            else:
                # sunny golden lawn
                r = int(240 * (1 - t) + 246 * t)
                g = int(222 * (1 - t) + 228 * t)
                b = int(182 * (1 - t) + 188 * t)
            px_l[x, y] = (r, g, b)

    # Apply a gentle 0.5px blur only to the inpainted region
    patch_l = card_l.crop((530, 98, w, h))
    blurred_l = patch_l.filter(ImageFilter.GaussianBlur(radius=0.5))
    card_l.paste(blurred_l, (530, 98))
    card_l.save('client/public/card_l_clean.png')
    print('Perfect light card generated.')

perfect_reconstruction()
