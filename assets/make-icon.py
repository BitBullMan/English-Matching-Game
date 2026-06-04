"""
生成 App Icon + Splash 源图
- icon.png 1024×1024 (App Store/Play Store 主图)
- icon-foreground.png 1024×1024 (Android 自适应图标前景，留 safe area)
- icon-background.png 1024×1024 (Android 自适应图标背景纯色)
- splash.png 2732×2732 (中心居中，留 safe area)
- splash-dark.png 2732×2732

设计：粉色背景 + 大熊猫 emoji + 三消方块装饰
"""
from PIL import Image, ImageDraw, ImageFont
import os

OUT = os.path.dirname(os.path.abspath(__file__))

# 品牌色（与 styles.css 一致）
PINK_BG = (255, 217, 232)        # #ffd9e8 主背景
PINK_DEEP = (255, 168, 198)      # 深粉
YELLOW = (255, 213, 79)          # 金币黄
BLUE = (87, 182, 255)            # 工具蓝
GREEN = (124, 219, 130)          # 通关绿
WHITE = (255, 255, 255)
DARK = (51, 33, 51)


def find_emoji_font(size):
    """找到能渲染 emoji 的字体"""
    candidates = [
        "/System/Library/Fonts/Apple Color Emoji.ttc",
        "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf",
        "/usr/share/fonts/truetype/noto-color-emoji/NotoColorEmoji.ttf",
    ]
    for p in candidates:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return None


def make_icon(size=1024, with_safe_padding=False):
    """主图标：圆角矩形粉底 + 熊猫 + 装饰方块"""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # 圆角背景
    radius = int(size * 0.22)  # iOS-style superellipse 近似
    d.rounded_rectangle((0, 0, size, size), radius=radius, fill=PINK_BG)

    # 装饰方块（四角）
    box_s = int(size * 0.13)
    margin = int(size * 0.08)
    pad_corner = 0 if not with_safe_padding else int(size * 0.10)
    corners = [
        (margin + pad_corner, margin + pad_corner, YELLOW, "A"),
        (size - margin - box_s - pad_corner, margin + pad_corner, GREEN, "B"),
        (margin + pad_corner, size - margin - box_s - pad_corner, BLUE, "C"),
        (size - margin - box_s - pad_corner, size - margin - box_s - pad_corner, PINK_DEEP, "★"),
    ]
    for x, y, color, _ in corners:
        d.rounded_rectangle((x, y, x + box_s, y + box_s), radius=int(box_s * 0.22), fill=color)
        # 高光
        d.rounded_rectangle((x + 8, y + 8, x + box_s - 8, y + int(box_s * 0.45)),
                            radius=int(box_s * 0.18), fill=(255, 255, 255, 90))

    # 熊猫 emoji 居中
    panda_size = int(size * (0.50 if with_safe_padding else 0.62))
    font = find_emoji_font(panda_size)
    if font:
        text = "🐼"
        bbox = d.textbbox((0, 0), text, font=font, embedded_color=True)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        cx = (size - w) // 2 - bbox[0]
        cy = (size - h) // 2 - bbox[1] + int(size * 0.02)
        d.text((cx, cy), text, font=font, embedded_color=True)
    else:
        # 回退：白色圆 + 字
        r = panda_size // 2
        cx, cy = size // 2, size // 2
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=WHITE)
        try:
            f2 = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", int(size * 0.18))
        except Exception:
            f2 = ImageFont.load_default()
        d.text((cx, cy), "EN", font=f2, fill=DARK, anchor="mm")

    return img


def make_splash(size=2732, dark=False):
    """启动屏：纯色 + 中心 logo"""
    bg = (43, 27, 43) if dark else PINK_BG
    img = Image.new("RGB", (size, size), bg)
    # 中心 logo (整图的 35%)
    logo_size = int(size * 0.35)
    logo = make_icon(logo_size, with_safe_padding=False).convert("RGBA")
    pos = ((size - logo_size) // 2, (size - logo_size) // 2)
    img.paste(logo, pos, logo)
    return img


# 1) 主图标
icon = make_icon(1024)
icon.save(os.path.join(OUT, "icon.png"), "PNG")
print("✓ icon.png (1024×1024)")

# 2) Android 自适应：前景 (留 safe area 给系统 mask)
fg = make_icon(1024, with_safe_padding=True)
fg.save(os.path.join(OUT, "icon-foreground.png"), "PNG")
print("✓ icon-foreground.png")

# 3) Android 自适应：背景纯色
bg = Image.new("RGBA", (1024, 1024), PINK_BG + (255,))
bg.save(os.path.join(OUT, "icon-background.png"), "PNG")
print("✓ icon-background.png")

# 4) Splash 浅色 + 深色
make_splash(2732, dark=False).save(os.path.join(OUT, "splash.png"), "PNG")
print("✓ splash.png (2732×2732)")
make_splash(2732, dark=True).save(os.path.join(OUT, "splash-dark.png"), "PNG")
print("✓ splash-dark.png (2732×2732)")

print("\n全部完成，运行 `npx @capacitor/assets generate` 来分发到 iOS/Android")
