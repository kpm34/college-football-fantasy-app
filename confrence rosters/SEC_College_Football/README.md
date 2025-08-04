# SEC College Football PDF Documentation

This directory contains SEC College Football PDF documents and their markdown conversions for use with Cursor AI.

## 📁 Directory Structure

```
SEC_College_Football/
├── README.md           # This file
├── *.pdf              # Your PDF documents
└── markdown/          # Converted markdown files
    ├── INDEX.md       # Document index
    └── *.md          # Individual document conversions
```

## 🚀 Quick Start

### Convert PDFs to Markdown

Run the conversion script from the project root:

```bash
./convert_pdfs.sh
```

This will:
1. Check for PDF files in this directory
2. Convert them to markdown format
3. Save markdown files in the `markdown/` subdirectory
4. Create an INDEX.md with all documents listed

### Manual Conversion

You can also run the Python script directly:

```bash
python3 src/scripts/pdf_to_markdown.py --input SEC_College_Football --output SEC_College_Football/markdown
```

### Watch Mode

To automatically convert new PDFs as they're added:

```bash
python3 src/scripts/pdf_to_markdown.py --input SEC_College_Football --output SEC_College_Football/markdown --watch
```

## 📖 Using with Cursor AI

Once your PDFs are converted to markdown:

1. **Open in Cursor**: Navigate to `SEC_College_Football/markdown/` in Cursor
2. **Use as Context**: Cursor can now read and understand the content
3. **Search**: Use Cursor's search to find specific information
4. **Reference**: Ask Cursor questions about the documents

### Example Cursor Prompts

- "What are the eligibility rules mentioned in the SEC documents?"
- "Summarize the player statistics from the SEC files"
- "Find information about conference championships"
- "Extract team rosters from the documentation"

## 📋 Features

The converter handles:
- ✅ Text extraction from PDFs
- ✅ Table preservation in markdown format
- ✅ Multi-page document support
- ✅ Automatic index generation
- ✅ Metadata preservation

## 🛠️ Requirements

The converter requires these Python packages (automatically installed):
- PyPDF2 - Basic PDF text extraction
- pdfplumber - Advanced extraction with table support
- pillow - Image processing (for future OCR support)

## 📝 Adding New PDFs

Simply drop new PDF files into this directory and run:

```bash
./convert_pdfs.sh
```

The converter will process only new files and update the index.

## 🔍 Troubleshooting

### No Text Extracted
Some PDFs may be scanned images. OCR support is planned for future updates.

### Formatting Issues
Tables and complex layouts may not convert perfectly. Check the markdown output and adjust as needed.

### Permission Errors
Ensure the script has read permissions:
```bash
chmod +x convert_pdfs.sh
```

## 📊 Document Types

This directory is intended for:
- SEC team rosters
- Player statistics
- Conference rules and regulations
- Game schedules
- Historical data
- Scouting reports
- Draft analysis

## 🤝 Integration with Fantasy App

The converted markdown files can be used to:
- Populate player databases
- Verify eligibility rules
- Import team information
- Generate draft recommendations
- Analyze historical performance

## 📧 Support

For issues with PDF conversion, check:
1. PDF file is not corrupted
2. File has proper read permissions
3. Python dependencies are installed
4. Sufficient disk space for conversions

---

*Last updated: PDF to Markdown converter v1.0*