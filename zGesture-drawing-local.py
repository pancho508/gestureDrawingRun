#!/usr/bin/env python3
"""
Simple gesture drawing timer script for local image folders.
Displays images from a folder with an automatic timer between each one.

Usage:
    python3 gesture-drawing-local.py [folder_path] [interval_seconds] [shuffle]

Example:
    python3 gesture-drawing-local.py ~/Pictures/gesture_refs 120 true
"""

import sys
import os
import tkinter as tk
from tkinter import filedialog
from PIL import Image, ImageTk
import random
from pathlib import Path


class GestureDrawer:
    def __init__(self, folder_path=None, interval=120, shuffle=True):
        self.interval = interval
        self.remaining = interval
        self.paused = False
        self.timer_active = False
        
        # Get images
        if folder_path is None:
            self.folder = self._select_folder()
        else:
            self.folder = Path(folder_path)
        
        if not self.folder.exists():
            print(f"Folder not found: {folder_path}")
            sys.exit(1)
        
        self.images = self._load_images()
        if not self.images:
            print(f"No images found in {self.folder}")
            sys.exit(1)
        
        if shuffle:
            random.shuffle(self.images)
        
        self.current_index = 0
        
        # Setup UI
        self.root = tk.Tk()
        self.root.title("Gesture Drawing - Local")
        self.root.geometry("1024x768")
        
        # Main image label
        self.image_label = tk.Label(self.root, bg="black")
        self.image_label.pack(fill=tk.BOTH, expand=True)
        
        # Control frame
        control_frame = tk.Frame(self.root, bg="#1a1a1a", height=80)
        control_frame.pack(fill=tk.X, side=tk.BOTTOM)
        
        # Timer display (top-right corner)
        self.timer_label = tk.Label(
            self.root, 
            text=str(self.interval),
            font=("Courier", 48, "bold"),
            fg="#3b82f6",
            bg="#000000",
            padx=10,
            pady=10
        )
        self.timer_label.place(x=880, y=10, anchor="ne")
        
        # Image counter (top-left)
        self.counter_label = tk.Label(
            self.root,
            text=f"1 / {len(self.images)}",
            font=("Arial", 12),
            fg="white",
            bg="#000000",
            padx=10,
            pady=5
        )
        self.counter_label.place(x=10, y=10)
        
        # Control buttons in frame
        button_frame = tk.Frame(control_frame, bg="#1a1a1a")
        button_frame.pack(pady=15)
        
        tk.Button(
            button_frame,
            text="Next ⏭ (→)",
            command=self.next_image,
            font=("Arial", 11),
            padx=15,
            pady=8,
            bg="#3b82f6",
            fg="white"
        ).pack(side=tk.LEFT, padx=10)
        
        tk.Button(
            button_frame,
            text="Pause/Resume (Space)",
            command=self.toggle_pause,
            font=("Arial", 11),
            padx=15,
            pady=8,
            bg="#8b5cf6",
            fg="white"
        ).pack(side=tk.LEFT, padx=10)
        
        tk.Button(
            button_frame,
            text="Quit (Q)",
            command=self.root.quit,
            font=("Arial", 11),
            padx=15,
            pady=8,
            bg="#ef4444",
            fg="white"
        ).pack(side=tk.LEFT, padx=10)
        
        # Keyboard shortcuts
        self.root.bind("<Right>", lambda e: self.next_image())
        self.root.bind("<space>", lambda e: self.toggle_pause())
        self.root.bind("<q>", lambda e: self.root.quit())
        self.root.bind("<Escape>", lambda e: self.root.quit())
        
        # Display first image and start timer
        self.show_image()
        self.start_timer()
        
    def _select_folder(self):
        """Let user select folder if not provided"""
        root = tk.Tk()
        root.withdraw()
        folder = filedialog.askdirectory(title="Select folder with images")
        root.destroy()
        return Path(folder) if folder else None
    
    def _load_images(self):
        """Load image files from folder"""
        supported = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}
        images = [
            f for f in self.folder.iterdir()
            if f.suffix.lower() in supported and f.is_file()
        ]
        return sorted(images)
    
    def show_image(self):
        """Display current image"""
        img_path = self.images[self.current_index]
        
        try:
            img = Image.open(img_path)
            
            # Get window dimensions
            window_width = self.root.winfo_width()
            window_height = self.root.winfo_height() - 80
            
            if window_width < 1:
                window_width = 1024
            if window_height < 1:
                window_height = 688
            
            # Expand to fill window while maintaining aspect ratio (no cropping)
            img_width, img_height = img.size
            img_aspect = img_width / img_height
            window_aspect = window_width / window_height
            
            if img_aspect > window_aspect:
                # Image is wider: fit to window width
                new_width = window_width
                new_height = int(window_width / img_aspect)
            else:
                # Image is taller: fit to window height
                new_height = window_height
                new_width = int(window_height * img_aspect)
            
            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            photo = ImageTk.PhotoImage(img)
            self.image_label.config(image=photo)
            self.image_label.image = photo
            
            # Update counter
            self.counter_label.config(
                text=f"{self.current_index + 1} / {len(self.images)}\n{img_path.name}"
            )
            
        except Exception as e:
            self.image_label.config(text=f"Error loading image: {e}", fg="red")
    
    def start_timer(self):
        """Start the countdown timer"""
        self.remaining = self.interval
        self.timer_active = True
        self.paused = False
        self.update_timer()
    
    def update_timer(self):
        """Update timer every 100ms"""
        if self.timer_active and not self.paused:
            self.remaining -= 0.1
            
            if self.remaining <= 0:
                self.next_image()
                return
        
        self.timer_label.config(text=str(int(self.remaining)))
        self.root.after(100, self.update_timer)
    
    def next_image(self):
        """Move to next image and restart timer"""
        self.current_index = (self.current_index + 1) % len(self.images)
        self.show_image()
        self.start_timer()
    
    def toggle_pause(self):
        """Pause/resume timer"""
        self.paused = not self.paused
        if self.paused:
            self.timer_label.config(fg="#fbbf24")  # Amber when paused
        else:
            self.timer_label.config(fg="#3b82f6")  # Blue when running
    
    def run(self):
        """Start the application"""
        self.root.mainloop()


if __name__ == "__main__":
    folder = None
    interval = 120
    shuffle = True
    
    # Parse arguments
    if len(sys.argv) > 1:
        folder = sys.argv[1]
    if len(sys.argv) > 2:
        try:
            interval = int(sys.argv[2])
        except ValueError:
            print(f"Invalid interval: {sys.argv[2]}")
            sys.exit(1)
    if len(sys.argv) > 3:
        shuffle = sys.argv[3].lower() in ('true', '1', 'yes')
    
    app = GestureDrawer(folder, interval, shuffle)
    app.run()
