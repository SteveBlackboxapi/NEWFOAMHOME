#!/usr/bin/env python3
"""Create reviewed 720px website previews; never modify the downloadable masters.

Run with Python 3 and FFmpeg 7.1 (libvpx-vp9, libx264, libvmaf):
  python3 scripts/encode-talent-video-previews.py --ffmpeg /path/to/ffmpeg
Use --verify-only to repeat decoding/quality checks without re-encoding.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
import re
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parent.parent
CLIPS = [
    ("aria-makeup", "talent/aria-quen-v2/aria-quen-v2-makeup"),
    ("lena-grwm", "talent/lena-croft-v2/lena-croft-grwm"),
    ("nia-skincare", "talent/nia-brooks/nia-brooks-skincare"),
    ("samantha-curl-refresh", "talent/samantha-pikka-v2/samantha-pikka-v2-curl-refresh"),
]
DEST = ROOT / "public/assets/video-previews-v2"


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ffmpeg", default="ffmpeg")
    parser.add_argument("--verify-only", action="store_true")
    args = parser.parse_args()
    DEST.mkdir(exist_ok=True)

    def run(options):
        result = subprocess.run([args.ffmpeg, "-hide_banner", "-nostdin", *options],
                                text=True, capture_output=True)
        if result.returncode:
            raise RuntimeError(result.stderr)
        return result

    def inspect(path):
        result = run(["-v", "info", "-i", str(path), "-map", "0:v:0", "-progress",
                      "pipe:1", "-nostats", "-f", "null", "-"])
        video = next(line for line in result.stderr.splitlines() if "Video:" in line)
        size = re.search(r"\b(\d{2,5})x(\d{2,5})\b", video)
        fps = re.search(r"([\d.]+) fps", video)
        return {"bytes": path.stat().st_size, "sha256": digest(path),
                "width": int(size[1]), "height": int(size[2]), "fps": float(fps[1]),
                "frames": int(re.findall(r"^frame=(\d+)", result.stdout, re.M)[-1]),
                "hasAudio": "Audio:" in result.stderr}

    def process(clip):
        name, path = clip
        master = ROOT / "public/assets" / f"{path}.mp4"
        before = digest(master)
        original = inspect(master)
        outputs = {}
        for extension in ("webm", "mp4"):
            preview = DEST / f"{name}-720.{extension}"
            if not args.verify_only:
                codec = (["-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "28",
                          "-deadline", "good", "-cpu-used", "2", "-row-mt", "1",
                          "-c:a", "libopus", "-b:a", "128k"]
                         if extension == "webm" else
                         ["-c:v", "libx264", "-crf", "22", "-preset", "slow",
                          "-profile:v", "high", "-movflags", "+faststart",
                          "-c:a", "aac", "-b:a", "128k"])
                run(["-y", "-i", str(master), "-map", "0:v:0", "-map", "0:a?",
                     "-vf", "scale=720:-2:flags=lanczos", "-pix_fmt", "yuv420p",
                     "-fps_mode", "passthrough", "-threads", "4", *codec, str(preview)])
            current = inspect(preview)
            assert current["width"] == 720
            assert current["frames"] == original["frames"]
            assert current["fps"] == original["fps"]
            assert current["hasAudio"] == original["hasAudio"]
            assert current["bytes"] < original["bytes"]
            # Match source timestamps by frame index and compare at delivery size.
            # This measures compression loss; it does not measure the downscale.
            with tempfile.TemporaryDirectory(prefix="foam-video-vmaf-") as tmp:
                quality = Path(tmp) / "vmaf.json"
                filtergraph = (
                    f"[0:v]settb=AVTB,setpts=N/({current['fps']}*TB)[dist];"
                    f"[1:v]scale={current['width']}:{current['height']}:flags=lanczos,"
                    f"settb=AVTB,setpts=N/({current['fps']}*TB)[ref];"
                    f"[dist][ref]libvmaf=n_threads=4:log_fmt=json:log_path={quality}"
                )
                run(["-i", str(preview), "-i", str(master), "-lavfi", filtergraph,
                     "-an", "-f", "null", "-"])
                values = json.loads(quality.read_text())["pooled_metrics"]["vmaf"]
            current.update({"path": str(preview.relative_to(ROOT)),
                            "durationSeconds": current["frames"] / current["fps"],
                            "vmafMeanAtDeliverySize": values["mean"],
                            "vmafMinimumAtDeliverySize": values["min"],
                            "savingVsOriginalPercent": round((1-current["bytes"]/original["bytes"])*100, 2)})
            outputs[extension] = current
            print(f"{name} {extension}: {current['bytes']:,} B; VMAF {values['mean']:.2f}", flush=True)
        assert digest(master) == before, "Original master changed"
        previous = ROOT / "public/assets" / f"{path}.webm"
        return {"name": name, "original": {"path": str(master.relative_to(ROOT)), **original},
                "previousWebmBytes": previous.stat().st_size, "previews": outputs}

    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(process, CLIPS))
    report = {"encoder": run(["-version"]).stdout.splitlines()[0],
              "settings": {"width": 720, "scale": "Lanczos, even output height, no crop",
                           "webm": "VP9 CRF 28, b:v 0, cpu-used 2, row-mt 1",
                           "mp4": "H.264 CRF 22, slow, High profile, faststart",
                           "audio": "Preserved if present; all four current sources are silent",
                           "timing": "Original fps and every frame retained"},
              "qualityMeasurement": "VMAF against original scaled to delivery dimensions; timestamps aligned by frame index. Does not measure downscale loss.",
              "videos": results}
    report_path = ROOT / "docs/talent-video-previews-v2-audit.json"
    report_path.write_text(json.dumps(report, indent=2) + "\n")
    print(f"Wrote {report_path}")


if __name__ == "__main__":
    main()
