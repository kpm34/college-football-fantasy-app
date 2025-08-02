#!/usr/bin/env python3
"""
Simple Python Server for College Football Fantasy App
Fixed version that properly serves the chrome football viewer
"""

import http.server
import socketserver
import json
import os
import urllib.parse
from datetime import datetime
from http import HTTPStatus

# Configuration
PORT = 8080
FRONTEND_DIR = "frontend"

# Mock data for the API
MOCK_GAMES = [
    {
        "id": "1",
        "homeTeam": "Alabama",
        "awayTeam": "Auburn",
        "homePoints": 24,
        "awayPoints": 21,
        "status": "final",
        "week": 12,
        "seasonType": "regular",
        "startDate": "2024-11-30T19:30:00Z",
        "homeConference": "SEC",
        "awayConference": "SEC"
    }
]

MOCK_RANKINGS = [
    {"rank": 1, "school": "Michigan", "conference": "Big Ten", "points": 1500},
    {"rank": 2, "school": "Alabama", "conference": "SEC", "points": 1450}
]

MOCK_TEAMS = [
    {"id": "1", "school": "Alabama", "conference": "SEC", "color": "#9F1C20"},
    {"id": "2", "school": "Michigan", "conference": "Big Ten", "color": "#00274C"}
]

class SimpleHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urllib.parse.urlparse(self.path)
        path = parsed_path.path
        
        print(f"Request: {path}")
        
        # API endpoints
        if path.startswith('/api/'):
            self.handle_api_request(path)
            return
        
        # Chrome football viewer
        if path == '/chrome-football-viewer.html':
            self.serve_file('chrome-football-viewer.html')
            return
        
        # Default to serving from frontend directory
        self.serve_from_frontend(path)
    
    def handle_api_request(self, path):
        """Handle API requests"""
        self.send_response(HTTPStatus.OK)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        if path == '/api/games':
            response = MOCK_GAMES
        elif path == '/api/rankings':
            response = MOCK_RANKINGS
        elif path == '/api/teams':
            response = MOCK_TEAMS
        elif path == '/api/health':
            response = {
                "status": "ok",
                "timestamp": datetime.now().isoformat(),
                "message": "College Football Fantasy API running on Python server"
            }
        else:
            response = {"error": "Endpoint not found"}
        
        self.wfile.write(json.dumps(response, indent=2).encode())
    
    def serve_file(self, filename):
        """Serve a specific file from frontend directory"""
        try:
            file_path = os.path.join(FRONTEND_DIR, filename)
            with open(file_path, 'rb') as f:
                content = f.read()
            
            # Determine content type
            content_type = 'text/plain'
            if filename.endswith('.html'):
                content_type = 'text/html; charset=utf-8'
            elif filename.endswith('.css'):
                content_type = 'text/css'
            elif filename.endswith('.js'):
                content_type = 'application/javascript'
            elif filename.endswith('.json'):
                content_type = 'application/json'
            elif filename.endswith('.png'):
                content_type = 'image/png'
            elif filename.endswith('.jpg') or filename.endswith('.jpeg'):
                content_type = 'image/jpeg'
            elif filename.endswith('.svg'):
                content_type = 'image/svg+xml'
            
            self.send_response(HTTPStatus.OK)
            self.send_header('Content-Type', content_type)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(content)
            
        except FileNotFoundError:
            self.send_error(HTTPStatus.NOT_FOUND, f"File {filename} not found")
        except Exception as e:
            self.send_error(HTTPStatus.INTERNAL_SERVER_ERROR, str(e))
    
    def serve_from_frontend(self, path):
        """Serve files from frontend directory"""
        # Default to index.html for root path
        if path == '/':
            path = '/index.html'
        
        # Remove leading slash
        filename = path.lstrip('/')
        
        # Try to serve the file
        self.serve_file(filename)

def main():
    """Start the server"""
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), SimpleHandler) as httpd:
        print(f"🏈 College Football Fantasy App - Python Server")
        print(f"🌐 Server running at: http://localhost:{PORT}")
        print(f"📊 API Health check: http://localhost:{PORT}/api/health")
        print(f"🎮 Frontend: http://localhost:{PORT}")
        print(f"🔧 Chrome Football Viewer: http://localhost:{PORT}/chrome-football-viewer.html")
        print(f"📁 Serving files from: {FRONTEND_DIR}/")
        print(f"🔄 Press Ctrl+C to stop the server")
        print("=" * 60)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped by user")
            httpd.shutdown()

if __name__ == "__main__":
    main() 