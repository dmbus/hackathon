import os
import json
from pathlib import Path

# Load environment variables manually
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    with open(env_path, "r") as f:
        for line in f:
            if line.strip() and not line.startswith("#"):
                key, _, value = line.partition("=")
                if key and value:
                    os.environ[key.strip()] = value.strip().strip("'").strip('"')

# Get storage address from environment
STORAGE_ADDRESS = os.environ.get("STORAGE_ADDRESS")
if not STORAGE_ADDRESS:
    print("Error: STORAGE_ADDRESS not found in .env")
    exit(1)

# Base URL for audio files
# Assuming standard Hetzner Storage Box HTTP access: https://<address>/hackathon/audio/
AUDIO_BASE_URL = f"https://{STORAGE_ADDRESS}/hackathon/audio"

def add_audio_links():
    # Define the words directory
    # Assuming script is run from project root or scripts/ folder, verify path
    base_dir = Path(__file__).resolve().parent.parent
    words_dir = base_dir / "words"

    if not words_dir.exists():
        print(f"Error: Words directory not found at {words_dir}")
        exit(1)

    affected_count = 0
    
    # Iterate through all subdirectories in words/
    for category_dir in words_dir.iterdir():
        if category_dir.is_dir():
            print(f"Processing category: {category_dir.name}")
            
            # Iterate through all json files in the category directory
            for json_file in category_dir.glob("*.json"):
                try:
                    with open(json_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    word = data.get("word")
                    if not word:
                        print(f"Skipping {json_file.name}: 'word' field missing")
                        continue

                    # Construct audio URLs
                    audio_links = {
                        "male": f"{AUDIO_BASE_URL}/{word}_m.mp3",
                        "female": f"{AUDIO_BASE_URL}/{word}_f.mp3"
                    }

                    # Update JSON data
                    data["audio"] = audio_links

                    # Write back to file
                    with open(json_file, 'w', encoding='utf-8') as f:
                        json.dump(data, f, ensure_ascii=False, indent=4)
                    
                    affected_count += 1
                    
                except Exception as e:
                    print(f"Error processing {json_file.name}: {e}")

    print(f"Finished. Updated {affected_count} files.")

if __name__ == "__main__":
    add_audio_links()
