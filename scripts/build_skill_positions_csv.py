#!/usr/bin/env python3
"""
Build a CSV of all skill-position players (QB, RB, WR, TE, K) from your roster files.

Features
- Recursively scans one or more input folders (supports both "conference rosters" and the legacy "confrence rosters")
- Reads Markdown tables and PDFs (prefers `pdftotext`, falls back to pdfminer.six when available)
- Heuristic parsing for common roster formats
- Normalizes positions (e.g., PK -> K)
- Infers conference/team from folder/file names
- Writes a single CSV with columns: conference, team, name, jersey, pos, height, weight, class, source_file

Usage
------
# Basic (run from your repo root)
python3 scripts/build_skill_positions_csv.py "conference rosters" "confrence rosters" -o exports/skill_positions_2025.csv

# Filter to specific conferences if desired
python3 scripts/build_skill_positions_csv.py "conference rosters" -o exports/acc_only.csv --conferences ACC

# Dry run (no write, preview first 25 rows)
python3 scripts/build_skill_positions_csv.py "conference rosters" --dry-run

Dependencies
------------
- Poppler's `pdftotext` (recommended): 
  - macOS:  brew install poppler
  - Ubuntu:  sudo apt-get install poppler-utils
- Optional fallback: pdfminer.six (pip install pdfminer.six)

Notes
-----
This script uses best-effort regexes to extract roster rows. If your PDF layout is image-only, please OCR it first (e.g., `ocrmypdf input.pdf output.pdf`), or extend the script to call Tesseract.
"""
import argparse
import csv
import os
import re
import subprocess
import sys
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterable, List, Dict, Optional, Tuple

# -----------------------------
# Configuration
# -----------------------------
SKILL_POS = {"QB", "RB", "WR", "TE", "K"}
POS_NORMALIZE = {
    "PK": "K", "K/P": "K", "P/K": "K", "KO": "K", "K-P": "K", "PK/K": "K",
    "QB/WR": "QB", "WR/QB": "WR", "RB/WR": "RB", "WR/RB": "WR", "TE/FB": "TE",
}
CLASS_TOKENS = r"(?:Fr|RFr|So|RSo|Jr|RJr|Sr|RSr|Gr|GS|Gr\.)"
HEIGHT_PAT = r"(?:\d{1,2}(?:-| |'|′)\d{1,2}(?:\"|″)?)"

PDF_EXT = {".pdf"}
MD_EXT = {".md", ".markdown", ".mdown"}

CONFERENCE_HINTS = {
    "SEC": "SEC",
    "SEC_College_Football": "SEC",
    "ACC": "ACC",
    "Big_12_2025": "Big 12",
    "Big_12": "Big 12",
    "Big12": "Big 12",
    "Pac-12": "Pac-12",
    "Big Ten": "Big Ten",
    "Big_Ten": "Big Ten",
    "big ten rosters": "Big Ten",
}

# -----------------------------
# Data structures
# -----------------------------
@dataclass
class PlayerRow:
    conference: str
    team: str
    name: str
    jersey: Optional[str]
    pos: str
    height: Optional[str]
    weight: Optional[str]
    player_class: Optional[str]
    source_file: str

    def as_csv_row(self) -> Dict[str, str]:
        return {
            "conference": self.conference,
            "team": self.team,
            "name": self.name,
            "jersey": self.jersey or "",
            "pos": self.pos,
            "height": self.height or "",
            "weight": self.weight or "",
            "class": self.player_class or "",
            "source_file": self.source_file,
        }

# -----------------------------
# Utilities
# -----------------------------
def infer_conference_from_path(path: Path) -> str:
    # Look up the folder names from leaf up
    for part in path.parts:
        if part in CONFERENCE_HINTS:
            return CONFERENCE_HINTS[part]
    # Try exact match on common tokens
    lower = " ".join(path.parts).lower()
    if "sec" in lower:
        return "SEC"
    if "acc" in lower:
        return "ACC"
    if "big_12" in lower or "big 12" in lower:
        return "Big 12"
    if "big ten" in lower or "big_ten" in lower:
        return "Big Ten"
    if "pac-12" in lower or "pac12" in lower:
        return "Pac-12"
    return ""

