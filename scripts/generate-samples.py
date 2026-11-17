#!/usr/bin/env python3
"""Generate the sample PDFs used by the Storybook stories and examples.

Requires reportlab:  pip install reportlab
Run from the repository root:  pnpm samples
"""
from pathlib import Path

from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import simpleSplit
from reportlab.pdfgen import canvas

OUT = Path(__file__).resolve().parent.parent / "public" / "samples"
OUT.mkdir(parents=True, exist_ok=True)

W, H = A4
INK = HexColor("#25262b")
MUTED = HexColor("#6b7280")
PAPER = HexColor("#fbfaf7")
LINE = HexColor("#e5e2dc")
BLUE = HexColor("#2563eb")
BLUE_SOFT = HexColor("#eff4ff")
RED = HexColor("#af3434")
RED_SOFT = HexColor("#fbeeee")
GREEN = HexColor("#15803d")
GREEN_SOFT = HexColor("#eef8f1")
AMBER = HexColor("#b45309")
AMBER_SOFT = HexColor("#fdf6e7")
NAVY = HexColor("#171b2b")


def wrap(c, text, x, y, width, font="Helvetica", size=10.5, leading=15, color=INK):
    c.setFont(font, size)
    c.setFillColor(color)
    lines = simpleSplit(text, font, size, width)
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def page_header(c, section, number):
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setFillColor(RED)
    c.rect(0, H - 7, W, 7, stroke=0, fill=1)
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(MUTED)
    c.drawString(52, H - 34, "STIRLING PDF HANDBOOK")
    c.drawRightString(W - 52, H - 34, section.upper())
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    c.line(52, H - 43, W - 52, H - 43)


def page_footer(c, number, total=12):
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    c.line(52, 46, W - 52, 46)
    c.setFont("Helvetica", 8)
    c.setFillColor(MUTED)
    c.drawString(52, 32, "A sample document for the Stirling PDF UI Components library")
    c.drawRightString(W - 52, 32, f"{number} / {total}")


def h1(c, text, y):
    c.setFont("Helvetica-Bold", 25)
    c.setFillColor(INK)
    c.drawString(52, y, text)
    return y - 28


def h2(c, text, y):
    c.setFont("Helvetica-Bold", 13)
    c.setFillColor(INK)
    c.drawString(52, y, text)
    return y - 16


def body(c, text, y, width=W - 104, size=10.5, color=INK):
    return wrap(c, text, 52, y, width, size=size, color=color)


def callout(c, title, text, y, tone="blue"):
    palette = {
        "blue": (BLUE_SOFT, BLUE),
        "red": (RED_SOFT, RED),
        "green": (GREEN_SOFT, GREEN),
        "amber": (AMBER_SOFT, AMBER),
    }
    bg, accent = palette[tone]
    height = 72
    c.setFillColor(bg)
    c.roundRect(52, y - height, W - 104, height, 6, stroke=0, fill=1)
    c.setFillColor(accent)
    c.roundRect(52, y - height, 5, height, 2, stroke=0, fill=1)
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(accent)
    c.drawString(68, y - 20, title.upper())
    wrap(c, text, 68, y - 36, W - 140, size=9.2, leading=12.5, color=INK)
    return y - height - 20


def draw_table(c, rows, y, widths, header=True):
    x = 52
    row_height = 24
    for row_index, row in enumerate(rows):
        if header and row_index == 0:
            c.setFillColor(HexColor("#f1efea"))
        elif row_index % 2 == 0:
            c.setFillColor(HexColor("#faf9f6"))
        else:
            c.setFillColor(white)
        c.rect(52, y - row_height, sum(widths), row_height, stroke=0, fill=1)
        c.setFillColor(INK if (header and row_index == 0) else MUTED)
        c.setFont("Helvetica-Bold" if (header and row_index == 0) else "Helvetica", 9)
        cell_x = 52
        for text, width in zip(row, widths):
            c.drawString(cell_x + 10, y - 15.5, str(text))
            cell_x += width
        c.setStrokeColor(LINE)
        c.setLineWidth(0.5)
        c.line(52, y - row_height, 52 + sum(widths), y - row_height)
        y -= row_height
    return y


