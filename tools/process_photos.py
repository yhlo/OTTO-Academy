# -*- coding: utf-8 -*-
"""
OTTO Academy 上課照片批次處理工具
==================================
把原始照片丟進 tools/photo_in/ 資料夾，執行這支腳本（Spyder 按 F5 或
終端機執行 python tools/process_photos.py），就會自動：

  1. 縮圖到最大寬度 1600px（網頁夠用，載入快）
  2. （可選）跳出視窗讓你用滑鼠框選要模糊的區域（臉部、名字等）
  3. 右下角蓋上半透明 logoT 浮水印
  4. 移除 EXIF 資訊（拍攝地點 GPS 等隱私資料）
  5. 壓縮成 JPEG 存到 img/gallery/
  6. 問你每張照片的 caption（照片下方的說明文字，直接按 Enter 留空）
  7. 自動把新照片加進 scripts/scripts.js 的 GALLERY，網站直接生效

框選視窗操作方式：
  - 滑鼠拖曳：框選一個要模糊的區域（可以框很多個）
  - Z 鍵：復原上一個框
  - Enter 鍵：確認，套用模糊並繼續
  - Esc 鍵：這張照片不做任何模糊

中文檔名會自動改成 photo-日期-編號.jpg，避免 GitHub Pages 網址編碼問題。
也可以直接指定檔案：python tools/process_photos.py 路徑1.jpg 路徑2.png
"""

import sys
from datetime import date
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageOps

# ---- 可調整的設定 ----------------------------------------------------
MAX_WIDTH = 1600          # 輸出圖片最大寬度（px），小於這個寬度就不放大
JPEG_QUALITY = 82         # JPEG 壓縮品質（1-95，越高檔案越大）
WATERMARK_WIDTH_RATIO = 0.18   # 浮水印寬度佔圖片寬度的比例
WATERMARK_OPACITY = 0.40       # 浮水印透明度（0 完全透明 ~ 1 完全不透明）
WATERMARK_MARGIN_RATIO = 0.025 # 浮水印離右下角邊緣的距離比例
BLUR_STRENGTH = 5              # 模糊強度（框越大模糊越重，這是整體倍率）
SELECTOR_MAX_SIZE = (1280, 800)  # 框選視窗最大尺寸（超過會等比例縮小顯示）
# ----------------------------------------------------------------------

ROOT = Path(__file__).resolve().parents[1]
INPUT_DIR = ROOT / "tools" / "photo_in"
OUTPUT_DIR = ROOT / "img" / "gallery"
LOGO_PATH = ROOT / "img" / "logoT.png"

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff"}


def is_ascii(text: str) -> bool:
    return all(ord(ch) < 128 for ch in text)


def load_logo() -> Image.Image:
    logo = Image.open(LOGO_PATH).convert("RGBA")
    # 依設定的透明度調整 logo 的 alpha 通道
    alpha = logo.getchannel("A").point(lambda a: int(a * WATERMARK_OPACITY))
    logo.putalpha(alpha)
    return logo


