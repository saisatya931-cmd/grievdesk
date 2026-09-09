import os
import math
from PIL import Image, ImageFilter

def inpaint_hero(card_path, out_path, is_dark=False):
    card = Image.open(card_path).convert('RGB')
    w, h = card.size
    pixels = card.load()

    # Define button masks:
    # Button 1: x in [548, 680], y in [103, 137]
    # Button 2: x in [688, 803], y in [103, 137]
    
    # We create a mask of corrupted/button pixels
    mask = [[False for _ in range(h)] for _ in range(w)]
    
    # Fill mask for Button 1
    for x in range(548, 681):
        for y in range(103, 138):
            mask[x][y] = True
            
    # Fill mask for Button 2
    for x in range(688, 804):
        for y in range(103, 138):
            mask[x][y] = True

    # Also detect any stray button shadow or border pixels just outside
    for x in range(545, 808):
        for y in range(101, 140):
            r, g, b = pixels[x, y]
            if not is_dark:
                # In light mode: check if it is part of orange button or white button border/interior
                # Orange button:
                if (r > 185 and 100 < g < 175 and b < 80):
                    mask[x][y] = True
                # White button interior or blue-gray border:
                if (r > 245 and g > 245 and b > 245 and y > 103):
                    mask[x][y] = True
                if (20 < r < 90 and 30 < g < 100 and 40 < b < 120 and y > 103):
                    mask[x][y] = True
            else:
                # In dark mode:
                # Orange button:
                if (r > 190 and 110 < g < 185 and b < 65):
                    mask[x][y] = True
                # White/light button text or borders:
                if (r > 180 and g > 180 and b > 180 and y > 103):
                    mask[x][y] = True
                if (r < 25 and 15 < g < 35 and 25 < b < 45 and y > 103):
                    pass

    # Dilate mask slightly (1-2px) to ensure no border artifacts remain
    dilated = [[mask[x][y] for y in range(h)] for _ in range(w)]
    for x in range(1, w - 1):
        for y in range(1, h - 1):
            if mask[x][y]:
                for dx in [-1, 0, 1]:
                    for dy in [-1, 0, 1]:
                        dilated[x + dx][y + dy] = True
    mask = dilated

    # Multi-pass Laplace / harmonic inpainting
    # Initialize masked pixels with weighted vertical gradient between top boundary and bottom boundary
    for x in range(w):
        # find top valid and bottom valid y for this x
        for y in range(h):
            if mask[x][y]:
                # find nearest unmasked above and below
                y_top = y
                while y_top >= 0 and mask[x][y_top]:
                    y_top -= 1
                y_bot = y
                while y_bot < h and mask[x][y_bot]:
                    y_bot += 1
                
                # find nearest unmasked left and right
                x_left = x
                while x_left >= 0 and mask[x_left][y]:
                    x_left -= 1
                x_right = x
                while x_right < w and mask[x_right][y]:
                    x_right += 1

                weights = 0.0
                cr, cg, cb = 0.0, 0.0, 0.0

                if y_top >= 0:
                    d = y - y_top
                    w_t = 1.0 / (d * d)
                    pr, pg, pb = pixels[x, y_top]
                    cr += pr * w_t; cg += pg * w_t; cb += pb * w_t
                    weights += w_t
                if y_bot < h:
                    d = y_bot - y
                    w_b = 1.0 / (d * d)
                    pr, pg, pb = pixels[x, y_bot]
                    cr += pr * w_b; cg += pg * w_b; cb += pb * w_b
                    weights += w_b
                if x_left >= 0:
                    d = x - x_left
                    w_l = 1.0 / (d * d)
                    pr, pg, pb = pixels[x_left, y]
                    cr += pr * w_l; cg += pg * w_l; cb += pb * w_l
                    weights += w_l
                if x_right < w:
                    d = x_right - x
                    w_r = 1.0 / (d * d)
                    pr, pg, pb = pixels[x_right, y]
                    cr += pr * w_r; cg += pg * w_r; cb += pb * w_r
                    weights += w_r

                if weights > 0:
                    pixels[x, y] = (int(cr / weights), int(cg / weights), int(cb / weights))

    # Perform 50 relaxation/smoothing iterations on masked region to achieve smooth Poisson solution
    for iteration in range(60):
        new_pixels = {}
        for x in range(540, 815):
            for y in range(100, 142):
                if mask[x][y]:
                    r_sum, g_sum, b_sum = 0, 0, 0
                    count = 0
                    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < w and 0 <= ny < h:
                            pr, pg, pb = pixels[nx, ny]
                            r_sum += pr
                            g_sum += pg
                            b_sum += pb
                            count += 1
                    new_pixels[(x, y)] = (r_sum // count, g_sum // count, b_sum // count)
        for (x, y), col in new_pixels.items():
            pixels[x, y] = col

    # Save output
    card.save(out_path)
    print(f'Inpainted successfully to {out_path}')

inpaint_hero('client/public/card_l_full.png', 'client/public/card_l_inpainted.png', is_dark=False)
inpaint_hero('client/public/card_d_full.png', 'client/public/card_d_inpainted.png', is_dark=True)
