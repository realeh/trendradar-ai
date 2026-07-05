"""
Screen-watching autoplayer for a Flappy Bird style test build.

Use only on your own local game/test build. Keep any public leaderboard or
online scoring disabled while testing automated play.

Setup:
  python -m pip install pyautogui pillow
  python scripts/flappy_autoplayer.py

Move the mouse to the top-left corner of the screen to stop immediately.
Press Ctrl+C in the terminal to stop normally.
"""

from __future__ import annotations

import time
import sys
from dataclasses import dataclass
from pathlib import Path

import pyautogui


# Based on Screenshot (3).png at 2560x1080.
# Format: left, top, width, height
GAME_REGION = (796, 18, 458, 813)

# Where the bot clicks to flap. Any point inside the play area should work.
CLICK_POINT = (
    GAME_REGION[0] + GAME_REGION[2] // 2,
    GAME_REGION[1] + GAME_REGION[3] // 2,
)

# Bot tuning.
FRAME_DELAY = 0.025
CLICK_COOLDOWN = 0.18
TARGET_MARGIN = 20
PANIC_MARGIN = 70
DEBUG = True
DEBUG_IMAGE_PATH = Path("scripts/flappy_debug.png")
REQUIRE_PIPE = True


@dataclass
class Point:
    x: int
    y: int


def is_bird_pixel(r: int, g: int, b: int) -> bool:
    """Character pixels.

    The screenshot is dimmed by the app overlay, so the fish often appears as
    dark green/brown outline pixels instead of bright orange pixels.
    """
    bright_body = r > 145 and 40 < g < 200 and b < 140 and (r - b) > 45
    dim_body = r < 115 and g < 120 and b < 95 and (max(r, g, b) - min(r, g, b)) > 12
    return bright_body or dim_body


def is_pipe_pixel(r: int, g: int, b: int) -> bool:
    """Pale green/stone pipe pixels from the screenshot."""
    return (
        125 < r < 235
        and 135 < g < 245
        and 105 < b < 230
        and abs(r - b) < 55
        and g >= r - 10
    )


def find_bird_y(img) -> int | None:
    width, height = img.size

    # The character stays on the left side of the play field in Flappy games.
    # Keeping this narrow avoids the UI, pipes, and scenery being mistaken for it.
    x_min = int(width * 0.28)
    x_max = int(width * 0.50)
    y_min = int(height * 0.28)
    y_max = int(height * 0.86)

    row_hits: dict[int, int] = {}
    for y in range(y_min, y_max, 3):
        for x in range(x_min, x_max, 3):
            r, g, b = img.getpixel((x, y))[:3]
            if is_bird_pixel(r, g, b) and not is_pipe_pixel(r, g, b):
                row_hits[y] = row_hits.get(y, 0) + 1

    if not row_hits:
        return None

    dense_rows = [y for y, hits in row_hits.items() if hits >= 2]
    if len(dense_rows) < 5:
        return None

    return sum(dense_rows) // len(dense_rows)


def find_gap_center_y(img) -> int | None:
    width, height = img.size

    # Look ahead on the right side where the next pipe pair approaches.
    x_start = int(width * 0.58)
    x_end = int(width * 0.96)
    y_min = int(height * 0.08)
    y_max = int(height * 0.92)

    best_x = None
    best_pipe_hits = 0

    for x in range(x_start, x_end, 5):
        hits = 0
        for y in range(y_min, y_max, 5):
            r, g, b = img.getpixel((x, y))[:3]
            if is_pipe_pixel(r, g, b):
                hits += 1

        if hits > best_pipe_hits:
            best_pipe_hits = hits
            best_x = x

    if best_x is None or best_pipe_hits < 10:
        return None

    pipe_rows: list[int] = []
    for y in range(y_min, y_max, 3):
        found_pipe_nearby = False
        for x in range(max(0, best_x - 8), min(width, best_x + 9), 4):
            r, g, b = img.getpixel((x, y))[:3]
            if is_pipe_pixel(r, g, b):
                found_pipe_nearby = True
                break
        if found_pipe_nearby:
            pipe_rows.append(y)

    if not pipe_rows:
        return None

    pipe_set = set(pipe_rows)
    gaps: list[tuple[int, int]] = []
    gap_start = None

    for y in range(y_min, y_max, 3):
        is_open = y not in pipe_set
        if is_open and gap_start is None:
            gap_start = y
        elif not is_open and gap_start is not None:
            if y - gap_start > 55:
                gaps.append((gap_start, y))
            gap_start = None

    if gap_start is not None and y_max - gap_start > 55:
        gaps.append((gap_start, y_max))

    if not gaps:
        return None

    # The playable gap is usually the largest open section between top/bottom pipes.
    gap_start, gap_end = max(gaps, key=lambda gap: gap[1] - gap[0])
    return (gap_start + gap_end) // 2


def should_flap(
    bird_y: int | None,
    gap_center_y: int | None,
    last_bird_y: int | None,
    now: float,
    last_click: float,
) -> bool:
    if bird_y is None:
        return False

    if gap_center_y is None:
        if REQUIRE_PIPE:
            return False
        gap_center_y = GAME_REGION[3] // 2

    if now - last_click < CLICK_COOLDOWN:
        return False

    distance_below_target = bird_y - gap_center_y
    is_falling = last_bird_y is None or bird_y >= last_bird_y

    return (
        distance_below_target > PANIC_MARGIN
        or (distance_below_target > TARGET_MARGIN and is_falling)
    )


def main() -> None:
    pyautogui.FAILSAFE = True

    print("Starting in 3 seconds. Move the mouse to the top-left corner to stop.")
    time.sleep(3)

    last_click = 0.0
    last_debug = 0.0
    last_bird_y = None

    while True:
        img = pyautogui.screenshot(region=GAME_REGION)

        bird_y = find_bird_y(img)
        gap_center_y = find_gap_center_y(img)

        now = time.time()
        if DEBUG and now - last_debug >= 0.5:
            state = "waiting"
            if bird_y is None:
                state = "no character"
            elif gap_center_y is None:
                state = "no pipe"
            elif should_flap(bird_y, gap_center_y, last_bird_y, now, last_click):
                state = "clicking"
            print(f"{state}: bird_y={bird_y} gap_center_y={gap_center_y}")
            last_debug = now

        if should_flap(bird_y, gap_center_y, last_bird_y, now, last_click):
            pyautogui.click(*CLICK_POINT)
            last_click = now

        if bird_y is not None:
            last_bird_y = bird_y

        time.sleep(FRAME_DELAY)


if __name__ == "__main__":
    if len(sys.argv) == 3 and sys.argv[1] == "--test-image":
        from PIL import Image, ImageDraw

        test_img = Image.open(sys.argv[2]).convert("RGB")
        cropped = test_img.crop(
            (
                GAME_REGION[0],
                GAME_REGION[1],
                GAME_REGION[0] + GAME_REGION[2],
                GAME_REGION[1] + GAME_REGION[3],
            )
        )
        bird_y = find_bird_y(cropped)
        gap_center_y = find_gap_center_y(cropped)
        print(f"bird_y={bird_y}")
        print(f"gap_center_y={gap_center_y}")

        marked = cropped.copy()
        draw = ImageDraw.Draw(marked)
        if bird_y is not None:
            draw.line((0, bird_y, marked.width, bird_y), fill=(255, 120, 0), width=4)
        if gap_center_y is not None:
            draw.line((0, gap_center_y, marked.width, gap_center_y), fill=(0, 255, 80), width=4)
        marked.save(DEBUG_IMAGE_PATH)
        print(f"debug_image={DEBUG_IMAGE_PATH}")
    else:
        main()
