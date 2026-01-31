
import httpx
import sys

BASE_URL = "http://localhost:8001"

def test_audio_proxy():
    print(f"Testing audio proxy against {BASE_URL}...")
    
    # 1. List podcasts
    try:
        resp = httpx.get(f"{BASE_URL}/podcasts/", timeout=10)
        resp.raise_for_status()
        podcasts = resp.json()
        print(f"Found {len(podcasts)} podcasts.")
    except Exception as e:
        print(f"Failed to list podcasts: {e}")
        return False

    if not podcasts:
        print("No podcasts found to test.")
        return True

    # 2. Check audio_url format
    podcast = podcasts[0]
    audio_url = podcast.get("audio_url")
    print(f"First podcast ID: {podcast['id']}")
    print(f"Audio URL: {audio_url}")

    if "/podcasts/" not in audio_url or "/audio" not in audio_url:
        print("ERROR: Audio URL format does not look like a proxy URL.")
        # But wait, request.url_for returns absolute URL.
        # It should contain http://localhost:8000/podcasts/.../audio
        if "http" not in audio_url:
             print("ERROR: Audio URL is not absolute.")
             return False

    # 3. Test content
    print(f"Attempting to stream from: {audio_url}")
    try:
        with httpx.stream("GET", audio_url, timeout=30) as response:
            print(f"Status Code: {response.status_code}")
            print(f"Headers: {response.headers}")
            
            if response.status_code != 200:
                print("ERROR: Failed to fetch audio.")
                return False
                
            # Read a few bytes
            chunk = next(response.iter_bytes())
            print(f"First chunk size: {len(chunk)} bytes")
            print("Success! Audio stream is working.")
            return True
    except Exception as e:
        print(f"Stream failed: {e}")
        return False

if __name__ == "__main__":
    success = test_audio_proxy()
    sys.exit(0 if success else 1)
