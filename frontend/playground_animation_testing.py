#!/usr/bin/env python3
"""
Playground Animation Testing Script
==================================

This script helps test and experiment with anime.js animations for the College Football Fantasy App.
It provides various animation presets and allows for real-time parameter adjustment.

Usage:
    python playground_animation_testing.py [animation_type] [parameters]

Examples:
    python playground_animation_testing.py hero_title
    python playground_animation_testing.py button_effects --duration 2000
    python playground_animation_testing.py card_entrance --stagger 300
"""

import json
import argparse
import webbrowser
import time
import os
from typing import Dict, Any, List
from dataclasses import dataclass
from pathlib import Path

@dataclass
class AnimationPreset:
    """Animation preset configuration"""
    name: str
    description: str
    targets: str
    properties: Dict[str, Any]
    duration: int = 1000
    easing: str = 'easeInOutQuad'
    delay: int = 0
    stagger: int = 0
    loop: bool = False
    direction: str = 'normal'

class AnimationTester:
    """Main animation testing class"""
    
    def __init__(self):
        self.presets = self._load_animation_presets()
        self.current_animations = []
        
    def _load_animation_presets(self) -> Dict[str, AnimationPreset]:
        """Load predefined animation presets"""
        return {
            # Hero Section Animations
            'hero_title': AnimationPreset(
                name="Hero Title Entrance",
                description="Elastic bounce-in effect for main title",
                targets="#hero-title",
                properties={
                    'opacity': [0, 1],
                    'translateY': [50, 0],
                    'scale': [0.8, 1]
                },
                duration=1500,
                easing='easeOutElastic(1, 0.5)',
                delay=200
            ),
            
            'football_spin': AnimationPreset(
                name="Football Spin",
                description="Rotating football with scaling",
                targets="#football-animation .football-element",
                properties={
                    'rotate': [0, 360],
                    'scale': [1, 1.2, 1],
                    'translateY': [0, -30, 0]
                },
                duration=2000,
                easing='easeInOutQuad',
                direction='alternate',
                loop=True
            ),
            
            'stadium_float': AnimationPreset(
                name="Stadium Float",
                description="Gentle floating stadium animation",
                targets="#stadium-animation .stadium-element",
                properties={
                    'scale': [1, 1.1],
                    'translateY': [0, -10]
                },
                duration=3000,
                easing='easeInOutSine',
                direction='alternate',
                loop=True
            ),
            
            # Button Animations
            'chrome_button': AnimationPreset(
                name="Chrome Button Effect",
                description="Scale and rotation for chrome buttons",
                targets="#chrome-btn",
                properties={
                    'scale': [1, 1.1, 1],
                    'rotate': [0, 5, -5, 0]
                },
                duration=1000,
                easing='easeInOutQuad'
            ),
            
            'glass_button': AnimationPreset(
                name="Glass Button Effect",
                description="Background color transition for glass buttons",
                targets="#glass-btn",
                properties={
                    'backgroundColor': ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)'],
                    'scale': [1, 1.05, 1]
                },
                duration=1500,
                easing='easeInOutQuad'
            ),
            
            'pulse_effect': AnimationPreset(
                name="Pulse Effect",
                description="Continuous pulsing animation",
                targets="#pulse-element",
                properties={
                    'scale': [1, 1.5, 1],
                    'opacity': [1, 0.5, 1]
                },
                duration=2000,
                easing='easeInOutQuad',
                loop=True
            ),
            
            # Card Animations
            'card_entrance': AnimationPreset(
                name="Card Entrance",
                description="Staggered card entrance with elastic easing",
                targets="#card-1, #card-2, #card-3",
                properties={
                    'translateY': [50, 0],
                    'opacity': [0, 1],
                    'scale': [0.8, 1]
                },
                duration=1000,
                easing='easeOutElastic(1, 0.5)',
                stagger=200
            ),
            
            # Text Animations
            'typing_effect': AnimationPreset(
                name="Typing Effect",
                description="Character-by-character typing animation",
                targets="#typing-text",
                properties={
                    'innerHTML': [0, "COLLEGE FOOTBALL FANTASY"]
                },
                duration=2000,
                easing='easeInOutQuad'
            ),
            
            'character_animation': AnimationPreset(
                name="Character Animation",
                description="Individual letter animations with rotation",
                targets="#character-text .char",
                properties={
                    'translateY': [50, 0],
                    'opacity': [0, 1],
                    'rotate': [180, 0]
                },
                duration=1500,
                easing='easeOutElastic(1, 0.5)',
                stagger=100
            ),
            
            # Advanced Animations
            'morph_shape': AnimationPreset(
                name="Morph Shape",
                description="Shape transformation animation",
                targets="#morph-shape",
                properties={
                    'borderRadius': ['8px', '50%', '0px', '50% 0% 50% 0%'],
                    'scale': [1, 1.2, 1],
                    'rotate': [0, 180, 360]
                },
                duration=2000,
                easing='easeInOutQuad'
            ),
            
            'particle_burst': AnimationPreset(
                name="Particle Burst",
                description="Dynamic particle generation effect",
                targets=".particle",
                properties={
                    'translateX': [-50, 50],
                    'translateY': [-50, 50],
                    'scale': [0, 1, 0],
                    'opacity': [0, 1, 0]
                },
                duration=2000,
                easing='easeOutQuad'
            )
        }
    
    def list_animations(self):
        """List all available animation presets"""
        print("\n🎨 Available Animation Presets:")
        print("=" * 50)
        
        categories = {
            "Hero Section": ['hero_title', 'football_spin', 'stadium_float'],
            "Button Effects": ['chrome_button', 'glass_button', 'pulse_effect'],
            "Card Animations": ['card_entrance'],
            "Text Effects": ['typing_effect', 'character_animation'],
            "Advanced": ['morph_shape', 'particle_burst']
        }
        
        for category, animations in categories.items():
            print(f"\n📁 {category}:")
            for anim_name in animations:
                preset = self.presets[anim_name]
                print(f"  • {anim_name}: {preset.description}")
    
    def show_animation_details(self, animation_name: str):
        """Show detailed information about a specific animation"""
        if animation_name not in self.presets:
            print(f"❌ Animation '{animation_name}' not found!")
            return
        
        preset = self.presets[animation_name]
        print(f"\n🎯 Animation Details: {preset.name}")
        print("=" * 50)
        print(f"Description: {preset.description}")
        print(f"Targets: {preset.targets}")
        print(f"Duration: {preset.duration}ms")
        print(f"Easing: {preset.easing}")
        print(f"Delay: {preset.delay}ms")
        print(f"Stagger: {preset.stagger}ms")
        print(f"Loop: {preset.loop}")
        print(f"Direction: {preset.direction}")
        print(f"Properties: {json.dumps(preset.properties, indent=2)}")
    
    def generate_animation_code(self, animation_name: str, custom_params: Dict[str, Any] = None) -> str:
        """Generate JavaScript code for an animation"""
        if animation_name not in self.presets:
            return f"// Animation '{animation_name}' not found!"
        
        preset = self.presets[animation_name]
        
        # Merge custom parameters
        params = {
            'targets': preset.targets,
            'duration': preset.duration,
            'easing': preset.easing,
            'delay': preset.delay,
            'loop': preset.loop,
            'direction': preset.direction,
            **preset.properties
        }
        
        if custom_params:
            params.update(custom_params)
        
        if preset.stagger > 0:
            params['delay'] = f"anime.stagger({preset.stagger})"
        
        # Generate the code
        code_lines = [
            f"// {preset.name}",
            f"anime({{",
        ]
        
        for key, value in params.items():
            if isinstance(value, str) and not value.startswith('anime.'):
                code_lines.append(f"    {key}: '{value}',")
            else:
                code_lines.append(f"    {key}: {value},")
        
        code_lines.append("});")
        
        return '\n'.join(code_lines)
    
    def create_test_page(self, animations: List[str], output_file: str = "test_animations.html"):
        """Create a test page with specified animations"""
        html_template = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Animation Test Page</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"></script>
    <style>
        .chrome-text {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .glass-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .football-element {
            width: 60px;
            height: 40px;
            background: linear-gradient(45deg, #8B4513, #A0522D);
            border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
        }
        .stadium-element {
            width: 100px;
            height: 60px;
            background: linear-gradient(135deg, #4A5568, #2D3748);
            border-radius: 50% 50% 0 0;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white min-h-screen p-8">
    <div class="max-w-4xl mx-auto space-y-8">
        <h1 class="text-4xl font-bold chrome-text text-center">Animation Test Page</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Hero Elements -->
            <div class="glass-card p-6 rounded-xl">
                <h2 class="text-2xl font-bold mb-4">Hero Elements</h2>
                <div id="hero-title" class="text-3xl font-bold chrome-text mb-4 opacity-0">COLLEGE FOOTBALL FANTASY</div>
                <div id="football-animation" class="flex justify-center mb-4">
                    <div class="football-element"></div>
                </div>
                <div id="stadium-animation" class="flex justify-center">
                    <div class="stadium-element"></div>
                </div>
            </div>
            
            <!-- Buttons -->
            <div class="glass-card p-6 rounded-xl">
                <h2 class="text-2xl font-bold mb-4">Buttons</h2>
                <button id="chrome-btn" class="bg-gradient-to-r from-gray-200 to-white px-6 py-3 rounded-lg text-gray-800 font-medium mb-4">
                    Chrome Button
                </button>
                <button id="glass-btn" class="glass-card px-6 py-3 rounded-lg text-white font-medium mb-4">
                    Glass Button
                </button>
                <div id="pulse-element" class="w-16 h-16 bg-blue-500 rounded-full"></div>
            </div>
        </div>
        
        <!-- Cards -->
        <div class="glass-card p-6 rounded-xl">
            <h2 class="text-2xl font-bold mb-4">Cards</h2>
            <div class="grid grid-cols-3 gap-4">
                <div id="card-1" class="glass-card p-4 rounded-lg text-center">
                    <div class="text-4xl mb-2">🏈</div>
                    <h3 class="font-bold">Card 1</h3>
                </div>
                <div id="card-2" class="glass-card p-4 rounded-lg text-center">
                    <div class="text-4xl mb-2">🏆</div>
                    <h3 class="font-bold">Card 2</h3>
                </div>
                <div id="card-3" class="glass-card p-4 rounded-lg text-center">
                    <div class="text-4xl mb-2">📊</div>
                    <h3 class="font-bold">Card 3</h3>
                </div>
            </div>
        </div>
        
        <!-- Text Elements -->
        <div class="glass-card p-6 rounded-xl">
            <h2 class="text-2xl font-bold mb-4">Text Elements</h2>
            <div id="typing-text" class="text-2xl font-bold chrome-text h-8 mb-4"></div>
            <div id="character-text" class="text-2xl font-bold chrome-text">
                <span class="char">C</span><span class="char">O</span><span class="char">L</span><span class="char">L</span><span class="char">E</span><span class="char">G</span><span class="char">E</span>
            </div>
        </div>
        
        <!-- Advanced Elements -->
        <div class="glass-card p-6 rounded-xl">
            <h2 class="text-2xl font-bold mb-4">Advanced Elements</h2>
            <div id="morph-shape" class="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mx-auto mb-4"></div>
            <div id="particle-container" class="w-32 h-32 border border-white/20 rounded-lg mx-auto relative"></div>
        </div>
    </div>
    
    <script>
        // Animation code will be inserted here
        {animation_code}
        
        // Auto-start animations after page load
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                // Auto-start some animations
                if (typeof anime !== 'undefined') {
                    console.log('Starting animations...');
                }
            }, 1000);
        });
    </script>