def infer_team_from_filename(fname: str) -> str:
    base = Path(fname).stem
    # Remove years like 2023/2024/2025
    base = re.sub(r"(19|20)\d{2}", "", base)
    base = base.replace("_", " ").replace("-", " ").strip()
    # Remove common suffixes
    base = re.sub(r"\bRosters?\b", "", base, flags=re.IGNORECASE)
    # Split CamelCase into spaced words (BostonCollege -> Boston College)
    base = re.sub(r"(?<!^)(?=[A-Z])", " ", base)
    return re.sub(r"\s{2,}", " ", base).strip()

def ensure_pos_canonical(raw: str) -> Optional[str]:
    if not raw:
        return None
    p = raw.strip().upper().replace(".", "")
    p = POS_NORMALIZE.get(p, p)
    # Handle splits like "WR/DB"
    if "/" in p:
        left = p.split("/")[0].strip()
        p = POS_NORMALIZE.get(left, left)
    return p if p in SKILL_POS else None

def try_pdftotext(pdf_path: Path) -> Optional[str]:
    try:
        # -layout preserves table-ish alignment; -nopgbrk avoids form feeds
        out = subprocess.check_output(
            ["pdftotext", "-layout", "-nopgbrk", str(pdf_path), "-"],
            stderr=subprocess.STDOUT,
            timeout=30
        )
        return out.decode("utf-8", errors="ignore")
    except Exception as e:
        return None

def try_pdfminer(pdf_path: Path) -> Optional[str]:
    try:
        from pdfminer.high_level import extract_text  # type: ignore
    except Exception:
        return None
    try:
        return extract_text(str(pdf_path))
    except Exception:
        return None

def read_pdf_text(pdf_path: Path) -> str:
    txt = try_pdftotext(pdf_path)
    if txt is None:
        txt = try_pdfminer(pdf_path)
    return txt or ""

def read_markdown_text(md_path: Path) -> str:
    try:
        return md_path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return ""

# -----------------------------
# Parsing logic
# -----------------------------

# Common roster layouts might be like:
# 1) No Name           Pos Ht   Wt  Class   Hometown/HS
#    2 John Smith      QB  6-2  205 So      Austin, TX
# 2) No Pos Name       Ht  Wt   Class ...
# 3) Markdown tables with header | No | Name | Pos | Ht | Wt | Class |

RE_ROW_PATTERNS: List[re.Pattern] = [
    # 0) Name Jersey Pos Ht Wt Class
    re.compile(
        rf"^\s*(?P<name>[A-Za-zÀ-ÿ’'`.\- ]+?)\s+"
        rf"(?P<num>\d{{1,3}})\s+"
        rf"(?P<pos>QB|RB|WR|TE|K|PK)\b[^\S\r\n]*"
        rf"(?P<height>{HEIGHT_PAT})?\s*"
        rf"(?P<weight>\d{{2,3}})?\s*"
        rf"(?P<class>{CLASS_TOKENS})?"
        r".*$"
    ),
    # 1) No Name ... Pos Ht Wt Class
    re.compile(
        rf"^\s*(?P<num>\d{{1,3}})\s+(?P<name>[A-Za-zÀ-ÿ’'`.\- ]+?)\s+"
        rf"(?P<pos>QB|RB|WR|TE|K|PK)\b[^\S\r\n]*"
        rf"(?P<height>{HEIGHT_PAT})?\s*"
        rf"(?P<weight>\d{{2,3}})?\s*"
        rf"(?P<class>{CLASS_TOKENS})?"
        r".*$"
    ),
    # 2) No Pos Name Ht Wt Class
    re.compile(
        rf"^\s*(?P<num>\d{{1,3}})\s+(?P<pos>QB|RB|WR|TE|K|PK)\s+"
        rf"(?P<name>[A-Za-zÀ-ÿ’'`.\- ]+?)[^\S\r\n]*"
        rf"(?P<height>{HEIGHT_PAT})?\s*"
        rf"(?P<weight>\d{{2,3}})?\s*"
        rf"(?P<class>{CLASS_TOKENS})?"
        r".*$"
    ),
    # 3) Name Pos Ht Wt Class (no number)
    re.compile(
        rf"^\s*(?P<name>[A-Za-zÀ-ÿ’'`.\- ]+?)\s+"
        rf"(?P<pos>QB|RB|WR|TE|K|PK)\b[^\S\r\n]*"
        rf"(?P<height>{HEIGHT_PAT})?\s*"
        rf"(?P<weight>\d{{2,3}})?\s*"
        rf"(?P<class>{CLASS_TOKENS})?"
        r".*$"
    ),
]