# ---------------------------------------------------------------------
# 臉部／隱私區域模糊：跳出視窗讓使用者拖曳框選，再對框選區套高斯模糊
# ---------------------------------------------------------------------
def select_blur_boxes(img: Image.Image, photo_name: str) -> list:
    """開啟框選視窗，回傳原圖座標的 [(x1, y1, x2, y2), ...]。"""
    import tkinter as tk

    from PIL import ImageTk

    max_w, max_h = SELECTOR_MAX_SIZE
    scale = min(max_w / img.width, max_h / img.height, 1.0)
    disp_size = (round(img.width * scale), round(img.height * scale))
    disp_img = img.resize(disp_size, Image.LANCZOS)

    boxes = []          # 顯示座標的框
    rect_ids = []       # canvas 上的矩形物件
    drag = {"start": None, "rect": None}
    cancelled = {"value": False}

    root = tk.Tk()
    root.title(f"框選要模糊的區域 - {photo_name}")
    root.attributes("-topmost", True)

    hint = ("滑鼠拖曳=框選模糊區域（可框多個）｜ Z=復原上一個 ｜ "
            "Enter=確認 ｜ Esc=這張不模糊")
    tk.Label(root, text=hint, font=("Microsoft JhengHei", 11), pady=6).pack()

    photo = ImageTk.PhotoImage(disp_img)
    canvas = tk.Canvas(root, width=disp_size[0], height=disp_size[1],
                       cursor="crosshair", highlightthickness=0)
    canvas.pack()
    canvas.create_image(0, 0, anchor="nw", image=photo)

    def on_press(event):
        drag["start"] = (event.x, event.y)
        drag["rect"] = canvas.create_rectangle(
            event.x, event.y, event.x, event.y,
            outline="#ff3b30", width=3)

    def on_motion(event):
        if drag["rect"] is not None:
            x0, y0 = drag["start"]
            canvas.coords(drag["rect"], x0, y0, event.x, event.y)

    def on_release(event):
        if drag["rect"] is None:
            return
        x0, y0 = drag["start"]
        x1, y1 = event.x, event.y
        # 太小的框視為誤觸
        if abs(x1 - x0) < 8 or abs(y1 - y0) < 8:
            canvas.delete(drag["rect"])
        else:
            boxes.append((min(x0, x1), min(y0, y1), max(x0, x1), max(y0, y1)))
            rect_ids.append(drag["rect"])
        drag["start"] = None
        drag["rect"] = None

    def on_undo(_event):
        if boxes:
            boxes.pop()
            canvas.delete(rect_ids.pop())

    def on_confirm(_event):
        root.destroy()

    def on_cancel(_event):
        cancelled["value"] = True
        root.destroy()

    canvas.bind("<ButtonPress-1>", on_press)
    canvas.bind("<B1-Motion>", on_motion)
    canvas.bind("<ButtonRelease-1>", on_release)
    root.bind("<z>", on_undo)
    root.bind("<Z>", on_undo)
    root.bind("<Return>", on_confirm)
    root.bind("<Escape>", on_cancel)
    root.protocol("WM_DELETE_WINDOW", lambda: on_confirm(None))

    root.mainloop()

    if cancelled["value"]:
        return []
    # 顯示座標換算回原圖座標
    return [
        (round(x0 / scale), round(y0 / scale),
         round(x1 / scale), round(y1 / scale))
        for (x0, y0, x1, y1) in boxes
    ]