def cover(c):
    c.setFillColor(NAVY)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setFillColor(RED)
    c.rect(0, 0, 18, H, stroke=0, fill=1)
    c.setFillColor(Color(0.68, 0.2, 0.2, alpha=0.22))
    c.circle(W + 40, H - 80, 230, stroke=0, fill=1)
    c.setFillColor(Color(1, 1, 1, alpha=0.04))
    c.circle(W - 60, 160, 180, stroke=0, fill=1)

    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(72, H - 92, "STIRLING PDF")
    c.setFillColor(HexColor("#9aa0b5"))
    c.setFont("Helvetica", 9)
    c.drawString(72, H - 108, "DOCUMENT WORKFLOWS · 2026")

    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 54)
    c.drawString(72, H - 250, "The PDF")
    c.drawString(72, H - 310, "workflow")
    c.setFillColor(HexColor("#e0a3a3"))
    c.drawString(72, H - 370, "handbook.")

    c.setFillColor(HexColor("#c9ccd8"))
    c.setFont("Helvetica", 12)
    c.drawString(72, H - 420, "A practical field guide to reviewing, organizing,")
    c.drawString(72, H - 440, "protecting, and shipping documents with confidence.")

    c.setFillColor(RED)
    c.roundRect(72, 110, 132, 30, 15, stroke=0, fill=1)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(92, 121, "SAMPLE DOCUMENT")

    c.setFillColor(HexColor("#7d8399"))
    c.setFont("Helvetica", 8)
    c.drawString(72, 76, "Generated for the Stirling PDF UI Components library · MIT licensed")
    c.showPage()


def contents(c):
    page_header(c, "Contents", 2)
    y = h1(c, "What’s inside", H - 108)
    y = body(
        c,
        "Twelve pages of realistic document content for testing thumbnails, viewers, page organizers, OCR settings, and search.",
        y,
        size=11,
        color=MUTED,
    )
    y -= 22

    entries = [
        ("01", "A calmer document workflow", "Why good document UI reduces mistakes", 3),
        ("02", "The review loop", "Annotations, approvals, and comments", 4),
        ("03", "Organizing pages", "Reorder, rotate, duplicate, and remove", 5),
        ("04", "Metrics that matter", "A small table of operational numbers", 6),
        ("05", "Security and access", "Passwords, permissions, and redaction", 7),
        ("06", "Scanned documents", "OCR, deskewing, and cleanup", 8),
        ("07", "Shipping the result", "Compression, naming, and handoff", 9),
        ("08", "A checklist", "Before a document leaves your desk", 10),
        ("09", "Field notes", "Patterns from teams that ship PDFs", 11),
        ("10", "Where to go next", "Links and further reading", 12),
    ]
    for number, title, subtitle, page in entries:
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(RED)
        c.drawString(52, y, number)
        c.setFont("Helvetica-Bold", 11.5)
        c.setFillColor(INK)
        c.drawString(88, y, title)
        c.setFont("Helvetica", 9)
        c.setFillColor(MUTED)
        c.drawString(88, y - 13, subtitle)
        c.setFont("Helvetica", 9)
        c.setFillColor(MUTED)
        c.drawRightString(W - 52, y, str(page))
        c.setStrokeColor(LINE)
        c.setLineWidth(0.5)
        c.line(52, y - 21, W - 52, y - 21)
        y -= 39

    page_footer(c, 2)
    c.showPage()


def chapter(c, number, title, kicker, paragraphs, page, tone="blue", extra=None):
    page_header(c, title, page)
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(RED)
    c.drawString(52, H - 76, f"CHAPTER {number}")

    y = h1(c, title, H - 106)
    y = body(c, kicker, y, size=12, color=MUTED)
    y -= 12

    for paragraph in paragraphs:
        y = body(c, paragraph, y)
        y -= 12

    if extra:
        y = extra(c, y)

    page_footer(c, page)
    c.showPage()


