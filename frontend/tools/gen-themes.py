"""Generate the per-theme CSS custom properties for the storefront.

Each theme is described by one accent colour (the primary button), one deal
colour (discount badges) and a neutral hue. Every scale is derived from those,
so adding a theme is one row here rather than forty hand-picked hexes.
"""
import colorsys
import pathlib

OUT_PATH = pathlib.Path(__file__).resolve().parent.parent / "src" / "styles" / "_themes.scss"

# key, label, accent-700 (exact, as approved), deal, neutral hue, neutral sat
THEMES = [
    ("emerald",        "Emerald",          "#0C6B44", "#C0392B", 150, 0.05),
    ("emerald-orange", "Emerald / Orange", "#0C6B44", "#C2410C", 150, 0.05),
    ("bronze",         "Bronze",           "#9A6B18", "#B3202B",  40, 0.09),
    ("bronze-magenta", "Bronze / Magenta", "#9A6B18", "#BE185D",  40, 0.09),
    ("crimson",        "Crimson",          "#B3202B", "#1A1A1A",  12, 0.05),
    ("forest",         "Forest",           "#1F3D24", "#B4541F",  90, 0.11),
    ("plum",           "Plum / Ink",       "#6D2A5F", "#16181C", 300, 0.05),
    ("rust",           "Rust / Ink",       "#B4541F", "#16181C",  28, 0.09),
    ("indigo",         "Indigo",           "#3F3BAF", "#C2410C", 250, 0.07),
    ("ink",            "Ink",              "#1C222B", "#C2410C", 215, 0.05),
    ("teal",           "Teal",             "#0E6B70", "#C2410C", 190, 0.06),
]

DEFAULT = "emerald"

# Lightness of the neutral ramp, matched to the outgoing charcoal scale so
# existing layouts keep their visual weight.
NEUTRAL_L = {
    50: 0.96, 100: 0.90, 200: 0.80, 300: 0.63, 400: 0.46,
    500: 0.33, 600: 0.25, 700: 0.18, 800: 0.12, 900: 0.09, 950: 0.06,
}

# The tinted surface ramp (the old "beige"): the accent hue at low saturation.
SURFACE_L = {
    50: 0.975, 100: 0.945, 200: 0.885, 300: 0.80, 400: 0.67,
    500: 0.56, 600: 0.475, 700: 0.38, 800: 0.31, 900: 0.26,
}


def hex_to_hls(h):
    h = h.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    return colorsys.rgb_to_hls(r, g, b)


def hls_to_hex(h, l, s):
    r, g, b = colorsys.hls_to_rgb(h, max(0.0, min(1.0, l)), max(0.0, min(1.0, s)))
    return "#{:02x}{:02x}{:02x}".format(round(r * 255), round(g * 255), round(b * 255))


def relative_luminance(hex_colour):
    h = hex_colour.lstrip("#")
    out = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    r, g, b = out
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    la, lb = relative_luminance(a), relative_luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


MIN_CONTRAST = 4.5


def darken_until_accessible(base_hex):
    """
    Chips put accent-700 text on an accent-50 tint, and a mid-light accent fails
    that pairing. Walk the accent darker in 1% steps until both it and the chip
    clear 4.5:1, so no theme can ship inaccessible. Returns the usable colour and
    how far it moved from the approved one.
    """
    h, l, s = hex_to_hls(base_hex)
    tint = hls_to_hex(h, 0.960, s * 0.40)
    candidate = base_hex.lower()
    steps = 0
    while steps < 40:
        if contrast(candidate, "#ffffff") >= MIN_CONTRAST and contrast(tint, candidate) >= MIN_CONTRAST:
            break
        steps += 1
        candidate = hls_to_hex(h, l - steps * 0.01, s)
    return candidate, steps


