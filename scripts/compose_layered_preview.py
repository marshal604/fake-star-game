#!/usr/bin/env python3
import argparse
import json
from pathlib import Path

from PIL import Image


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", required=True)
    parser.add_argument("--map-json", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    base_path = Path(args.base)
    map_path = Path(args.map_json)
    out_path = Path(args.output)

    canvas = Image.open(base_path).convert("RGBA")
    data = json.loads(map_path.read_text(encoding="utf-8"))
    tile_size = int(data["tileSize"])

    for prop in sorted(data.get("props", []), key=lambda item: item.get("z", item["y"] + 1)):
        url = prop["url"]
        rel = url[1:] if url.startswith("/") else url
        prop_path = Path("public") / rel
        image = Image.open(prop_path).convert("RGBA")
        canvas.alpha_composite(image, (int(prop["x"]) * tile_size, int(prop["y"]) * tile_size))

    out_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out_path, optimize=True)


if __name__ == "__main__":
    main()