def review_extra(c, y):
    y -= 6
    y = h2(c, "A review loop that works", y)
    steps = [
        ("1", "Capture", "Drop the file, confirm page count, and add a short title."),
        ("2", "Inspect", "Read at fit-width, search for key terms, and check page order."),
        ("3", "Act", "Rotate, redact, sign, or split — one change at a time."),
        ("4", "Verify", "Re-open the result and confirm the page count and metadata."),
    ]
    for number, title, text in steps:
        c.setFillColor(BLUE_SOFT)
        c.circle(62, y - 2, 9, stroke=0, fill=1)
        c.setFillColor(BLUE)
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(62, y - 5, number)
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(80, y, title)
        c.setFont("Helvetica", 9)
        c.setFillColor(MUTED)
        c.drawString(140, y, text)
        y -= 24
    return y - 8


def table_page(c):
    page_header(c, "Metrics", 6)
    y = h1(c, "Metrics that matter", H - 108)
    y = body(
        c,
        "Good document interfaces make the important numbers visible without turning the page into a dashboard. These are the numbers our teams check most often.",
        y,
        size=11,
        color=MUTED,
    )
    y -= 18

    rows = [
        ("Signal", "Target", "Why it matters"),
        ("Time to first page", "< 1.2 s", "A fast preview builds trust."),
        ("Pages per session", "8–24", "Most work happens in batches."),
        ("Rework after export", "< 4%", "Fewer surprises at handoff."),
        ("Password-protected files", "12%", "Security is routine, not rare."),
        ("OCR requests", "31%", "Scans are still everywhere."),
    ]
    y = draw_table(c, rows, y, [180, 100, W - 384])
    y -= 26

    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(INK)
    c.drawString(52, y, "Weekly document volume")
    y -= 18

    bars = [["Mon", 42], ["Tue", 68], ["Wed", 54], ["Thu", 82], ["Fri", 74], ["Sat", 18], ["Sun", 12]]
    base = y - 110
    for index, (label, value) in enumerate(bars):
        x = 62 + index * 66
        height = value * 1.15
        c.setFillColor(BLUE if value > 40 else HexColor("#b9c7ea"))
        c.roundRect(x, base, 30, height, 3, stroke=0, fill=1)
        c.setFont("Helvetica", 7.5)
        c.setFillColor(MUTED)
        c.drawCentredString(x + 15, base - 12, label)
        c.drawCentredString(x + 15, base + height + 6, str(value))

    y = base - 34
    y = callout(
        c,
        "Read the shape, not the number",
        "A spike on Thursday usually means a batch of invoices. Offer split and merge actions where the volume is.",
        y,
        "amber",
    )
    page_footer(c, 6)
    c.showPage()


def security_page(c):
    page_header(c, "Security", 7)
    y = h1(c, "Security and access", H - 108)
    y = body(
        c,
        "Protection is a product surface, not a checkbox. Explain what each permission means, and never make the user guess whether a file is encrypted.",
        y,
        size=11,
        color=MUTED,
    )
    y -= 14

    y = callout(
        c,
        "Passwords are not permissions",
        "A password controls who can open the file. Permissions control what they can do after opening it. Show both, separately.",
        y,
        "red",
    )

    y = h2(c, "Before you protect a document", y)
    checks = [
        "Use a unique password with at least 12 characters.",
        "Decide whether printing and copying should be allowed.",
        "Keep the owner password somewhere safe.",
        "Verify the protected file by opening it in a fresh reader.",
    ]
    for item in checks:
        c.setStrokeColor(GREEN)
        c.setLineWidth(1.4)
        c.circle(57, y + 3, 4.5, stroke=1, fill=0)
        c.setFont("Helvetica-Bold", 7)
        c.setFillColor(GREEN)
        c.drawCentredString(57, y + 1, "✓")
        y = body(c, item, y, width=W - 130, size=9.8)
        y -= 8

    y -= 14
    y = h2(c, "Redaction is permanent", y)
    y = body(
        c,
        "Black rectangles drawn on top of text are not redaction. Remove the underlying content, then flatten the page. Test by selecting the area and copying it.",
        y,
    )
    page_footer(c, 7)
    c.showPage()