</body>
</html>
"""
        
        # Generate animation code
        animation_code = []
        for anim_name in animations:
            if anim_name in self.presets:
                code = self.generate_animation_code(anim_name)
                animation_code.append(code)
        
        # Create the HTML file
        html_content = html_template.format(animation_code='\n\n        '.join(animation_code))
        
        with open(output_file, 'w') as f:
            f.write(html_content)
        
        print(f"✅ Test page created: {output_file}")
        return output_file
    
    def run_interactive_mode(self):
        """Run interactive mode for testing animations"""
        print("\n🎮 Interactive Animation Testing Mode")
        print("=" * 50)
        
        while True:
            print("\nOptions:")
            print("1. List all animations")
            print("2. Show animation details")
            print("3. Generate animation code")
            print("4. Create test page")
            print("5. Open animation playground")
            print("6. Exit")
            
            choice = input("\nEnter your choice (1-6): ").strip()
            
            if choice == '1':
                self.list_animations()
            
            elif choice == '2':
                anim_name = input("Enter animation name: ").strip()
                self.show_animation_details(anim_name)
            
            elif choice == '3':
                anim_name = input("Enter animation name: ").strip()
                code = self.generate_animation_code(anim_name)
                print(f"\nGenerated Code:\n{code}")
            
            elif choice == '4':
                print("Available animations:")
                self.list_animations()
                anim_names = input("Enter animation names (comma-separated): ").strip().split(',')
                anim_names = [name.strip() for name in anim_names]
                output_file = input("Enter output filename (default: test_animations.html): ").strip()
                if not output_file:
                    output_file = "test_animations.html"
                self.create_test_page(anim_names, output_file)
            
            elif choice == '5':
                print("Opening animation playground...")
                webbrowser.open('https://college-football-fantasy-app.vercel.app/animation-playground')
            
            elif choice == '6':
                print("Goodbye! 👋")
                break
            
            else:
                print("Invalid choice. Please try again.")

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Animation Testing Tool for College Football Fantasy App')
    parser.add_argument('action', nargs='?', choices=['list', 'details', 'code', 'test', 'interactive'], 
                       help='Action to perform')
    parser.add_argument('animation', nargs='?', help='Animation name')
    parser.add_argument('--duration', type=int, help='Custom duration in milliseconds')
    parser.add_argument('--easing', help='Custom easing function')
    parser.add_argument('--stagger', type=int, help='Custom stagger delay in milliseconds')
    parser.add_argument('--output', default='test_animations.html', help='Output filename for test page')
    
    args = parser.parse_args()
    
    tester = AnimationTester()
    
    if args.action == 'list':
        tester.list_animations()
    
    elif args.action == 'details':
        if not args.animation:
            print("❌ Please provide an animation name!")
            return
        tester.show_animation_details(args.animation)
    
    elif args.action == 'code':
        if not args.animation:
            print("❌ Please provide an animation name!")
            return
        
        custom_params = {}
        if args.duration:
            custom_params['duration'] = args.duration
        if args.easing:
            custom_params['easing'] = args.easing
        if args.stagger:
            custom_params['stagger'] = args.stagger
        
        code = tester.generate_animation_code(args.animation, custom_params)
        print(f"\nGenerated Code for '{args.animation}':")
        print("=" * 50)
        print(code)
    
    elif args.action == 'test':
        if not args.animation:
            print("❌ Please provide an animation name!")
            return
        
        output_file = tester.create_test_page([args.animation], args.output)
        print(f"\n🎉 Test page created: {output_file}")
        print("Open it in your browser to see the animation!")
    
    elif args.action == 'interactive':
        tester.run_interactive_mode()
    
    else:
        # Default: show help and run interactive mode
        print("🎨 Animation Testing Tool for College Football Fantasy App")
        print("=" * 60)
        parser.print_help()
        print("\n" + "=" * 60)
        tester.run_interactive_mode()

if __name__ == "__main__":
    main() 