def parse_plaintext_lines(
    lines: Iterable[str], team: str, conference: str, source_file: str
) -> List[PlayerRow]:
    rows: List[PlayerRow] = []
    NOISE_SUBSTRINGS = ("VIP", "Annual", "Stein said", "Subscribe", "Ticket", "Coach", "Schedule", "Roster", "Roster Breakdown")
    for raw in lines:
        line = raw.rstrip()
        if not line:
            continue
        # Quick filter to reduce regex overhead
        if not re.search(r"\b(QB|RB|WR|TE|K|PK)\b", line):
            continue
        # Skip obvious noise
        if any(s in line for s in NOISE_SUBSTRINGS):
            continue
        for pat in RE_ROW_PATTERNS:
            m = pat.match(line)
            if not m:
                continue
            d = m.groupdict()
            num = (d.get("num") or "").strip()
            # Basic sanity checks on name
            name_raw = d.get("name", "").strip()
            name_parts = [p for p in re.split(r"\s+", name_raw) if p]
            if len(name_parts) < 2:
                continue
            if not re.match(r"^[A-Za-zÀ-ÿ’'`.\- ]+$", name_raw):
                continue
            pos = ensure_pos_canonical(d.get("pos", ""))
            if not pos:
                continue
            # If jersey is missing, require at least one of height/weight/class to reduce false positives
            height_token = (d.get("height") or "").strip()
            weight_token = (d.get("weight") or "").strip()
            class_token = (d.get("class") or "").strip()
            if not num.isdigit() and not (height_token or weight_token or class_token):
                continue
            name = " ".join(name_parts)
            rows.append(
                PlayerRow(
                    conference=conference,
                    team=team,
                    name=name,
                    jersey=num if num.isdigit() else "",
                    pos=pos,
                    height=(d.get("height") or ""),
                    weight=(d.get("weight") or ""),
                    player_class=(d.get("class") or ""),
                    source_file=source_file,
                )
            )
    return rows

def parse_markdown_table(md_text: str, team: str, conference: str, source_file: str) -> List[PlayerRow]:
    rows: List[PlayerRow] = []
    lines = [ln.strip() for ln in md_text.splitlines() if ln.strip()]
    # Find header row
    header_idx = None
    for i, ln in enumerate(lines):
        if ln.startswith("|") and ("pos" in ln.lower()) and ("name" in ln.lower()):
            header_idx = i
            break
    if header_idx is None:
        # Fallback to plaintext parsing
        return parse_plaintext_lines(lines, team, conference, source_file)

    header_cols = [c.strip().lower() for c in lines[header_idx].strip("|").split("|")]
    col_map = {name: idx for idx, name in enumerate(header_cols)}

    def get_col(row_cols: List[str], key: str) -> Optional[str]:
        # Try exact, then fuzzy (e.g., "wt" vs "weight")
        candidates = [key]
        if key == "pos":
            candidates += ["position"]
        if key == "jersey":
            candidates += ["no", "#", "num", "number"]
        if key == "class":
            candidates += ["yr", "year", "elig"]
        if key == "height":
            candidates += ["ht"]
        if key == "weight":
            candidates += ["wt"]
        for cand in candidates:
            idx = col_map.get(cand)
            if idx is not None and idx < len(row_cols):
                return row_cols[idx].strip()
        return None

    for ln in lines[header_idx+1:]:
        if not ln.startswith("|"):
            continue
        cols = [c.strip() for c in ln.strip("|").split("|")]
        name = get_col(cols, "name") or ""
        pos = ensure_pos_canonical(get_col(cols, "pos") or "")
        if not name or not pos:
            continue
        rows.append(
            PlayerRow(
                conference=conference,
                team=team,
                name=name,
                jersey=(get_col(cols, "jersey") or ""),
                pos=pos,
                height=(get_col(cols, "height") or ""),
                weight=(get_col(cols, "weight") or ""),
                player_class=(get_col(cols, "class") or ""),
                source_file=source_file,
            )
        )
    return rows

