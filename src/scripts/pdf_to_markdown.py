#!/usr/bin/env python3
"""
PDF to Markdown Converter for SEC College Football Documents
Converts PDF files to markdown format for Cursor AI compatibility
"""

import os
import sys
import argparse
from pathlib import Path
from typing import List, Optional
import logging

# Try to import PDF processing libraries
try:
    import PyPDF2
except ImportError:
    print("PyPDF2 not installed. Installing...")
    os.system("pip install PyPDF2")
    import PyPDF2

try:
    import pdfplumber
except ImportError:
    print("pdfplumber not installed. Installing...")
    os.system("pip install pdfplumber")
    import pdfplumber

try:
    from PIL import Image
    import pytesseract
except ImportError:
    print("OCR libraries not installed. Installing...")
    os.system("pip install pillow pytesseract")
    from PIL import Image
    import pytesseract

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class PDFToMarkdownConverter:
    """Converts PDF files to Markdown format"""
    
    def __init__(self, input_dir: str, output_dir: str):
        self.input_dir = Path(input_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def extract_text_pypdf2(self, pdf_path: Path) -> str:
        """Extract text using PyPDF2"""
        try:
            text = []
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                num_pages = len(pdf_reader.pages)
                
                for page_num in range(num_pages):
                    page = pdf_reader.pages[page_num]
                    text.append(f"## Page {page_num + 1}\n\n")
                    text.append(page.extract_text())
                    text.append("\n\n---\n\n")
                    
            return ''.join(text)
        except Exception as e:
            logger.error(f"PyPDF2 extraction failed for {pdf_path}: {e}")
            return ""
    
    def extract_text_pdfplumber(self, pdf_path: Path) -> str:
        """Extract text using pdfplumber (better for tables)"""
        try:
            text = []
            with pdfplumber.open(pdf_path) as pdf:
                for i, page in enumerate(pdf.pages, 1):
                    text.append(f"## Page {i}\n\n")
                    
                    # Extract text
                    page_text = page.extract_text()
                    if page_text:
                        text.append(page_text)
                    
                    # Extract tables
                    tables = page.extract_tables()
                    if tables:
                        text.append("\n### Tables\n\n")
                        for table in tables:
                            text.append(self.table_to_markdown(table))
                    
                    text.append("\n\n---\n\n")
                    
            return ''.join(text)
        except Exception as e:
            logger.error(f"pdfplumber extraction failed for {pdf_path}: {e}")
            return ""
    
    def table_to_markdown(self, table: List[List]) -> str:
        """Convert table data to markdown format"""
        if not table:
            return ""
        
        markdown = []
        
        # Header row
        header = table[0]
        markdown.append("| " + " | ".join(str(cell) if cell else "" for cell in header) + " |")
        markdown.append("|" + "|".join("---" for _ in header) + "|")
        
        # Data rows
        for row in table[1:]:
            markdown.append("| " + " | ".join(str(cell) if cell else "" for cell in row) + " |")
        
        return "\n".join(markdown) + "\n\n"
    
    def convert_pdf_to_markdown(self, pdf_path: Path) -> bool:
        """Convert a single PDF to markdown"""
        logger.info(f"Converting {pdf_path.name}...")
        
        # Try pdfplumber first (better for structured data)
        content = self.extract_text_pdfplumber(pdf_path)
        
        # Fallback to PyPDF2 if needed
        if not content.strip():
            content = self.extract_text_pypdf2(pdf_path)
        
        if not content.strip():
            logger.warning(f"No text extracted from {pdf_path.name}")
            return False
        
        # Create markdown file
        output_path = self.output_dir / f"{pdf_path.stem}.md"
        
        # Add metadata header
        header = f"""# {pdf_path.stem}

> **Source**: {pdf_path.name}
> **Converted**: {Path(pdf_path).stat().st_mtime}
> **Type**: SEC College Football Document

---

"""
        
        # Write to file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(header + content)
        
        logger.info(f"Created {output_path.name}")
        return True
    
    def convert_all_pdfs(self) -> int:
        """Convert all PDFs in the input directory"""
        pdf_files = list(self.input_dir.glob("*.pdf"))
        
        if not pdf_files:
            logger.warning(f"No PDF files found in {self.input_dir}")
            return 0
        
        logger.info(f"Found {len(pdf_files)} PDF files")
        
        converted = 0
        for pdf_path in pdf_files:
            if self.convert_pdf_to_markdown(pdf_path):
                converted += 1
        
        logger.info(f"Successfully converted {converted}/{len(pdf_files)} PDFs")
        return converted
    
    def create_index_file(self):
        """Create an index file listing all converted documents"""
        markdown_files = list(self.output_dir.glob("*.md"))
        
        if not markdown_files:
            return
        
        index_content = """# SEC College Football Documents Index

This directory contains markdown versions of SEC College Football PDF documents, 
optimized for reading by Cursor AI and other code editors.

## Available Documents

"""
        
        for md_file in sorted(markdown_files):
            if md_file.name != "INDEX.md":
                # Get first few lines as preview
                with open(md_file, 'r', encoding='utf-8') as f:
                    lines = f.readlines()[:5]
                    preview = ' '.join(lines[4:5]).strip()[:100] + "..."
                
                index_content += f"- [{md_file.stem}](./{md_file.name}) - {preview}\n"
        
        index_content += """

## Usage

These markdown files can be:
- Directly read by Cursor AI for context
- Searched using standard text search
- Imported into documentation systems
- Used as reference material for the fantasy football app

## Original PDFs

Original PDF files are stored in the parent directory.
"""
        
        index_path = self.output_dir / "INDEX.md"
        with open(index_path, 'w', encoding='utf-8') as f:
            f.write(index_content)
        
        logger.info("Created INDEX.md")


def main():
    parser = argparse.ArgumentParser(description='Convert SEC College Football PDFs to Markdown')
    parser.add_argument(
        '--input', '-i',
        default='SEC_College_Football',
        help='Input directory containing PDF files'
    )
    parser.add_argument(
        '--output', '-o',
        default='SEC_College_Football/markdown',
        help='Output directory for markdown files'
    )
    parser.add_argument(
        '--watch', '-w',
        action='store_true',
        help='Watch directory for new PDFs'
    )
    
    args = parser.parse_args()
    
    # Convert relative paths to absolute
    if not os.path.isabs(args.input):
        args.input = os.path.abspath(args.input)
    if not os.path.isabs(args.output):
        args.output = os.path.abspath(args.output)
    
    # Check if input directory exists
    if not os.path.exists(args.input):
        logger.error(f"Input directory not found: {args.input}")
        sys.exit(1)
    
    # Create converter and run
    converter = PDFToMarkdownConverter(args.input, args.output)
    converted = converter.convert_all_pdfs()
    
    if converted > 0:
        converter.create_index_file()
        print(f"\n✅ Successfully converted {converted} PDFs")
        print(f"📁 Markdown files saved to: {args.output}")
        print(f"📚 Open INDEX.md for document overview")
    
    # Watch mode
    if args.watch:
        print("\n👁️ Watching for new PDFs... (Press Ctrl+C to stop)")
        try:
            import time
            processed = set(Path(args.input).glob("*.pdf"))
            
            while True:
                time.sleep(5)
                current = set(Path(args.input).glob("*.pdf"))
                new_files = current - processed
                
                if new_files:
                    print(f"\n📄 New PDF detected: {new_files}")
                    for pdf_path in new_files:
                        if converter.convert_pdf_to_markdown(pdf_path):
                            processed.add(pdf_path)
                    converter.create_index_file()
                    
        except KeyboardInterrupt:
            print("\n\n👋 Stopped watching")


if __name__ == "__main__":
    main()