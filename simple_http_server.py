import http.server
import socketserver
import os

# Configuration
PORT = 9000
FRONTEND_DIR = "frontend"

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Print the request for debugging
        print(f"Request: {self.path}")
        
        # Handle specific routes
        if self.path == '/':
            self.path = '/frontend/index.html'
        elif self.path == '/chrome-football-viewer.html':
            self.path = '/frontend/chrome-football-viewer.html'
        elif self.path == '/api/health':
            self.send_health_response()
            return
        
        # Serve the file
        try:
            return http.server.SimpleHTTPRequestHandler.do_GET(self)
        except Exception as e:
            print(f"Error serving {self.path}: {e}")
            self.send_error(404, f"File not found: {self.path}")
    
    def send_health_response(self):
        """Send a simple health check response"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        response = {
            "status": "ok",
            "message": "Server is running",
            "chrome_football_viewer": f"http://localhost:{PORT}/chrome-football-viewer.html"
        }
        self.wfile.write(str(response).encode())

def main():
    # Change to the project root directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        print(f"🚀 Simple HTTP Server")
        print(f"🌐 Server running at: http://localhost:{PORT}")
        print(f"🔧 Chrome Football Viewer: http://localhost:{PORT}/chrome-football-viewer.html")
        print(f"🎮 Main App: http://localhost:{PORT}/")
        print(f"📊 Health Check: http://localhost:{PORT}/api/health")
        print("=" * 60)
        print("Press Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped by user")
            httpd.shutdown()

if __name__ == "__main__":
    main() 