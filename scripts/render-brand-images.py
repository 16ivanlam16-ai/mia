"""Regenerate public/og.png and public/apple-touch-icon.png. Requires Pillow."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
CJK = "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc"
LATIN = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
PAPER = (244, 241, 234)
INK = (18, 60, 58)
TEAL = (14, 107, 102)


def og() -> None:
    image = Image.new("RGB", (1200, 630), PAPER)
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, 28, 630), fill=INK)
    draw.rounded_rectangle((88, 150, 196, 258), radius=28, fill=INK)
    mark = ImageFont.truetype(LATIN, 72)
    draw.text((118, 168), "M", font=mark, fill=PAPER)
    word = ImageFont.truetype(LATIN, 132)
    draw.text((230, 145), "Mia", font=word, fill=INK)
    sub = ImageFont.truetype(CJK, 54)
    draw.text((92, 330), "香港信用卡比較", font=sub, fill=INK)
    note = ImageFont.truetype(CJK, 32)
    draw.text((92, 420), "繁體  ·  简体", font=note, fill=TEAL)
    image.save(PUBLIC / "og.png", optimize=True)


def touch() -> None:
    image = Image.new("RGB", (180, 180), INK)
    draw = ImageDraw.Draw(image)
    mark = ImageFont.truetype(LATIN, 110)
    draw.text((48, 28), "M", font=mark, fill=PAPER)
    image.save(PUBLIC / "apple-touch-icon.png", optimize=True)


if __name__ == "__main__":
    og()
    touch()
    print("wrote og.png and apple-touch-icon.png")