def apply_blur(img: Image.Image, boxes: list) -> Image.Image:
    """對每個框選區域套高斯模糊，邊緣做柔化讓效果自然。"""
    for (x0, y0, x1, y1) in boxes:
        x0 = max(0, x0); y0 = max(0, y0)
        x1 = min(img.width, x1); y1 = min(img.height, y1)
        w, h = x1 - x0, y1 - y0
        if w <= 0 or h <= 0:
            continue

        # 模糊半徑跟框的大小成正比，確保近拍的大臉也認不出來
        radius = max(10, min(w, h) / BLUR_STRENGTH)
        region = img.crop((x0, y0, x1, y1)).filter(
            ImageFilter.GaussianBlur(radius))

        # 圓角＋羽化遮罩，讓模糊區域跟背景過渡不生硬
        feather = max(3, min(w, h) // 12)
        mask = Image.new("L", (w, h), 0)
        draw = ImageDraw.Draw(mask)
        draw.rounded_rectangle(
            (feather, feather, w - feather, h - feather),
            radius=min(w, h) // 6, fill=255)
        mask = mask.filter(ImageFilter.GaussianBlur(feather))

        img.paste(region, (x0, y0), mask)
    return img


def ask_yes_no(question: str) -> bool:
    try:
        answer = input(f"{question} (y/N)：").strip().lower()
    except EOFError:
        return False
    return answer in ("y", "yes", "是")


def ask_caption(photo_name: str) -> str:
    try:
        return input(f"「{photo_name}」的 caption（直接按 Enter 留空）：").strip()
    except EOFError:
        return ""


def add_to_gallery_js(entries: list) -> None:
    """把新照片自動加進 scripts.js 的 GALLERY 陣列，已存在的跳過。"""
    js_path = ROOT / "scripts" / "scripts.js"
    text = js_path.read_text(encoding="utf-8")

    start = text.find("const GALLERY = [")
    end = text.find("];", start) if start != -1 else -1
    if start == -1 or end == -1:
        print("\n[注意] 在 scripts.js 找不到 GALLERY 陣列，請手動貼上：")
        for src, caption in entries:
            print(f"    {{ src: '{src}', caption: '{caption}' }},")
        return

    new_lines = []
    for src, caption in entries:
        if f"'{src}'" in text[start:end]:
            print(f"[已存在] {src} 已經在 GALLERY 裡，caption 未更動")
            continue
        safe_caption = caption.replace("\\", "\\\\").replace("'", "\\'")
        new_lines.append(f"    {{ src: '{src}', caption: '{safe_caption}' }},\n")

    if not new_lines:
        return

    text = text[:end] + "".join(new_lines) + text[end:]
    js_path.write_text(text, encoding="utf-8")
    print(f"\n已自動把 {len(new_lines)} 張照片加進 scripts.js 的 GALLERY，"
          "重新整理網頁就看得到。")


def process_one(src: Path, logo: Image.Image, out_name: str,
                blur_mode: bool) -> Path:
    img = Image.open(src)
    img = ImageOps.exif_transpose(img)  # 依 EXIF 方向轉正，再丟掉 EXIF
    img = img.convert("RGB")

    if img.width > MAX_WIDTH:
        new_height = round(img.height * MAX_WIDTH / img.width)
        img = img.resize((MAX_WIDTH, new_height), Image.LANCZOS)

    if blur_mode:
        boxes = select_blur_boxes(img, src.name)
        if boxes:
            img = apply_blur(img, boxes)
            print(f"       已模糊 {len(boxes)} 個區域")

    # 浮水印縮放到指定比例，貼在右下角
    wm_width = round(img.width * WATERMARK_WIDTH_RATIO)
    wm_height = round(logo.height * wm_width / logo.width)
    wm = logo.resize((wm_width, wm_height), Image.LANCZOS)
    margin = round(img.width * WATERMARK_MARGIN_RATIO)
    position = (img.width - wm_width - margin, img.height - wm_height - margin)
    img.paste(wm, position, wm)

    out_path = OUTPUT_DIR / out_name
    img.save(out_path, "JPEG", quality=JPEG_QUALITY, optimize=True)
    return out_path


def main() -> None:
    if len(sys.argv) > 1:
        sources = [Path(p) for p in sys.argv[1:]]
    else:
        INPUT_DIR.mkdir(parents=True, exist_ok=True)
        sources = sorted(
            p for p in INPUT_DIR.iterdir()
            if p.suffix.lower() in IMAGE_EXTS
        )

    if not sources:
        print(f"找不到要處理的照片。請把照片放進：\n  {INPUT_DIR}")
        return

    if not LOGO_PATH.exists():
        print(f"找不到浮水印 logo：{LOGO_PATH}")
        return

    blur_mode = ask_yes_no("要開啟臉部模糊框選嗎？每張照片會跳出視窗讓你框")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    logo = load_logo()
    today = date.today().strftime("%Y%m%d")
    seq = 1
    entries = []

    for src in sources:
        if not src.exists():
            print(f"[跳過] 找不到檔案：{src}")
            continue

        stem = src.stem
        if is_ascii(stem):
            out_name = f"{stem}.jpg"
        else:
            # 中文檔名 → 自動改名，避免上了 GitHub Pages 之後網址出問題
            while (OUTPUT_DIR / f"photo-{today}-{seq}.jpg").exists():
                seq += 1
            out_name = f"photo-{today}-{seq}.jpg"
            seq += 1

        out_path = process_one(src, logo, out_name, blur_mode)
        size_kb = out_path.stat().st_size / 1024
        renamed = "" if is_ascii(stem) else f"（原檔名：{src.name}）"
        print(f"[完成] {out_name}  {size_kb:.0f} KB {renamed}")
        caption = ask_caption(src.name)
        entries.append((f"img/gallery/{out_name}", caption))

    if entries:
        add_to_gallery_js(entries)


if __name__ == "__main__":
    main()
