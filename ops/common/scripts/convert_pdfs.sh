#!/bin/bash

# SEC College Football PDF to Markdown Converter
# Makes PDFs readable for Cursor AI

echo "🏈 SEC College Football PDF Converter"
echo "======================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python first."
    exit 1
fi

# Install required packages if needed
echo "📦 Checking dependencies..."
pip3 install -q PyPDF2 pdfplumber pillow 2>/dev/null

# Set directories
PDF_DIR="SEC_College_Football"
MARKDOWN_DIR="SEC_College_Football/markdown"

# Create directories if they don't exist
mkdir -p "$PDF_DIR"
mkdir -p "$MARKDOWN_DIR"

# Check for PDFs
if [ ! -d "$PDF_DIR" ]; then
    echo "❌ Directory $PDF_DIR not found!"
    echo "Please create it and add your PDF files."
    exit 1
fi

PDF_COUNT=$(find "$PDF_DIR" -maxdepth 1 -name "*.pdf" 2>/dev/null | wc -l)

if [ "$PDF_COUNT" -eq 0 ]; then
    echo "⚠️  No PDF files found in $PDF_DIR"
    echo "Add your SEC College Football PDFs to this directory first."
    exit 1
fi

echo "📄 Found $PDF_COUNT PDF files"
echo ""

# Run the converter
echo "🔄 Converting PDFs to Markdown..."
python3 src/scripts/pdf_to_markdown.py --input "$PDF_DIR" --output "$MARKDOWN_DIR"

echo ""
echo "✅ Conversion complete!"
echo "📁 Markdown files are in: $MARKDOWN_DIR"
echo "📚 Open $MARKDOWN_DIR/INDEX.md for overview"
echo ""
echo "💡 Tip: These markdown files can now be read by Cursor AI!"
echo "   Just open the markdown files in Cursor to use them as context."