def ocr_page(c):
    page_header(c, "Scanned documents", 8)
    c.setFillColor(HexColor("#f3efe5"))
    c.rect(52, H - 390, W - 104, 210, stroke=0, fill=1)
    c.setFillColor(HexColor("#d8d1c1"))
    for index in range(9):
        c.rect(80, H - 250 - index * 15, W - 180 - (index % 3) * 40, 4, stroke=0, fill=1)
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(HexColor("#9b8f78"))
    c.drawString(80, H - 214, "SCANNED PAGE — TEXT LAYER MISSING")

    y = h1(c, "Scanned documents", H - 430)
    y = body(
        c,
        "A scan is an image of a document. OCR turns that image into searchable text; it does not make the page look better. Treat deskew, cleanup, and OCR as separate decisions.",
        y,
        size=11,
        color=MUTED,
    )
    y -= 16

    rows = [
        ("Step", "Default", "When to change it"),
        ("Deskew", "On", "Pages are visibly tilted."),
        ("Clean", "On", "Scans have noise or grey backgrounds."),
        ("Rotate", "Off", "Pages were fed sideways."),
        ("Language", "English", "Any other language appears in the text."),
    ]
    y = draw_table(c, rows, y, [100, 90, W - 294])
    y -= 22

    y = callout(
        c,
        "OCR is not free",
        "Each language adds processing time. Start with the languages that actually occur, and only redo OCR when the existing text layer is wrong.",
        y,
        "green",
    )
    page_footer(c, 8)
    c.showPage()


def shipping_page(c):
    page_header(c, "Shipping", 9)
    y = h1(c, "Shipping the result", H - 108)
    y = body(
        c,
        "The last mile decides whether the work feels finished. Name files predictably, compress with intent, and always offer a way back.",
        y,
        size=11,
        color=MUTED,
    )
    y -= 18

    y = h2(c, "A simple naming scheme", y)
    examples = [
        "invoice-2026-03-acme.pdf",
        "contract-signed-2026-03-14.pdf",
        "report-q1-pages-1-12.pdf",
        "scan-batch-07-ocr.pdf",
    ]
    for name in examples:
        c.setFont("Courier-Bold", 9.5)
        c.setFillColor(BLUE)
        c.drawString(60, y, name)
        y -= 17

    y -= 18
    y = h2(c, "Compression presets", y)
    rows = [
        ("Preset", "Best for", "Typical saving"),
        ("Light", "Print and archival", "10–20%"),
        ("Balanced", "Email and review", "35–55%"),
        ("Small file", "Web and mobile", "60–75%"),
    ]
    y = draw_table(c, rows, y, [120, 210, W - 434])
    y -= 26

    y = callout(
        c,
        "Always keep the original",
        "Compression is lossy. Keep the source file until the recipient confirms the result is readable on their device.",
        y,
        "red",
    )
    page_footer(c, 9)
    c.showPage()


def checklist_page(c):
    page_header(c, "Checklist", 10)
    y = h1(c, "Before it leaves your desk", H - 108)
    y = body(
        c,
        "A short, repeatable checklist catches most of the mistakes that turn a finished document into another round trip.",
        y,
        size=11,
        color=MUTED,
    )
    y -= 22

    items = [
        "Page count matches the source.",
        "Page order and rotation are correct.",
        "Sensitive content is removed, not covered.",
        "Metadata (title, author) is accurate.",
        "Fonts are embedded and text is selectable.",
        "The file opens in a second reader.",
        "The filename tells the recipient what it is.",
        "A backup of the original exists.",
    ]
    for index, item in enumerate(items):
        c.setStrokeColor(LINE)
        c.setLineWidth(1)
        c.roundRect(52, y - 6, 13, 13, 2, stroke=1, fill=0)
        if index % 3 == 0:
            c.setStrokeColor(GREEN)
            c.setLineWidth(1.8)
            c.line(55, y, 58, y - 3)
            c.line(58, y - 3, 64, y + 6)
        c.setFont("Helvetica", 10.5)
        c.setFillColor(INK)
        c.drawString(76, y, item)
        y -= 30

    page_footer(c, 10)
    c.showPage()


