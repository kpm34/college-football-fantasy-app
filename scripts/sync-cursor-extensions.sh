#!/bin/bash

# Script to help sync VS Code extensions to Cursor
# Run this to see which extensions you have in VS Code that might be missing in Cursor

echo "📦 VS Code Extensions List:"
echo "=========================="
code --list-extensions 2>/dev/null | sort

echo ""
echo "🔄 To install these in Cursor, run:"
echo "===================================="
echo "code --list-extensions | xargs -I {} cursor --install-extension {}"

echo ""
echo "📺 Recommended Media Viewer Extensions:"
echo "======================================="
echo "cursor --install-extension cesiumgs.gltf-vscode     # 3D model viewer (.glb, .gltf)"
echo "cursor --install-extension slevesque.vscode-3dviewer # Alternative 3D viewer"
echo "cursor --install-extension kisstkondoros.vscode-gutter-preview # Image preview"
echo "cursor --install-extension jock.svg                  # SVG viewer"

echo ""
echo "✅ To verify installed extensions in Cursor:"
echo "============================================="
echo "cursor --list-extensions"