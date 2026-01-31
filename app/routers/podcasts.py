"""Podcast API router for German language learning podcasts."""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from fastapi.responses import StreamingResponse
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
import logging
import httpx

from app.db.mongodb import get_database
from app.core.config import settings
from app.models.podcast import (
    PodcastCreate,
    PodcastResponse,
    PodcastListItem,
    VoiceOption,
    PODCAST_CONTEXTS,
    CEFRLevel,
)
from app.services.podcast_generator import podcast_generator

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/contexts", response_model=List[str])
async def get_podcast_contexts():
    """Get available context options for podcast generation."""
    return PODCAST_CONTEXTS


@router.get("/levels", response_model=List[str])
async def get_cefr_levels():
    """Get available CEFR levels."""
    return [level.value for level in CEFRLevel]


@router.get("/voices", response_model=List[VoiceOption])
async def get_available_voices():
    """Fetch available voices from ElevenLabs."""
    try:
        voices = podcast_generator.get_available_voices()
        return [
            VoiceOption(
                voice_id=v["voice_id"],
                name=v["name"],
                preview_url=v.get("preview_url"),
                labels=v.get("labels")
            )
            for v in voices
        ]
    except Exception as e:
        logger.error(f"Failed to fetch voices: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch voices from ElevenLabs")


@router.get("/", response_model=List[PodcastListItem])
async def list_podcasts(
    request: Request,
    level: Optional[str] = None,
    context: Optional[str] = None,
    limit: int = 50,
    skip: int = 0
):
    """List all podcasts with optional filtering."""
    db = await get_database()
    collection = db.podcasts

    query = {}
    if level:
        query["cefr_level"] = level
    if context:
        query["context"] = context

    cursor = collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
    podcasts = await cursor.to_list(length=limit)

    return [
        PodcastListItem(
            id=str(p["_id"]),
            title=p["title"],
            cefr_level=p["cefr_level"],
            context=p["context"],
            duration=p.get("duration"),
            audio_url=str(request.url_for("get_podcast_audio", podcast_id=str(p["_id"]))),
            created_at=p["created_at"]
        )
        for p in podcasts
    ]


@router.get("/{podcast_id}", response_model=PodcastResponse)
async def get_podcast(podcast_id: str, request: Request):
    """Get a specific podcast by ID."""
    db = await get_database()
    collection = db.podcasts

    try:
        podcast = await collection.find_one({"_id": ObjectId(podcast_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid podcast ID format")

    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")

    return PodcastResponse(
        id=str(podcast["_id"]),
        title=podcast["title"],
        words=podcast["words"],
        cefr_level=podcast["cefr_level"],
        context=podcast["context"],
        audio_url=str(request.url_for("get_podcast_audio", podcast_id=str(podcast["_id"]))),
        duration=podcast.get("duration"),
        transcript=podcast["transcript"],
        quiz=podcast["quiz"],
        created_at=podcast["created_at"]
    )


@router.post("/", response_model=PodcastResponse)
async def create_podcast(podcast_data: PodcastCreate):
    """Create a new podcast (generates script, audio, and quiz)."""
    db = await get_database()
    collection = db.podcasts

    # Validate context
    if podcast_data.context not in PODCAST_CONTEXTS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid context. Must be one of: {', '.join(PODCAST_CONTEXTS)}"
        )

    try:
        # Generate the podcast
        logger.info(f"Starting podcast generation: {podcast_data.words}")
        result = await podcast_generator.generate_podcast(
            words=podcast_data.words,
            cefr_level=podcast_data.cefr_level.value,
            context=podcast_data.context,
            voice_ids=podcast_data.voice_ids
        )

        # Save to database
        podcast_doc = {
            "title": result.title,
            "words": podcast_data.words,
            "cefr_level": podcast_data.cefr_level.value,
            "context": podcast_data.context,
            "voice_ids": podcast_data.voice_ids,
            "audio_url": result.audio_url,
            "audio_filename": result.audio_filename,
            "duration": result.duration,
            "transcript": result.transcript,
            "quiz": result.quiz,
            "created_at": datetime.utcnow(),
            "created_by": None  # Can be set if user auth is added
        }

        insert_result = await collection.insert_one(podcast_doc)
        podcast_id = str(insert_result.inserted_id)

        logger.info(f"Podcast created successfully: {podcast_id}")

        return PodcastResponse(
            id=podcast_id,
            title=result.title,
            words=podcast_data.words,
            cefr_level=podcast_data.cefr_level.value,
            context=podcast_data.context,
            audio_url=result.audio_url,
            duration=result.duration,
            transcript=result.transcript,
            quiz=result.quiz,
            created_at=podcast_doc["created_at"]
        )

    except Exception as e:
        logger.error(f"Podcast generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Podcast generation failed: {str(e)}")


@router.delete("/{podcast_id}")
async def delete_podcast(podcast_id: str):
    """Delete a podcast by ID."""
    db = await get_database()
    collection = db.podcasts

    try:
        result = await collection.delete_one({"_id": ObjectId(podcast_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid podcast ID format")

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Podcast not found")

    return {"message": "Podcast deleted successfully"}


@router.get("/{podcast_id}/audio")
async def get_podcast_audio(podcast_id: str):
    """Stream podcast audio through backend proxy to avoid CORS issues."""
    db = await get_database()
    collection = db.podcasts

    try:
        podcast = await collection.find_one({"_id": ObjectId(podcast_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid podcast ID format")

    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")

    # Get the filename from the storage URL or field
    audio_filename = podcast.get("audio_filename")
    if not audio_filename:
        # Fallback: extract from URL if filename not stored
        # URL format: https://.../hackathon/podcast/podcast_2026.mp3
        audio_url = podcast.get("audio_url", "")
        if "podcast_" in audio_url:
            audio_filename = audio_url.split("/")[-1]
        else:
            raise HTTPException(status_code=404, detail="Audio file not found")

    # Construct Hetzner URL
    # Using the same path as in generator: "hackathon/podcast/"
    hetzner_url = f"https://{settings.STORAGE_ADDRESS}/hackathon/podcast/{audio_filename}"

    async def iter_audio():
        async with httpx.AsyncClient() as client:
            try:
                async with client.stream(
                    "GET",
                    hetzner_url,
                    auth=(settings.STORAGE_USER, settings.STORAGE_PASSWORD)
                ) as response:
                    if response.status_code != 200:
                        logger.error(f"Upstream audio fetch failed: {response.status_code}")
                        raise HTTPException(status_code=502, detail="Failed to fetch audio from storage")
                    
                    async for chunk in response.aiter_bytes():
                        yield chunk
            except Exception as e:
                logger.error(f"Stream error: {e}")
                raise

    return StreamingResponse(iter_audio(), media_type="audio/mpeg")