def quote_page(c):
    page_header(c, "Field notes", 11)
    y = H - 170
    c.setFillColor(RED)
    c.setFont("Helvetica-Bold", 70)
    c.drawString(52, y, "“")
    c.setFont("Helvetica-Bold", 19)
    c.setFillColor(INK)
    y -= 48
    lines = [
        "The best document tool is the one",
        "that makes the next step obvious.",
    ]
    for line in lines:
        c.drawString(88, y, line)
        y -= 26
    c.setFont("Helvetica", 10)
    c.setFillColor(MUTED)
    c.drawString(88, y - 8, "A note from the field")

    y -= 70
    y = body(
        c,
        "Teams that handle documents every day do not need more buttons. They need a clear starting point, a reliable preview, and a result they can trust. Every component in this handbook is an invitation to remove one more moment of doubt.",
        y,
        width=W - 160,
        size=11,
        color=MUTED,
    )

    y -= 24
    y = h2(c, "Patterns worth copying", y)
    patterns = [
        ("Show the page, not just the filename.", "A thumbnail answers more questions than a size label."),
        ("Keep destructive actions reversible.", "Undo is cheaper than an apology."),
        ("Explain the default.", "A preset is a promise; say what it optimizes for."),
        ("Make progress visible.", "Even an indeterminate bar reduces anxiety."),
    ]
    for title, text in patterns:
        c.setFillColor(BLUE)
        c.circle(58, y + 3, 3, stroke=0, fill=1)
        c.setFont("Helvetica-Bold", 10)
        c.setFillColor(INK)
        c.drawString(72, y, title)
        c.setFont("Helvetica", 9)
        c.setFillColor(MUTED)
        c.drawString(72, y - 13, text)
        y -= 38

    page_footer(c, 11)
    c.showPage()


def next_page(c):
    page_header(c, "Next", 12)
    y = h1(c, "Where to go next", H - 108)
    y = body(
        c,
        "This sample exists to make the component stories realistic. Replace it with your own document when you test your integration.",
        y,
        size=11,
        color=MUTED,
    )
    y -= 24

    links = [
        ("Stirling PDF", "https://stirlingpdf.com"),
        ("Stirling PDF on GitHub", "https://github.com/Stirling-Tools/Stirling-PDF"),
        ("pdf.js", "https://mozilla.github.io/pdf.js/"),
        ("shadcn-vue", "https://www.shadcn-vue.com"),
    ]
    for title, url in links:
        c.setFont("Helvetica-Bold", 11)
        c.setFillColor(INK)
        c.drawString(52, y, title)
        c.setFont("Courier", 9)
        c.setFillColor(BLUE)
        c.drawString(52, y - 15, url)
        y -= 42

    y -= 10
    y = callout(
        c,
        "MIT licensed",
        "The components in this library are MIT licensed. Stirling PDF itself is open source; check the license of each upstream area before copying code.",
        y,
        "blue",
    )
    page_footer(c, 12)
    c.showPage()


def protected_document():
    from reportlab.lib.pdfencrypt import StandardEncryption

    encryption = StandardEncryption(
        "stirling",
        ownerPassword="stirling-owner",
        canPrint=0,
        canModify=0,
        canCopy=0,
        strength=128,
    )
    c = canvas.Canvas(
        str(OUT / "protected.pdf"),
        pagesize=A4,
        pageCompression=1,
        encrypt=encryption,
    )
    c.setTitle("Protected sample")
    c.setAuthor("Stirling PDF UI Components")
    c.setSubject("Password-protected sample for viewer testing")

    for page_number in (1, 2):
        c.setFillColor(PAPER)
        c.rect(0, 0, W, H, stroke=0, fill=1)
        c.setFillColor(RED)
        c.rect(0, H - 7, W, 7, stroke=0, fill=1)
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(RED)
        c.drawString(52, H - 80, "PROTECTED DOCUMENT")
        c.setFont("Helvetica-Bold", 26)
        c.setFillColor(INK)
        c.drawString(52, H - 120, "This page is password protected")
        c.setFont("Helvetica", 11)
        c.setFillColor(MUTED)
        wrap(
            c,
            f"Page {page_number} of 2. The viewer should prompt for the open password before rendering.",
            52,
            H - 150,
            W - 104,
            size=11,
            leading=17,
            color=MUTED,
        )
        c.setFillColor(BLUE_SOFT)
        c.roundRect(52, H - 280, W - 104, 80, 6, stroke=0, fill=1)
        c.setFont("Helvetica-Bold", 10)
        c.setFillColor(BLUE)
        c.drawString(68, H - 252, "OPEN PASSWORD")
        c.setFont("Courier-Bold", 16)
        c.setFillColor(INK)
        c.drawString(68, H - 278, "stirling")
        c.setFont("Helvetica", 9)
        c.setFillColor(MUTED)
        c.drawString(68, H - 300, "Use this password in the Storybook story and the demo.")
        page_footer(c, page_number, total=2)
        c.showPage()

    c.save()


