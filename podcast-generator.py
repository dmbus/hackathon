#!/usr/bin/env python3
"""German Language Learning Podcast Generator.

Generates podcast scripts, audio, and comprehension quizzes for German learners.
"""

import argparse
import json
import logging
import os
import sys
from datetime import datetime
from io import BytesIO
from pathlib import Path
from typing import List

import paramiko
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
from pydub import AudioSegment
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

# --- DATA STRUCTURES (Pydantic v2) ---


class ScriptLine(BaseModel):
    speaker: str = Field(description="The name of the speaker (e.g., 'Host', 'Guest', 'Person A')")
    text: str = Field(description="The spoken text in German")


class PodcastScript(BaseModel):
    title: str = Field(description="A catchy title for the podcast episode in German")
    dialogue: List[ScriptLine] = Field(description="The list of dialogue lines in order")


class QuizQuestion(BaseModel):
    question: str = Field(description="The question text in German")
    options: List[str] = Field(description="4 possible answers in German")
    correct_answer: str = Field(description="The correct answer from the options")


class Quiz(BaseModel):
    questions: List[QuizQuestion] = Field(description="List of 5 test questions")


# --- CONFIGURATION ---


def load_config() -> tuple[ChatOpenAI, ElevenLabs]:
    """Load environment variables and initialize API clients."""
    load_dotenv()

    openai_key = os.getenv("OPENAI_API_KEY")
    elevenlabs_key = os.getenv("ELEVEN_LABS_KEY") or os.getenv("ELEVENLABS_API_KEY")

    if not openai_key:
        logger.error("OPENAI_API_KEY not found in environment variables")
        sys.exit(1)

    if not elevenlabs_key:
        logger.error("ELEVEN_LABS_KEY not found in environment variables")
        sys.exit(1)

    llm = ChatOpenAI(model="gpt-4o", temperature=0.7, api_key=openai_key)
    client = ElevenLabs(api_key=elevenlabs_key)

    logger.info("API clients initialized successfully")
    return llm, client


# --- 1. GERMAN SCRIPT GENERATION ---


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(Exception),
    before_sleep=lambda retry_state: logger.warning(
        f"Script generation failed, retrying (attempt {retry_state.attempt_number})..."
    ),
)
def generate_script(llm: ChatOpenAI, words: List[str], cefr_level: str, num_persons: int) -> PodcastScript:
    """Generate a German dialogue script using the LLM."""
    parser = PydanticOutputParser(pydantic_object=PodcastScript)

    role_instruction = (
        "ein Monolog von einem einzigen Sprecher"
        if num_persons == 1
        else "ein Dialog zwischen zwei Personen (Gastgeber und Gast)"
    )

    template = """
    Du bist ein Experte für das Sprachenlernen. Erstelle ein Podcast-Skript für einen Deutschlerner auf dem Niveau {cefr_level}.
    Das Skript muss zwingend die folgenden Vokabeln enthalten: {words}.

    Das Format soll {role_instruction} sein.
    Der Inhalt sollte eine realistische, alltägliche Situation widerspiegeln (z. B. im Café, Reiseplanung, Nachrichten).
    Die Sprache muss natürlich klingen, aber dem Niveau {cefr_level} entsprechen.

    WICHTIG: Das gesamte Skript muss auf Deutsch sein.

    {format_instructions}
    """

    prompt = PromptTemplate(
        template=template,
        input_variables=["words", "cefr_level", "role_instruction"],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )

    chain = prompt | llm | parser

    logger.info(f"Generating script (level {cefr_level}) with {num_persons} speaker(s)...")
    result = chain.invoke({
        "words": ", ".join(words),
        "cefr_level": cefr_level,
        "role_instruction": role_instruction,
    })
    logger.info(f"Script generated: '{result.title}'")
    return result


# --- 2. AUDIO GENERATION (Multilingual) ---


