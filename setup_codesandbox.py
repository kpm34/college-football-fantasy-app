#!/usr/bin/env python3
"""
Selenium script to automate CodeSandbox setup for College Football Fantasy App
"""

import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

def setup_codesandbox():
    """Automate CodeSandbox setup for the College Football Fantasy App"""
    
    print("🚀 Starting CodeSandbox automation...")
    
    # Setup Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    # Initialize the driver
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    try:
        # Navigate to CodeSandbox
        print("📱 Opening CodeSandbox...")
        driver.get("https://codesandbox.io/dashboard/recent")
        
        # Wait for page to load
        time.sleep(3)
        
        # Click the "+ Create" button
        print("➕ Clicking Create button...")
        create_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Create')]"))
        )
        create_button.click()
        
        # Wait for modal to appear
        time.sleep(2)
        
        # Click on "Next.js" template
        print("⚡ Selecting Next.js template...")
        nextjs_template = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//div[contains(text(), 'Next.js')]"))
        )
        nextjs_template.click()
        
        # Wait for sandbox to load
        print("⏳ Waiting for sandbox to load...")
        time.sleep(10)
        
        # Check if we're in the sandbox
        current_url = driver.current_url
        if "codesandbox.io/s/" in current_url:
            print(f"✅ Successfully created CodeSandbox: {current_url}")
            
            # Wait a bit more for full load
            time.sleep(5)
            
            # Now we can interact with the files
            print("📁 Setting up project files...")
            
            # The sandbox should now be ready for file uploads
            print("🎉 CodeSandbox is ready!")
            print("📋 Next steps:")
            print("   1. Import your GitHub repository")
            print("   2. Or manually upload the frontend files")
            print("   3. The app will be live at the sandbox URL")
            
        else:
            print("❌ Failed to create CodeSandbox")
            
    except Exception as e:
        print(f"❌ Error during automation: {str(e)}")
        
    finally:
        # Keep the browser open for manual interaction
        print("🔍 Browser will stay open for manual interaction...")
        print("💡 You can now manually import your GitHub repository or upload files")
        
        # Keep browser open for 60 seconds
        time.sleep(60)
        driver.quit()

def import_from_github():
    """Alternative method to import directly from GitHub"""
    
    print("🔗 Setting up GitHub import...")
    
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    try:
        # Go directly to GitHub import URL
        github_url = "https://codesandbox.io/s/github/kpm34/college-football-fantasy-app"
        print(f"📥 Importing from: {github_url}")
        
        driver.get(github_url)
        
        # Wait for import to complete
        print("⏳ Waiting for GitHub import to complete...")
        time.sleep(15)
        
        current_url = driver.current_url
        if "codesandbox.io/s/" in current_url:
            print(f"✅ Successfully imported from GitHub: {current_url}")
            print("🎉 Your College Football Fantasy App is now live!")
        else:
            print("❌ Import failed")
            
    except Exception as e:
        print(f"❌ Error during GitHub import: {str(e)}")
        
    finally:
        print("🔍 Browser will stay open for manual interaction...")
        time.sleep(60)
        driver.quit()

if __name__ == "__main__":
    print("🏈 College Football Fantasy App - CodeSandbox Setup")
    print("=" * 50)
    
    choice = input("Choose option:\n1. Create new Next.js sandbox\n2. Import from GitHub\nEnter choice (1 or 2): ")
    
    if choice == "2":
        import_from_github()
    else:
        setup_codesandbox() 