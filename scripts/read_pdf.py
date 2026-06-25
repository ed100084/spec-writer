import pdfplumber
import sys

pdf_path = sys.argv[1]
max_chars = int(sys.argv[2]) if len(sys.argv) > 2 else 5000

text = ""
with pdfplumber.open(pdf_path) as pdf:
    for page in pdf.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"

print(text[:max_chars])