def generate_podcast_audio(client: ElevenLabs, script: PodcastScript, output_path: Path) -> bool:
    """Generate audio from the podcast script using ElevenLabs."""
    voice_map = {
        "Gastgeber": "rachel",
        "Gast": "drew",
        "Host": "rachel",
        "Guest": "drew",
        "Person A": "mimi",
        "Person B": "fin",
    }

    default_voices = ["rachel", "drew", "clyde", "mimi"]
    combined_audio = AudioSegment.empty()
    assigned_voices: dict[str, str] = {}

    logger.info("Generating audio (German)...")

    for i, line in enumerate(script.dialogue):
        speaker = line.speaker
        text = line.text

        if speaker not in assigned_voices:
            if speaker in voice_map:
                assigned_voices[speaker] = voice_map[speaker]
            else:
                assigned_voices[speaker] = default_voices[len(assigned_voices) % len(default_voices)]

        voice_id = assigned_voices[speaker]

        try:
            audio_stream = client.generate(
                text=text,
                voice=voice_id,
                model="eleven_multilingual_v2",
            )

            audio_data = b"".join(audio_stream)
            segment = AudioSegment.from_mp3(BytesIO(audio_data))
            combined_audio += segment + AudioSegment.silent(duration=400)

            logger.debug(f"Generated audio for line {i + 1}/{len(script.dialogue)}")

        except Exception as e:
            logger.error(f"Failed to generate audio for line {i + 1}: {e}")
            return False

    combined_audio.export(output_path, format="mp3")
    logger.info(f"Audio saved: {output_path}")
    return True


# --- 3. GERMAN QUIZ GENERATION ---


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(Exception),
    before_sleep=lambda retry_state: logger.warning(
        f"Quiz generation failed, retrying (attempt {retry_state.attempt_number})..."
    ),
)
def generate_quiz(llm: ChatOpenAI, script_content: str) -> Quiz:
    """Generate comprehension quiz questions from the transcript."""
    parser = PydanticOutputParser(pydantic_object=Quiz)

    template = """
    Du bist ein Deutschlehrer. Basierend auf dem folgenden Transkript, erstelle 5 Multiple-Choice-Verständnisfragen.
    Die Fragen und Antworten müssen auf Deutsch sein.

    TRANSKRIPT:
    {script}

    {format_instructions}
    """

    prompt = PromptTemplate(
        template=template,
        input_variables=["script"],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )

    chain = prompt | llm | parser

    logger.info("Generating quiz questions...")
    result = chain.invoke({"script": script_content})
    logger.info(f"Generated {len(result.questions)} quiz questions")
    return result


# --- OUTPUT FUNCTIONS ---


def save_transcript(script: PodcastScript, output_path: Path) -> None:
    """Save the podcast transcript to a text file."""
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(f"# {script.title}\n\n")
        for line in script.dialogue:
            f.write(f"{line.speaker}: {line.text}\n\n")
    logger.info(f"Transcript saved: {output_path}")


def save_quiz(quiz: Quiz, output_path: Path) -> None:
    """Save the quiz to a JSON file."""
    quiz_data = {
        "questions": [
            {
                "question": q.question,
                "options": q.options,
                "correct_answer": q.correct_answer,
            }
            for q in quiz.questions
        ]
    }
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(quiz_data, f, ensure_ascii=False, indent=2)
    logger.info(f"Quiz saved: {output_path}")


def print_transcript(script: PodcastScript) -> str:
    """Print and return the full transcript."""
    print("\n" + "=" * 20 + f" {script.title} " + "=" * 20)
    full_transcript = ""
    for line in script.dialogue:
        line_text = f"{line.speaker}: {line.text}"
        print(line_text)
        full_transcript += line_text + "\n"
    print("=" * 50 + "\n")
    return full_transcript


def print_quiz(quiz: Quiz) -> None:
    """Print the quiz questions to console."""
    print("\n" + "=" * 20 + " QUIZ " + "=" * 20)
    for idx, q in enumerate(quiz.questions, 1):
        print(f"{idx}. {q.question}")
        for opt in q.options:
            print(f"   - {opt}")
        print(f"   [Lösung: {q.correct_answer}]")
        print("-" * 10)


# --- 4. UPLOAD TO HETZNER STORAGE ---