# -----------------------------
# Main walk & extract
# -----------------------------

def iter_player_rows(roots: List[Path], conferences_filter: Optional[set]) -> List[PlayerRow]:
    results: List[PlayerRow] = []
    for root in roots:
        for path in root.rglob("*"):
            if not path.is_file():
                continue

            ext = path.suffix.lower()
            conf = infer_conference_from_path(path.parent)
            if conferences_filter and conf not in conferences_filter:
                continue

            team = infer_team_from_filename(path.name)
            try:
                if ext in PDF_EXT:
                    text = read_pdf_text(path)
                    if not text.strip():
                        continue
                    rows = parse_plaintext_lines(text.splitlines(), team, conf, str(path))
                elif ext in MD_EXT:
                    text = read_markdown_text(path)
                    if not text.strip():
                        continue
                    rows = parse_markdown_table(text, team, conf, str(path))
                else:
                    continue
                results.extend(rows)
            except Exception as e:
                print(f"[WARN] Failed to parse {path}: {e}", file=sys.stderr)
    return results


def dedupe_rows(rows: List[PlayerRow]) -> List[PlayerRow]:
    seen = set()
    out: List[PlayerRow] = []
    for r in rows:
        key = (r.conference, r.team, r.name.lower(), r.pos)
        if key in seen:
            continue
        seen.add(key)
        out.append(r)
    return out


def write_csv(rows: List[PlayerRow], out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["conference", "team", "name", "jersey", "pos", "height", "weight", "class", "source_file"],
        )
        writer.writeheader()
        for r in rows:
            writer.writerow(r.as_csv_row())


def main():
    ap = argparse.ArgumentParser(description="Build a CSV of skill-position players from roster files.")
    ap.add_argument("inputs", nargs="+", help="One or more input folders (e.g., 'conference rosters' 'confrence rosters')")
    ap.add_argument("-o", "--output", default="exports/skill_positions_2025.csv", help="Output CSV path")
    ap.add_argument("--conferences", nargs="*", help="Optional filter: ACC SEC 'Big 12' 'Big Ten' etc.")
    ap.add_argument("--dry-run", action="store_true", help="Do not write CSV; preview first 25 rows")
    args = ap.parse_args()

    roots = [Path(p) for p in args.inputs if Path(p).exists()]
    if not roots:
        print("No valid input folders found. Example:\n  python3 scripts/build_skill_positions_csv.py 'conference rosters' 'confrence rosters'", file=sys.stderr)
        sys.exit(2)

    conf_filter = set(args.conferences) if args.conferences else None
    all_rows = iter_player_rows(roots, conf_filter)
    all_rows = dedupe_rows(all_rows)
    all_rows.sort(key=lambda r: (r.conference, r.team, r.pos, r.name))

    if args.dry_run:
        print(f"Total rows: {len(all_rows)}")
        for r in all_rows[:25]:
            print(r.as_csv_row())
        return

    write_csv(all_rows, Path(args.output))
    print(f"Wrote {len(all_rows)} rows to {args.output}")


if __name__ == "__main__":
    main()
