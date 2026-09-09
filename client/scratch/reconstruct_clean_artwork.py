import os
import math
from PIL import Image, ImageFilter

def refine_reconstruction():
    # =========================================================================
    # LIGHT THEME RECONSTRUCTION
    # =========================================================================
    card_l = Image.open('client/public/card_l_full.png').convert('RGB')
    w, h = card_l.size
    px_l = card_l.load()
    center_x = 697

    # Clean the top strip of Button 1 (x in [545, 680], y in [101, 106])
    for x in range(545, 605):
        # sample from the hill directly above (y=98 to 100)
        col = px_l[x, 99]
        for y in range(101, 108):
            # smooth downward slope
            t = (y - 100) / 10.0
            px_l[x, y] = (int(col[0] * (1 - t) + 245 * t),
                          int(col[1] * (1 - t) + 228 * t),
                          int(col[2] * (1 - t) + 188 * t))

    # Clean the top and sides of Button 2 (x in [780, 826], y in [101, 118])
    for x in range(780, w):
        for y in range(101, 115):
            # sample the trees/foliage from x=780, y=98
            col = px_l[x, 98]
            t = (y - 98) / 16.0
            px_l[x, y] = (int(col[0] * (1 - t) + 245 * t),
                          int(col[1] * (1 - t) + 228 * t),
                          int(col[2] * (1 - t) + 188 * t))

    # Reconstruct the classical entrance steps at x in [683, 712]
    # y=103 to 110: 4 crisp stone steps descending to the lawn
    for y in range(103, 111):
        for x in range(683, 712):
            if y % 2 == 0:
                # shadow riser
                px_l[x, y] = (195, 188, 172)
            else:
                # highlight tread
                px_l[x, y] = (235, 226, 208)

    # Base foundation wall & shrubs for Left Wing [605, 683] and Right Wing [712, 790]
    for y in range(103, 109):
        for x in range(605, 683):
            # check foliage above at y=100
            top_col = px_l[x, 100]
            if top_col[0] < 170 and top_col[1] > top_col[0] * 0.9:
                # green shrub/foliage continuation
                px_l[x, y] = (top_col[0] + 5, top_col[1] + 3, top_col[2] + 8)
            else:
                # stone plinth
                if y == 108:
                    px_l[x, y] = (175, 162, 130)  # base shadow
                elif y == 107:
                    px_l[x, y] = (212, 196, 160)  # plinth ledge
                else:
                    px_l[x, y] = (195, 180, 145)  # wall

    # Mirror to Right Wing [712, 790]
    for y in range(103, 109):
        for x in range(712, 790):
            sym_x = center_x - (x - center_x)
            if 605 <= sym_x <= 683:
                px_l[x, y] = px_l[sym_x, y]
            else:
                px_l[x, y] = (195, 180, 145)

    # Reconstruct pure lawn across y=109 to 154 for all x in [540, 826]
    for x in range(540, w):
        y_start = 111 if (683 <= x <= 712) else 109
        for y in range(y_start, h):
            t = (y - y_start) / float(h - y_start)
            if y <= y_start + 2:
                # soft ground shadow right at the building/steps base
                r = int(212 * (1 - t) + 246 * t)
                g = int(196 * (1 - t) + 228 * t)
                b = int(160 * (1 - t) + 188 * t)
            else:
                # smooth golden lawn
                r = int(238 * (1 - t) + 246 * t)
                g = int(220 * (1 - t) + 228 * t)
                b = int(180 * (1 - t) + 188 * t)
            px_l[x, y] = (r, g, b)

    # Subtle gaussian blur on reconstructed zone only to blend completely
    patch_l = card_l.crop((540, 101, w, h))
    blurred_l = patch_l.filter(ImageFilter.GaussianBlur(radius=0.6))
    card_l.paste(blurred_l, (540, 101))
    card_l.save('client/public/card_l_clean.png')
    print('Clean light card generated.')

    # =========================================================================
    # DARK THEME RECONSTRUCTION
    # =========================================================================
    card_d = Image.open('client/public/card_d_full.png').convert('RGB')
    px_d = card_d.load()

    # Dark background color of card is around (18, 24, 34) ~ #121822
    # The gold glowing hill curves down from (480, 100) to (590, 115)
    # 1. Clean the gold strip and top of Button 1 in Dark mode
    for x in range(540, 605):
        # sample dark hill crest above at y=100
        crest_col = px_d[x, 98]
        for y in range(100, 112):
            t = (y - 98) / 14.0
            px_d[x, y] = (int(crest_col[0] * (1 - t) + 18 * t),
                          int(crest_col[1] * (1 - t) + 24 * t),
                          int(crest_col[2] * (1 - t) + 34 * t))

    # 2. Clean the top and sides of Button 2 in Dark mode (x in [780, 826])
    for x in range(780, w):
        for y in range(101, 118):
            top_col = px_d[x, 98]
            t = (y - 98) / 18.0
            px_d[x, y] = (int(top_col[0] * (1 - t) + 18 * t),
                          int(top_col[1] * (1 - t) + 24 * t),
                          int(top_col[2] * (1 - t) + 34 * t))

    # 3. Entrance steps under clock tower (x in [683, 712]) in Dark mode
    # Illuminated golden entrance doors are at y=98 to 103
    # Step treads catch warm golden bounce light, risers are dark
    for y in range(103, 111):
        for x in range(683, 712):
            if y % 2 == 0:
                # dark riser
                px_d[x, y] = (25, 32, 42)
            else:
                # warm step highlight
                px_d[x, y] = (58, 62, 55)

    # 4. Foundation walls & shrubs for Dark mode Left [605, 683] and Right [712, 790]
    for y in range(103, 109):
        for x in range(605, 683):
            top_col = px_d[x, 100]
            if top_col[0] > 40 and top_col[1] > 35:
                # foliage / warm illuminated tree tone
                px_d[x, y] = (top_col[0] - 5, top_col[1] - 5, top_col[2] - 3)
            else:
                # stone wall in nighttime illumination
                if y == 108:
                    px_d[x, y] = (18, 22, 30)
                elif y == 107:
                    px_d[x, y] = (38, 45, 58)
                else:
                    px_d[x, y] = (28, 34, 45)

    # Mirror to Right Wing
    for y in range(103, 109):
        for x in range(712, 790):
            sym_x = center_x - (x - center_x)
            if 605 <= sym_x <= 683:
                px_d[x, y] = px_d[sym_x, y]
            else:
                px_d[x, y] = (28, 34, 45)

    # 5. Clean dark ground across y=109 to 154 for all x in [540, 826]
    for x in range(540, w):
        y_start = 111 if (683 <= x <= 712) else 109
        for y in range(y_start, h):
            t = (y - y_start) / float(h - y_start)
            # smooth dark surface matching #121822 down to #0E141E
            r = int(22 * (1 - t) + 14 * t)
            g = int(28 * (1 - t) + 20 * t)
            b = int(38 * (1 - t) + 28 * t)
            px_d[x, y] = (r, g, b)

    # Subtle gaussian blur on reconstructed zone only
    patch_d = card_d.crop((540, 100, w, h))
    blurred_d = patch_d.filter(ImageFilter.GaussianBlur(radius=0.6))
    card_d.paste(blurred_d, (540, 100))
    card_d.save('client/public/card_d_clean.png')
    print('Clean dark card generated.')

refine_reconstruction()
