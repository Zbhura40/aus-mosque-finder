#!/usr/bin/env python3
"""
Combine Holland Park Mosque screenshots into a single preview image
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Directory containing the screenshots
image_dir = "/Users/zubairbhura/Work/findmymosque/mosque-photos"

# Load images
images = {
    "Main Page": Image.open(os.path.join(image_dir, "holland-park-main.png")),
    "Donations": Image.open(os.path.join(image_dir, "holland-park-donate.png")),
    "Events": Image.open(os.path.join(image_dir, "holland-park-events.png")),
    "Partnerships": Image.open(os.path.join(image_dir, "holland-park-partnerships.png"))
}

# Set target width for each image in the grid
target_width = 1200
padding = 40
label_height = 80

# Resize images to same width, maintaining aspect ratio
resized_images = {}
for name, img in images.items():
    aspect_ratio = img.height / img.width
    new_height = int(target_width * aspect_ratio)
    resized_images[name] = img.resize((target_width, new_height), Image.Resampling.LANCZOS)

# Calculate total dimensions for 2x2 grid
total_width = (target_width * 2) + (padding * 3)
# For height, we'll use the average height of top and bottom rows
top_height = max(resized_images["Main Page"].height, resized_images["Donations"].height)
bottom_height = max(resized_images["Events"].height, resized_images["Partnerships"].height)
total_height = top_height + bottom_height + (padding * 3) + (label_height * 5)  # 4 labels + title

# Create new image with white background
preview = Image.new('RGB', (total_width, total_height), 'white')
draw = ImageDraw.Draw(preview)

# Try to use a nice font, fallback to default
try:
    title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 60)
    label_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 40)
except:
    title_font = ImageFont.load_default()
    label_font = ImageFont.load_default()

# Add main title
title = "Holland Park Mosque - Featured Landing Pages Preview"
title_bbox = draw.textbbox((0, 0), title, font=title_font)
title_width = title_bbox[2] - title_bbox[0]
title_x = (total_width - title_width) // 2
draw.text((title_x, padding), title, fill='#1e40af', font=title_font)

# Starting Y position after title
current_y = padding + label_height + padding

# Position images in 2x2 grid with labels
positions = [
    ("Main Page", padding, current_y),
    ("Donations", target_width + (padding * 2), current_y),
    ("Events", padding, current_y + top_height + label_height + padding),
    ("Partnerships", target_width + (padding * 2), current_y + top_height + label_height + padding)
]

for name, x, y in positions:
    # Draw label
    label_bbox = draw.textbbox((0, 0), name, font=label_font)
    label_width = label_bbox[2] - label_bbox[0]
    label_x = x + (target_width - label_width) // 2
    draw.text((label_x, y), name, fill='#059669', font=label_font)

    # Paste image
    img = resized_images[name]
    # Center image horizontally if it's narrower than target_width
    img_x = x + (target_width - img.width) // 2
    preview.paste(img, (img_x, y + label_height))

# Save as JPG
output_path = os.path.join(image_dir, "holland-park-mosque-preview.jpg")
preview.save(output_path, 'JPEG', quality=95, optimize=True)

print(f"✅ Preview image created successfully!")
print(f"📁 Saved to: {output_path}")
print(f"📐 Dimensions: {total_width}x{total_height}")