def upload_to_hetzner(local_path: Path, remote_folder: str = "podcast/audio") -> bool:
    """Upload a file to Hetzner Storage Box via SFTP using SSH key authentication."""
    host = os.getenv("STORAGE_ADDRESS")
    user = os.getenv("STORAGE_USER")
    port = int(os.getenv("STORAGE_PORT", "23"))
    ssh_key_path = os.getenv("STORAGE_SSH_KEY", str(Path.home() / ".ssh" / "id_rsa"))

    if not host or not user:
        logger.error("Hetzner storage credentials not found in environment variables")
        logger.error("Required: STORAGE_ADDRESS, STORAGE_USER")
        return False

    transport = None
    sftp = None
    try:
        transport = paramiko.Transport((host, port))

        # Try SSH key authentication
        key_path = Path(ssh_key_path).expanduser()
        if key_path.exists():
            logger.info(f"Using SSH key: {key_path}")
            pkey = paramiko.Ed25519Key.from_private_key_file(str(key_path))
            transport.connect(username=user, pkey=pkey)
        else:
            # Fall back to password if no key found
            password = os.getenv("STORAGE_PASSWORD")
            if not password:
                logger.error(f"SSH key not found at {key_path} and no STORAGE_PASSWORD set")
                return False
            transport.connect(username=user, password=password)

        sftp = paramiko.SFTPClient.from_transport(transport)
        if sftp is None:
            raise RuntimeError("Failed to create SFTP client")

        # Ensure remote directory exists (use relative paths from home dir)
        remote_folder = remote_folder.strip("/")
        remote_parts = remote_folder.split("/")
        current_path = ""
        for part in remote_parts:
            current_path = f"{current_path}/{part}" if current_path else part
            try:
                sftp.stat(current_path)
            except FileNotFoundError:
                logger.info(f"Creating remote directory: {current_path}")
                sftp.mkdir(current_path)

        # Upload file
        remote_path = f"{remote_folder}/{local_path.name}"
        logger.info(f"Uploading {local_path} to {remote_path}...")
        sftp.put(str(local_path), remote_path)

        logger.info(f"Upload complete: {remote_path}")
        return True

    except Exception as e:
        logger.error(f"Upload failed: {e}")
        return False

    finally:
        if sftp:
            sftp.close()
        if transport:
            transport.close()


# --- CLI ---


def parse_args() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Generate German language learning podcasts with quizzes.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --words Hallo Welt Danke
  %(prog)s --words Nachhaltigkeit Umwelt --level B2 --speakers 1
  %(prog)s --words Reise Flugzeug Hotel --output ./my_podcasts
        """,
    )
    parser.add_argument(
        "--words",
        "-w",
        nargs="+",
        required=True,
        help="German vocabulary words to include in the podcast",
    )
    parser.add_argument(
        "--level",
        "-l",
        choices=["A1", "A2", "B1", "B2", "C1", "C2"],
        default="B1",
        help="CEFR language level (default: B1)",
    )
    parser.add_argument(
        "--speakers",
        "-s",
        type=int,
        choices=[1, 2],
        default=2,
        help="Number of speakers: 1 (monologue) or 2 (dialogue) (default: 2)",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=Path,
        default=Path("./output"),
        help="Output directory (default: ./output)",
    )
    parser.add_argument(
        "--skip-audio",
        action="store_true",
        help="Skip audio generation (useful for testing)",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Enable verbose logging",
    )
    parser.add_argument(
        "--upload",
        "-u",
        action="store_true",
        help="Upload audio to Hetzner Storage Box (/podcast/audio/)",
    )
    return parser.parse_args()


# --- MAIN FLOW ---


def main() -> None:
    """Main entry point for the podcast generator."""
    args = parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Create timestamped output directory
    timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
    output_dir = args.output / timestamp
    output_dir.mkdir(parents=True, exist_ok=True)
    logger.info(f"Output directory: {output_dir}")

    # Initialize API clients
    llm, elevenlabs_client = load_config()

    # 1. Generate Script
    try:
        script_obj = generate_script(llm, args.words, args.level, args.speakers)
    except Exception as e:
        logger.error(f"Script generation failed: {e}")
        sys.exit(1)

    # Print and save transcript
    full_transcript = print_transcript(script_obj)
    save_transcript(script_obj, output_dir / "transcript.txt")

    # 2. Generate Audio
    audio_path = output_dir / "podcast.mp3"
    audio_success = False
    if not args.skip_audio:
        audio_success = generate_podcast_audio(
            elevenlabs_client,
            script_obj,
            audio_path,
        )
        if not audio_success:
            logger.warning("Audio generation failed, continuing with quiz...")
    else:
        logger.info("Skipping audio generation (--skip-audio)")

    # 3. Upload to Hetzner (if requested and audio exists)
    if args.upload and audio_success:
        upload_to_hetzner(audio_path, "podcast/audio")
    elif args.upload and not audio_success:
        logger.warning("Skipping upload: no audio file generated")

    # 4. Generate Quiz
    try:
        quiz_obj = generate_quiz(llm, full_transcript)
        print_quiz(quiz_obj)
        save_quiz(quiz_obj, output_dir / "quiz.json")
    except Exception as e:
        logger.error(f"Quiz generation failed: {e}")

    logger.info(f"Done! All outputs saved to: {output_dir}")


if __name__ == "__main__":
    main()
