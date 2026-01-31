from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.core.config import settings
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
import io

router = APIRouter()

# Hetzner Object Storage S3 endpoint (fsn1 = Falkenstein datacenter)
S3_ENDPOINT = "https://fsn1.your-objectstorage.com"
S3_BUCKET = "sprache-hackathon-audio"
S3_AUDIO_PREFIX = "audio"


def get_s3_client():
    """Create S3 client for Hetzner Object Storage."""
    return boto3.client(
        's3',
        endpoint_url=S3_ENDPOINT,
        aws_access_key_id=settings.S3_ACCESS_KEY,
        aws_secret_access_key=settings.S3_SECRET_KEY,
        config=Config(signature_version='s3v4')
    )


@router.get("/{filename}")
async def get_audio(filename: str):
    """Proxy audio files from Hetzner storage using S3 protocol."""
    if not settings.S3_ACCESS_KEY or not settings.S3_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Storage credentials not configured")

    # Validate filename to prevent path traversal
    if ".." in filename or "/" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    import unicodedata

    # Strategies to try: Original, NFC, NFD
    filenames_to_try = [filename]
    nfc = unicodedata.normalize('NFC', filename)
    if nfc not in filenames_to_try:
        filenames_to_try.append(nfc)
    nfd = unicodedata.normalize('NFD', filename)
    if nfd not in filenames_to_try:
        filenames_to_try.append(nfd)

    s3_client = get_s3_client()
    
    last_error = None
    
    for fname in filenames_to_try:
        s3_key = f"{S3_AUDIO_PREFIX}/{fname}"
        try:
            response = s3_client.get_object(Bucket=S3_BUCKET, Key=s3_key)

            content = response['Body'].read()
            content_type = response.get('ContentType', 'audio/mpeg')

            return StreamingResponse(
                io.BytesIO(content),
                media_type=content_type,
                headers={
                    "Cache-Control": "public, max-age=86400",
                    "Accept-Ranges": "bytes"
                }
            )
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == 'NoSuchKey':
                last_error = e
                continue # Try next normalization
            elif error_code in ('AccessDenied', 'InvalidAccessKeyId', 'SignatureDoesNotMatch'):
                raise HTTPException(status_code=500, detail="Storage authentication failed")
            else:
                raise HTTPException(status_code=500, detail=f"Failed to fetch audio: {error_code}")
        except Exception as e:
             raise HTTPException(status_code=500, detail=f"Failed to connect to storage: {str(e)}")

    # If we exhausted all tries and found nothing
    if last_error:
        raise HTTPException(status_code=404, detail="Audio file not found (tried normalizations)")
    raise HTTPException(status_code=404, detail="Audio file not found")
