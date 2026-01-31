import os
import json
import shutil
from pathlib import Path

def move_processed_words():
    # Define directories
    base_dir = Path(__file__).resolve().parent.parent
    words_dir = base_dir / "words"
    target_dir = base_dir / "upload_words"

    if not words_dir.exists():
        print(f"Error: Words directory not found at {words_dir}")
        exit(1)

    # Create target directory if it doesn't exist
    if not target_dir.exists():
        target_dir.mkdir(parents=True)
        print(f"Created target directory: {target_dir}")

    moved_count = 0
    
    # Iterate through all subdirectories in words/
    # We use list(iterdir()) because we might be modifying the directory structure (though usually moving files out is fine)
    for category_dir in words_dir.iterdir():
        if category_dir.is_dir():
            
            # Create corresponding category dir in target
            target_category_dir = target_dir / category_dir.name
            
            # Iterate through all json files in the category directory
            for json_file in category_dir.glob("*.json"):
                try:
                    with open(json_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    # Check if audio field exists
                    if "audio" in data:
                        # Ensure target subdir exists only if we have files to move there
                        if not target_category_dir.exists():
                            target_category_dir.mkdir(parents=True)

                        destination = target_category_dir / json_file.name
                        shutil.move(str(json_file), str(destination))
                        moved_count += 1
                        # print(f"Moved {json_file.name} -> {destination}")
                    
                except Exception as e:
                    print(f"Error processing {json_file.name}: {e}")

    print(f"Finished. Moved {moved_count} files to {target_dir}")

if __name__ == "__main__":
    move_processed_words()
