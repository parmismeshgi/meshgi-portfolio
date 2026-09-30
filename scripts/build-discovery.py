#!/usr/bin/env python3
"""Build clean discovery metadata and Markdown copies for the portfolio."""

from __future__ import annotations

import html
import json
import re
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin


ROOT = Path(__file__).resolve().parent.parent
SITE = "https://meshgi.com"
TODAY = date.today().isoformat()

PUBLIC_PAGES = [
    "index",
    "product-design",
    "restaurant-product-design",
    "ai-design-practice",
    "kiosk",
    "bar-tabs",
    "backoffice",
    "pos",
    "playground",
    "footsteps",
    "seej",
    "health-exporter",
    "family-tree",
    "fitness",
    "orange-institute",
    "hitchi",
    "rooydad",
    "chaashni",
    "photography",
    "resume",
    "teaching",
]


def route(slug: str) -> str:
    return "/" if slug == "index" else f"/{slug}/"


def absolute_route(slug: str) -> str:
    return SITE + route(slug)


def markdown_route(slug: str) -> str:
    return "/index.md" if slug == "index" else f"/{slug}.md"


class MetadataParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.title = ""
        self.description = ""
        self.in_title = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag == "title":
            self.in_title = True
        if tag == "meta" and values.get("name") == "description":
            self.description = values.get("content") or ""

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self.in_title = False

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title += data


class MarkdownParser(HTMLParser):
    BLOCKS = {"p", "article", "section", "div", "figure", "figcaption", "details", "summary"}
    VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self, base_url: str) -> None:
        super().__init__()
        self.base_url = base_url
        self.parts: list[str] = []
        self.skip_depth = 0
        self.active_links: list[str] = []

    @staticmethod
    def _attrs(attrs: list[tuple[str, str | None]]) -> dict[str, str]:
        return {key: value or "" for key, value in attrs}

    def _line_break(self) -> None:
        if self.parts and not self.parts[-1].endswith("\n\n"):
            self.parts.append("\n\n")

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = self._attrs(attrs)
        classes = set(values.get("class", "").split())
        if self.skip_depth:
            if tag not in self.VOID_TAGS:
                self.skip_depth += 1
            return
        if tag in {"head", "script", "style", "svg", "noscript"} or classes & {"site-header", "site-footer", "skip-link"}:
            self.skip_depth = 1
            return
        if tag == "nav":
            self.skip_depth = 1
            return
        if tag in {f"h{level}" for level in range(1, 7)}:
            self._line_break()
            self.parts.append("#" * int(tag[1]) + " ")
        elif tag == "li":
            self._line_break()
            self.parts.append("- ")
        elif tag == "br":
            self.parts.append("  \n")
        elif tag == "a":
            self.active_links.append(values.get("href", ""))
            self.parts.append("[")
        elif tag == "img":
            alt = values.get("alt", "").strip()
            src = values.get("src", "").strip()
            if alt and src:
                self._line_break()
                self.parts.append(f"![{alt}]({urljoin(self.base_url, src)})")
                self._line_break()
        elif tag in self.BLOCKS:
            self._line_break()

    def handle_endtag(self, tag: str) -> None:
        if self.skip_depth:
            self.skip_depth -= 1
            return
        if tag == "a" and self.active_links:
            href = self.active_links.pop()
            if href:
                href = clean_link(href)
                self.parts.append(f"]({urljoin(self.base_url, href)})")
            else:
                self.parts.append("]")
        if tag in self.BLOCKS or tag in {f"h{level}" for level in range(1, 7)} or tag == "li":
            self._line_break()

    def handle_data(self, data: str) -> None:
        if self.skip_depth:
            return
        value = re.sub(r"\s+", " ", html.unescape(data))
        if not value.strip():
            return
        if self.parts and not self.parts[-1].endswith((" ", "\n", "[", "# ", "## ", "### ", "#### ", "##### ", "###### ")):
            self.parts.append(" ")
        self.parts.append(value.strip())

    def markdown(self) -> str:
        value = "".join(self.parts)
        value = re.sub(r"[ \t]+\n", "\n", value)
        value = re.sub(r"\n{3,}", "\n\n", value)
        value = value.replace("\u2014", ",")
        return value.strip() + "\n"


def clean_link(value: str) -> str:
    if value == "index.html" or value == "/index.html":
        return "/"
    if value.startswith("https://meshgi.com/index.html"):
        return value.replace("https://meshgi.com/index.html", SITE + "/", 1)
    value = re.sub(r"(?<![\w/-])([a-z0-9-]+)\.html", r"/\1/", value)
    value = re.sub(r"https://meshgi\.com/([a-z0-9-]+)\.html", rf"{SITE}/\1/", value)
    return value


