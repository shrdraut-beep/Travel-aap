import sys
import os
from PIL import Image, ImageFilter
import numpy as np
from collections import deque

def process_icon(input_path: str, output_filenames: list):
    if not os.path.exists(input_path):
        print(f"Error: input file {input_path} not found.")
        return False

    im = Image.open(input_path).convert('RGB')
    w, h = im.size
    arr = np.array(im, dtype=np.float32)

    diff_rg = np.abs(arr[:, :, 0] - arr[:, :, 1])
    diff_gb = np.abs(arr[:, :, 1] - arr[:, :, 2])
    diff_br = np.abs(arr[:, :, 2] - arr[:, :, 0])
    max_diff = np.maximum(diff_rg, np.maximum(diff_gb, diff_br))
    brightness = arr.mean(axis=2)

    visited = np.zeros((h, w), dtype=bool)
    q = deque()

    # Flood fill from outer boundaries
    for x in range(w):
        q.append((0, x)); visited[0, x] = True
        q.append((h - 1, x)); visited[h - 1, x] = True
    for y in range(h):
        q.append((y, 0)); visited[y, 0] = True
        q.append((y, w - 1)); visited[y, w - 1] = True

    while q:
        y, x = q.popleft()
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                # Transparent checkerboard (white / neutral grey) or pure white
                if (max_diff[ny, nx] < 22 and brightness[ny, nx] > 120) or (brightness[ny, nx] > 240):
                    visited[ny, nx] = True
                    q.append((ny, nx))

    alpha = np.where(visited, 0, 255).astype(np.uint8)
    alpha_img = Image.fromarray(alpha, 'L').filter(ImageFilter.GaussianBlur(radius=0.8))

    rgba_arr = np.dstack([arr.astype(np.uint8), np.array(alpha_img)])
    out_im = Image.fromarray(rgba_arr, 'RGBA')

    bbox = out_im.getbbox()
    print(f"Bbox for {os.path.basename(input_path)}: {bbox}")
    if not bbox:
        print("Warning: empty bbox detected.")
        return False

    cropped = out_im.crop(bbox)
    c_w, c_h = cropped.size
    scale = min(210 / c_w, 205 / c_h)
    new_w = max(1, int(c_w * scale))
    new_h = max(1, int(c_h * scale))
    resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)

    final_canvas = Image.new('RGBA', (230, 224), (0, 0, 0, 0))
    paste_x = (230 - new_w) // 2
    paste_y = (224 - new_h) // 2
    final_canvas.paste(resized, (paste_x, paste_y), resized)

    for out_name in output_filenames:
        dest = os.path.join(os.getcwd(), 'public', 'icons', out_name)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        final_canvas.save(dest)
        print(f"Saved: {dest}")

    return True

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python process_icon.py <input_img> <output_name1> [output_name2...]")
        sys.exit(1)
    input_file = sys.argv[1]
    out_files = sys.argv[2:]
    process_icon(input_file, out_files)
