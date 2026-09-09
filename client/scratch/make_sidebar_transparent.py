import os
import math
from PIL import Image

def make_transparent():
    # DARK SKETCH
    im_d = Image.open('client/public/sidebar-sketch-dark.png').convert('RGBA')
    px_d = im_d.load()
    w_d, h_d = im_d.size

    # Background color in dark sketch is roughly (12, 18, 28)
    for x in range(w_d):
        for y in range(h_d):
            r, g, b, a = px_d[x, y]
            # distance from dark background
            # The lines and text have either higher luminance or distinctive color (gold script or silver lines)
            diff = max(0, r - 12) * 1.5 + max(0, g - 18) * 1.2 + max(0, b - 26) * 1.0
            if diff < 12:
                px_d[x, y] = (r, g, b, 0)
            elif diff < 45:
                alpha = int(255 * (diff - 12) / 33.0)
                px_d[x, y] = (r, g, b, alpha)
            else:
                px_d[x, y] = (r, g, b, 255)

    im_d.save('client/public/sidebar-sketch-dark.png')

    # LIGHT SKETCH
    im_l = Image.open('client/public/sidebar-sketch-light.png').convert('RGBA')
    px_l = im_l.load()
    w_l, h_l = im_l.size

    # Background color in light sketch is roughly (244, 241, 235)
    for x in range(w_l):
        for y in range(h_l):
            r, g, b, a = px_l[x, y]
            # darkness difference from light background
            diff = max(0, 244 - r) + max(0, 241 - g) + max(0, 235 - b)
            if diff < 12:
                px_l[x, y] = (r, g, b, 0)
            elif diff < 45:
                alpha = int(255 * (diff - 12) / 33.0)
                px_l[x, y] = (r, g, b, alpha)
            else:
                px_l[x, y] = (r, g, b, 255)

    im_l.save('client/public/sidebar-sketch-light.png')
    print('Transparent sidebar sketches created successfully!')

make_transparent()