def handbook():
    c = canvas.Canvas(str(OUT / "handbook.pdf"), pagesize=A4, pageCompression=1)
    c.setTitle("The PDF Workflow Handbook")
    c.setAuthor("Stirling PDF UI Components")
    c.setSubject("Sample document for component testing")
    c.setKeywords("stirling, pdf, workflow, sample, documentation")
    cover(c)
    contents(c)

    chapter(
        c,
        1,
        "A calmer document workflow",
        "Most document work is not editing. It is deciding what to do next.",
        [
            "A PDF arrives with no context. It might be a contract, an invoice, a scan, or a report. The first screen has to answer three questions: what is this, how many pages does it have, and what can I do with it?",
            "Good document interfaces answer those questions before the user clicks anything. They show a preview, a page count, and a small set of likely actions. They do not begin with a wall of settings.",
            "The components in this library follow the same rhythm: drop a file, confirm what it is, choose one operation, review the result. Each step has a visible state and a way back.",
        ],
        3,
        extra=review_extra,
    )

    chapter(
        c,
        2,
        "The review loop",
        "Annotations are a conversation. Keep the conversation close to the page.",
        [
            "Review is where documents slow down. Comments get lost in email, highlights lose their context, and approvals arrive without a page reference. A good viewer keeps every note attached to the page that caused it.",
            "Search is part of review, not a separate tool. Users search for names, amounts, clause numbers, and dates. Results should show a snippet and jump directly to the page, with the match highlighted.",
            "When a review is finished, the result should be exportable without losing the annotations that matter. Flattening, printing, and sharing are separate decisions and deserve separate controls.",
        ],
        4,
        tone="green",
    )

    chapter(
        c,
        3,
        "Organizing pages",
        "Page order is the most common edit, and the easiest to get wrong.",
        [
            "Reorder, rotate, duplicate, and delete are the four verbs of page organization. They should be reversible, keyboard accessible, and visible at a glance. A page organizer without undo is a trap.",
            "Show the resulting position and the original page number. After a rotation, show the angle. After a deletion, show what was removed and offer a reset. The user should never have to remember the original order.",
            "Multi-select is essential. Shift-click selects a range, Ctrl/Cmd-click toggles individual pages, and dragging a selected page moves the whole selection. Every action applies to the selection, and the toolbar says how many pages are affected.",
        ],
        5,
        tone="amber",
    )

    table_page(c)
    security_page(c)
    ocr_page(c)
    shipping_page(c)
    checklist_page(c)
    quote_page(c)
    next_page(c)
    c.save()


