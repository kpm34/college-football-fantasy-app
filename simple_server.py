#!/usr/bin/env python3
"""
Simple Python Server for College Football Fantasy App
Serves the frontend and provides basic API endpoints
"""

import http.server
import socketserver
import json
import os
import urllib.parse
from datetime import datetime
from http import HTTPStatus

# Configuration
PORT = 8001
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
    },
    {
        "id": "2",
        "homeTeam": "Michigan",
        "awayTeam": "Ohio State",
        "homePoints": 30,
        "awayPoints": 24,
        "status": "final",
        "week": 12,
        "seasonType": "regular",
        "startDate": "2024-11-30T15:30:00Z",
        "homeConference": "Big Ten",
        "awayConference": "Big Ten"
    },
    {
        "id": "3",
        "homeTeam": "Clemson",
        "awayTeam": "Florida State",
        "homePoints": 28,
        "awayPoints": 35,
        "status": "in_progress",
        "week": 12,
        "seasonType": "regular",
        "startDate": "2024-11-30T20:00:00Z",
        "homeConference": "ACC",
        "awayConference": "ACC"
    }
]

MOCK_RANKINGS = [
    {"rank": 1, "school": "Michigan", "conference": "Big Ten", "points": 1500},
    {"rank": 2, "school": "Alabama", "conference": "SEC", "points": 1450},
    {"rank": 3, "school": "Ohio State", "conference": "Big Ten", "points": 1400},
    {"rank": 4, "school": "Florida State", "conference": "ACC", "points": 1350},
    {"rank": 5, "school": "Georgia", "conference": "SEC", "points": 1300}
]

MOCK_TEAMS = [
    {"id": "1", "school": "Alabama", "conference": "SEC", "color": "#9F1C20"},
    {"id": "2", "school": "Michigan", "conference": "Big Ten", "color": "#00274C"},
    {"id": "3", "school": "Ohio State", "conference": "Big Ten", "color": "#BB0000"},
    {"id": "4", "school": "Clemson", "conference": "ACC", "color": "#F56600"},
    {"id": "5", "school": "Florida State", "conference": "ACC", "color": "#782F40"}
]

class CollegeFootballHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urllib.parse.urlparse(self.path)
        path = parsed_path.path
        
        # API endpoints
        if path.startswith('/api/'):
            self.handle_api_request(path)
            return
        
        # League pages
        if path.startswith('/league/'):
            self.serve_league_page(path)
            return
        
        # Service worker
        if path == '/service-worker.js':
            self.serve_service_worker()
            return
        
        # Manifest file
        if path == '/manifest.json':
            self.serve_manifest()
            return
        
        # Animation playground
        if path == '/animation-playground':
            self.serve_animation_playground()
            return
        
        # Login page
        if path == '/login':
            self.serve_login_page()
            return
        
        # Chrome football viewer
        if path == '/chrome-football-viewer.html':
            self.serve_chrome_football_viewer()
            return
        
        # Serve static files
        self.serve_static_file(path)
    
    def handle_api_request(self, path):
        """Handle API requests"""
        self.send_response(HTTPStatus.OK)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
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
    
    def serve_league_page(self, path):
        """Serve league pages"""
        # Map league routes to HTML files with organized URL structure
        league_routes = {
            # League Management
            '/league/create': 'start-league.html',
            '/league/start-league': 'start-league.html',  # Add this route
            '/league/join': 'join-league.html',
            '/league/manage': 'manage-league.html',
            
            # Draft System
            '/draft/mock': 'mock-draft.html',
            '/draft/snake': 'snake-draft.html',
            '/draft/auction': 'auction-draft.html',
            '/draft/auction-draft': 'auction-draft.html',  # Alternative route
            
            # League Dashboard
            '/league/dashboard': 'league-dashboard.html',
            '/league/settings': 'league-settings.html',
            
            # Team Management
            '/team/roster': 'team-roster.html',
            '/team/lineup': 'team-lineup.html',
            
            # User Management
            '/user/profile': 'user-profile.html',
            '/user/leagues': 'user-leagues.html'
        }
        
        if path in league_routes:
            file_path = os.path.join(FRONTEND_DIR, 'league', league_routes[path])
        else:
            # Default to create league if route not found
            file_path = os.path.join(FRONTEND_DIR, 'league', 'start-league.html')
        
        try:
            with open(file_path, 'rb') as f:
                content = f.read()
            
            self.send_response(HTTPStatus.OK)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(content)
            
        except FileNotFoundError:
            self.send_error(HTTPStatus.NOT_FOUND, "League page not found")
    
    def serve_service_worker(self):
        """Serve the service worker file"""
        try:
            file_path = os.path.join(FRONTEND_DIR, 'public', 'service-worker.js')
            
            with open(file_path, 'rb') as f:
                content = f.read()
            
            self.send_response(HTTPStatus.OK)
            self.send_header('Content-Type', 'application/javascript')
            self.send_header('Service-Worker-Allowed', '/')
            self.end_headers()
            self.wfile.write(content)
            
        except FileNotFoundError:
            self.send_error(HTTPStatus.NOT_FOUND, "Service worker not found")
    
    def serve_manifest(self):
        """Serve the PWA manifest file"""
        try:
            file_path = os.path.join(FRONTEND_DIR, 'public', 'manifest.json')
            
            with open(file_path, 'rb') as f:
                content = f.read()
            
            self.send_response(HTTPStatus.OK)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(content)
            
        except FileNotFoundError:
            self.send_error(HTTPStatus.NOT_FOUND, "Manifest not found")
    
    def serve_animation_playground(self):
        """Serve the animation playground"""
        try:
            file_path = os.path.join(FRONTEND_DIR, 'animation-playground.html')
            
            with open(file_path, 'rb') as f:
                content = f.read()
            
            self.send_response(HTTPStatus.OK)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(content)
            
        except FileNotFoundError:
            self.send_error(HTTPStatus.NOT_FOUND, "Animation playground not found")
    
    def serve_login_page(self):
        """Serve the login page"""
        try:
            file_path = os.path.join(FRONTEND_DIR, 'login.html')
            with open(file_path, 'rb') as f:
                content = f.read()
            self.send_response(HTTPStatus.OK)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            self.send_error(HTTPStatus.NOT_FOUND, "Login page not found")
    
    def serve_chrome_football_viewer(self):
        """Serve the chrome football viewer"""
        try:
            file_path = os.path.join(FRONTEND_DIR, 'chrome-football-viewer.html')
            with open(file_path, 'rb') as f:
                content = f.read()
            self.send_response(HTTPStatus.OK)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            self.send_error(HTTPStatus.NOT_FOUND, "Chrome football viewer not found")
    
    def serve_static_file(self, path):
        """Serve static files from the frontend directory"""
        # Default to index.html for root path
        if path == '/':
            path = '/index.html'
        
        # Try to serve from frontend directory
        file_path = os.path.join(FRONTEND_DIR, path.lstrip('/'))
        
        # If file doesn't exist in frontend, try to serve from frontend/app
        if not os.path.exists(file_path):
            file_path = os.path.join(FRONTEND_DIR, 'app', path.lstrip('/'))
        
        # If still doesn't exist, try to serve from frontend/public
        if not os.path.exists(file_path):
            file_path = os.path.join(FRONTEND_DIR, 'public', path.lstrip('/'))
        
        try:
            with open(file_path, 'rb') as f:
                content = f.read()
            
            # Determine content type
            content_type = 'text/plain'
            if file_path.endswith('.html'):
                content_type = 'text/html'
            elif file_path.endswith('.css'):
                content_type = 'text/css'
            elif file_path.endswith('.js'):
                content_type = 'application/javascript'
            elif file_path.endswith('.json'):
                content_type = 'application/json'
            elif file_path.endswith('.png'):
                content_type = 'image/png'
            elif file_path.endswith('.jpg') or file_path.endswith('.jpeg'):
                content_type = 'image/jpeg'
            elif file_path.endswith('.svg'):
                content_type = 'image/svg+xml'
            
            self.send_response(HTTPStatus.OK)
            self.send_header('Content-Type', content_type)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(content)
            
        except FileNotFoundError:
            self.send_error(HTTPStatus.NOT_FOUND, "File not found")
        except Exception as e:
            self.send_error(HTTPStatus.INTERNAL_SERVER_ERROR, str(e))
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(HTTPStatus.OK)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def main():
    """Start the server"""
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), CollegeFootballHandler) as httpd:
        print(f"🏈 College Football Fantasy App - Python Server")
        print(f"🌐 Server running at: http://localhost:{PORT}")
        print(f"📊 API Health check: http://localhost:{PORT}/api/health")
        print(f"🎮 Frontend: http://localhost:{PORT}")
        print(f"📁 Serving files from: {FRONTEND_DIR}/")
        print(f"🔄 Press Ctrl+C to stop the server")
        print("=" * 50)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped by user")
            httpd.shutdown()

if __name__ == "__main__":
    main() 