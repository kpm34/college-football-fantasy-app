#!/usr/bin/env python3
"""
Quick Python Server for Chrome Football Viewer
"""

import http.server
import socketserver
import os

PORT = 9000

class QuickHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = '/frontend/index.html'
        elif self.path == '/chrome-football-viewer.html':
            self.path = '/frontend/chrome-football-viewer.html'
        
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

def main():
    with socketserver.TCPServer(("", PORT), QuickHandler) as httpd:
        print(f"🚀 Quick Server running at: http://localhost:{PORT}")
        print(f"🔧 Chrome Football Viewer: http://localhost:{PORT}/chrome-football-viewer.html")
        print(f"🎮 Main App: http://localhost:{PORT}/")
        print("=" * 50)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")
            httpd.shutdown()

if __name__ == "__main__":
    main() 