def invoice():
    c = canvas.Canvas(str(OUT / "invoice.pdf"), pagesize=A4, pageCompression=1)
    c.setTitle("Invoice 2026-0314")
    c.setAuthor("Acme Design Studio")
    c.setSubject("Sample invoice for component testing")
    c.setKeywords("invoice, sample, stirling, pdf")

    for page_number in (1, 2):
        c.setFillColor(white)
        c.rect(0, 0, W, H, stroke=0, fill=1)
        c.setFillColor(NAVY)
        c.rect(0, H - 120, W, 120, stroke=0, fill=1)
        c.setFillColor(white)
        c.setFont("Helvetica-Bold", 22)
        c.drawString(52, H - 62, "ACME DESIGN STUDIO")
        c.setFillColor(HexColor("#aab0c4"))
        c.setFont("Helvetica", 9)
        c.drawString(52, H - 80, "42 Example Street · Berlin · hello@acme.example")
        c.setFillColor(RED)
        c.roundRect(W - 180, H - 78, 128, 28, 14, stroke=0, fill=1)
        c.setFillColor(white)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(W - 116, H - 68, f"INVOICE · PAGE {page_number}")

        if page_number == 1:
            y = H - 170
            c.setFillColor(INK)
            c.setFont("Helvetica-Bold", 30)
            c.drawString(52, y, "Invoice 2026-0314")
            y -= 22
            c.setFont("Helvetica", 10)
            c.setFillColor(MUTED)
            c.drawString(52, y, "Issued 14 March 2026 · Due 13 April 2026")

            y -= 54
            c.setFont("Helvetica-Bold", 9)
            c.setFillColor(MUTED)
            c.drawString(52, y, "BILLED TO")
            c.setFillColor(INK)
            c.setFont("Helvetica-Bold", 11)
            c.drawString(52, y - 18, "Northwind Components GmbH")
            c.setFont("Helvetica", 9.5)
            c.setFillColor(MUTED)
            c.drawString(52, y - 33, "Attn. Finance · 8 Harbour Road · Hamburg")
            c.drawRightString(W - 52, y, "TOTAL DUE")
            c.setFillColor(INK)
            c.setFont("Helvetica-Bold", 26)
            c.drawRightString(W - 52, y - 28, "€ 4,820.00")

            y -= 84
            rows = [
                ("Description", "Qty", "Rate", "Amount"),
                ("Product discovery workshop", "2", "€ 950.00", "€ 1,900.00"),
                ("Interface design · dashboard", "1", "€ 1,650.00", "€ 1,650.00"),
                ("Component library handoff", "1", "€ 780.00", "€ 780.00"),
                ("Documentation sprint", "1", "€ 490.00", "€ 490.00"),
            ]
            y = draw_table(c, rows, y, [W - 360, 60, 100, 100])
            y -= 18
            c.setFont("Helvetica", 9.5)
            c.setFillColor(MUTED)
            c.drawRightString(W - 152, y, "Subtotal")
            c.setFillColor(INK)
            c.drawRightString(W - 52, y, "€ 4,820.00")
            y -= 17
            c.setFillColor(MUTED)
            c.drawRightString(W - 152, y, "VAT (0%)")
            c.setFillColor(INK)
            c.drawRightString(W - 52, y, "€ 0.00")

            y = callout(
                c,
                "Payment terms",
                "Payment is due within 30 days. Please reference the invoice number. Thank you for working with us.",
                y - 42,
                "blue",
            )
        else:
            y = H - 180
            c.setFillColor(INK)
            c.setFont("Helvetica-Bold", 24)
            c.drawString(52, y, "Notes & next steps")
            y -= 30
            c.setFont("Helvetica", 10.5)
            c.setFillColor(MUTED)
            y = wrap(
                c,
                "This second page exists so split, merge, and page-selection stories have a realistic multi-page document to work with. It contains enough text for search and a few distinct sections for thumbnails.",
                52,
                y,
                W - 104,
                size=10.5,
                leading=16,
                color=INK,
            )
            y -= 22
            c.setFont("Helvetica-Bold", 12)
            c.setFillColor(INK)
            c.drawString(52, y, "What happens next")
            y -= 20
            for index, item in enumerate(
                [
                    "We archive the signed statement of work.",
                    "The final source files are delivered via the shared workspace.",
                    "A follow-up review is scheduled for 28 March.",
                ],
                start=1,
            ):
                c.setFillColor(BLUE_SOFT)
                c.circle(60, y + 3, 9, stroke=0, fill=1)
                c.setFillColor(BLUE)
                c.setFont("Helvetica-Bold", 8)
                c.drawCentredString(60, y, str(index))
                c.setFont("Helvetica", 10)
                c.setFillColor(INK)
                c.drawString(78, y, item)
                y -= 26

            y -= 10
            y = callout(
                c,
                "Thank you",
                "Every document in this sample is fictional. Use it freely to test the Stirling PDF UI Components library.",
                y,
                "green",
            )

        c.setStrokeColor(LINE)
        c.line(52, 48, W - 52, 48)
        c.setFont("Helvetica", 8)
        c.setFillColor(MUTED)
        c.drawString(52, 33, "Acme Design Studio · VAT DE000000000 · IBAN DE00 0000 0000 0000 0000 00")
        c.drawRightString(W - 52, 33, f"{page_number} / 2")
        c.showPage()

    c.save()


if __name__ == "__main__":
    handbook()
    invoice()
    protected_document()
    print(f"Wrote sample PDFs to {OUT}")