def accent_ramp(base_hex):
    """Anchor the approved colour at 700 and derive the rest around it."""
    base_hex, _ = darken_until_accessible(base_hex)
    h, l, s = hex_to_hls(base_hex)
    steps = {}
    # Light end: fixed lightness, saturation pulled back so tints stay calm.
    for step, ll, sat_mul in ((50, 0.960, 0.40), (100, 0.915, 0.48), (200, 0.840, 0.58), (300, 0.720, 0.72)):
        steps[step] = hls_to_hex(h, ll, s * sat_mul)
    # Mid: scale up from the base, capped so a light accent cannot wash out.
    steps[400] = hls_to_hex(h, min(0.585, l * 2.45), s * 0.88)
    steps[500] = hls_to_hex(h, min(0.475, l * 1.95), s * 0.95)
    steps[600] = hls_to_hex(h, min(0.375, l * 1.45), s)
    steps[700] = base_hex.lower()
    # Dark end: relative to the base, so a very dark accent still gets darker.
    steps[800] = hls_to_hex(h, l * 0.78, s)
    steps[900] = hls_to_hex(h, l * 0.60, s)
    steps[950] = hls_to_hex(h, l * 0.40, s)
    return steps


def neutral_ramp(hue_deg, sat):
    h = hue_deg / 360
    return {step: hls_to_hex(h, ll, sat) for step, ll in NEUTRAL_L.items()}


def surface_ramp(base_hex):
    h, _, s = hex_to_hls(base_hex)
    sat = min(s * 0.42, 0.30)
    return {step: hls_to_hex(h, ll, sat) for step, ll in SURFACE_L.items()}


def block(selector, key, label, accent, deal, n_hue, n_sat):
    a = accent_ramp(accent)
    n = neutral_ramp(n_hue, n_sat)
    sf = surface_ramp(accent)
    lines = [f"{selector} {{", f"  /* {label} */"]
    for step in sorted(a):
        lines.append(f"  --t-accent-{step}: {a[step]};")
    for step in sorted(n):
        lines.append(f"  --t-neutral-{step}: {n[step]};")
    for step in sorted(sf):
        lines.append(f"  --t-surface-{step}: {sf[step]};")
    lines.append(f"  --t-cream: {sf[50]};")
    lines.append(f"  --t-ivory: {hls_to_hex(*hex_to_hls(accent)[:1], 0.995, 0.0)};")
    lines.append(f"  --t-deal: {deal.lower()};")
    lines.append(f"  --t-deal-ink: {'#ffffff'};")
    lines.append("}")
    return "\n".join(lines)


def main():
    out = [
        "/*",
        " * Theme tokens. GENERATED FILE - do not edit by hand.",
        " * Add or retune a theme in frontend/tools/gen-themes.py, then re-run:",
        " *   python frontend/tools/gen-themes.py",
        " *",
        " * Every theme redefines the same variables, so switching one attribute on",
        " * <html> restyles the whole storefront without touching a component.",
        " */",
        "",
    ]
    by_key = {t[0]: t for t in THEMES}
    d = by_key[DEFAULT]
    out.append(block(":root", *d))
    out.append("")
    for t in THEMES:
        out.append(block(f'[data-theme="{t[0]}"]', *t))
        out.append("")

    with open(OUT_PATH, "w", encoding="utf-8") as fh:
        fh.write("\n".join(out))

    print(f"{len(THEMES)} themes written. Contrast of accent-700 / accent-800 against white:")
    for key, label, accent, _deal, _h, _s in THEMES:
        fixed, steps = darken_until_accessible(accent)
        if steps:
            print(f"  note: {label} accent darkened {accent} -> {fixed} for the chip pairing")
    worst = 10.0
    for key, label, accent, deal, _, _ in THEMES:
        a = accent_ramp(accent)
        c700 = contrast(a[700], "#ffffff")
        c800 = contrast(a[800], "#ffffff")
        cdeal = contrast(deal, "#ffffff")
        c_chip = contrast(a[50], a[700])
        worst = min(worst, c700, c800, cdeal, c_chip)
        flag = "" if min(c700, c800, cdeal, c_chip) >= 4.5 else "   <-- FAILS 4.5:1"
        print(f"  {label:18} 700 {c700:5.2f}  800 {c800:5.2f}  deal {cdeal:5.2f}  chip {c_chip:5.2f}{flag}")
    print(f"\nworst pairing overall: {worst:.2f}:1")


if __name__ == "__main__":
    main()