def update_html(slug: str) -> tuple[str, str]:
    path = ROOT / f"{slug}.html"
    source = path.read_text(encoding="utf-8")
    canonical = absolute_route(slug)
    md_url = SITE + markdown_route(slug)

    source = source.replace("https://meshgi.com/index.html", SITE + "/")
    source = re.sub(r"https://meshgi\.com/([a-z0-9-]+)\.html", rf"{SITE}/\1/", source)
    source = re.sub(r'href="index\.html([#?][^"]*)?"', lambda m: f'href="/{m.group(1) or ""}"', source)
    source = re.sub(r'href="([a-z0-9-]+)\.html([#?][^"]*)?"', lambda m: f'href="/{m.group(1)}/{m.group(2) or ""}"', source)

    for page_slug in PUBLIC_PAGES[1:]:
        source = re.sub(
            rf"https://meshgi\.com/{re.escape(page_slug)}(?![a-z0-9.\-/])",
            f"{SITE}/{page_slug}/",
            source,
        )
        source = re.sub(
            rf'href="/{re.escape(page_slug)}(?![a-z0-9.\-/])',
            f'href="/{page_slug}/',
            source,
        )

    source = re.sub(r'((?:href|src)=")((?:assets/)|(?:styles\.css)|(?:site\.js)|(?:kiosk-demo\.css)|(?:kiosk-demo\.js))', r'\1/\2', source)

    source = re.sub(r'\n\s*<link rel="alternate" type="text/markdown"[^>]*>', "", source)
    canonical_tag = re.search(r'<link rel="canonical" href="[^"]+">', source)
    alternate = f'<link rel="alternate" type="text/markdown" href="{md_url}" title="Markdown version">'
    if canonical_tag:
        source = source[: canonical_tag.end()] + "\n  " + alternate + source[canonical_tag.end() :]

    if 'name="googlebot"' not in source:
        robots = re.search(r'<meta name="robots" content="[^"]+">', source)
        if robots:
            googlebot = '<meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">'
            source = source[: robots.end()] + "\n  " + googlebot + source[robots.end() :]

    if 'property="og:image:alt"' not in source:
        image = re.search(r'<meta property="og:image" content="[^"]+">', source)
        if image:
            extras = '\n  <meta property="og:image:width" content="1024">\n  <meta property="og:image:height" content="1024">\n  <meta property="og:image:alt" content="Collage portrait of Parmis Meshgi">'
            source = source[: image.end()] + extras + source[image.end() :]

    if 'name="twitter:image:alt"' not in source:
        image = re.search(r'<meta name="twitter:image" content="[^"]+">', source)
        if image:
            source = source[: image.end()] + '\n  <meta name="twitter:image:alt" content="Collage portrait of Parmis Meshgi">' + source[image.end() :]

    path.write_text(source, encoding="utf-8")

    parser = MetadataParser()
    parser.feed(source)
    return parser.title.strip(), parser.description.strip()


def make_markdown(slug: str, title: str, description: str) -> str:
    source = (ROOT / f"{slug}.html").read_text(encoding="utf-8")
    parser = MarkdownParser(absolute_route(slug))
    parser.feed(source)
    canonical = absolute_route(slug)
    frontmatter = {
        "title": title,
        "description": description,
        "canonical_url": canonical,
        "html_url": canonical,
        "author": "Parmis Meshgi",
        "location": "Toronto, Canada",
        "language": "en-CA",
        "last_updated": TODAY,
    }
    lines = ["---"]
    for key, value in frontmatter.items():
        lines.append(f"{key}: {json.dumps(value, ensure_ascii=False)}")
    lines.extend(
        [
            "---",
            "",
            f"> {description}",
            "",
            f"Canonical page: [{canonical}]({canonical})",
            "",
            parser.markdown(),
        ]
    )
    return "\n".join(lines).strip() + "\n"


def build_sitemap() -> None:
    entries = []
    for slug in PUBLIC_PAGES:
        entries.append(
            "  <url>\n"
            f"    <loc>{absolute_route(slug)}</loc>\n"
            f"    <lastmod>{TODAY}</lastmod>\n"
            "  </url>"
        )
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    xml += "\n".join(entries)
    xml += "\n</urlset>\n"
    (ROOT / "sitemap.xml").write_text(xml, encoding="utf-8")


def build_llms(records: list[tuple[str, str, str]]) -> None:
    groups = [
        ("Main portfolio", ["index", "product-design", "restaurant-product-design", "ai-design-practice", "resume"]),
        ("Restaurant product work", ["kiosk", "bar-tabs", "backoffice", "pos"]),
        ("Independent products", ["playground", "footsteps", "seej", "health-exporter", "family-tree", "fitness", "orange-institute", "hitchi", "rooydad", "chaashni"]),
        ("Other practice", ["photography", "teaching"]),
    ]
    data = {slug: (title, description) for slug, title, description in records}
    lines = [
        "# Parmis Meshgi",
        "",
        "> Senior product designer in Toronto. The portfolio covers restaurant software, UX research, UI design, product strategy, design systems, AI-assisted design, and shipped products.",
        "",
        "Use the Markdown links below for compact, text-first versions. Use the canonical links for the visual portfolio.",
    ]
    for heading, slugs in groups:
        lines.extend(["", f"## {heading}", ""])
        for slug in slugs:
            title, description = data[slug]
            lines.append(f"- [{title}]({markdown_route(slug)}): {description}")
    lines.extend(
        [
            "",
            "## Discovery files",
            "",
            "- [XML sitemap](/sitemap.xml): Canonical search routes.",
            "- [Robots rules](/robots.txt): Crawler access and sitemap location.",
            "- [Complete text corpus](/llms-full.txt): All public Markdown pages in one document.",
        ]
    )
    (ROOT / "llms.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")

    full = ["# Parmis Meshgi portfolio", "", "This file contains every public page in text form."]
    for slug, title, _ in records:
        full.extend(["", "---", "", f"# Page: {title}", "", (ROOT / f"{slug}.md").read_text(encoding="utf-8")])
    (ROOT / "llms-full.txt").write_text("\n".join(full).strip() + "\n", encoding="utf-8")


def main() -> None:
    records = []
    for slug in PUBLIC_PAGES:
        title, description = update_html(slug)
        records.append((slug, title, description))
    for slug, title, description in records:
        (ROOT / f"{slug}.md").write_text(make_markdown(slug, title, description), encoding="utf-8")
        if slug not in {"index", "photography"}:
            route_dir = ROOT / slug
            route_dir.mkdir(exist_ok=True)
            (route_dir / "index.html").write_text((ROOT / f"{slug}.html").read_text(encoding="utf-8"), encoding="utf-8")
    build_sitemap()
    build_llms(records)


if __name__ == "__main__":
    main()
