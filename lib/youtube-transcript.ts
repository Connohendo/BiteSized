import {
  YoutubeTranscript,
  YoutubeTranscriptError,
  YoutubeTranscriptDisabledError,
  YoutubeTranscriptNotAvailableError,
  YoutubeTranscriptVideoUnavailableError,
  YoutubeTranscriptTooManyRequestError,
  YoutubeTranscriptNotAvailableLanguageError,
  YoutubeTranscriptEmptyError,
} from "@danielxceron/youtube-transcript";

const MAX_TRANSCRIPT_LENGTH = 80_000;

function toUserMessage(e: unknown): string {
  if (e instanceof YoutubeTranscriptDisabledError) {
    return "This video has captions disabled.";
  }
  if (e instanceof YoutubeTranscriptNotAvailableError) {
    return "No transcript is available for this video.";
  }
  if (e instanceof YoutubeTranscriptVideoUnavailableError) {
    return "This video is unavailable or private.";
  }
  if (e instanceof YoutubeTranscriptTooManyRequestError) {
    return "Too many requests; try again in a few minutes.";
  }
  if (e instanceof YoutubeTranscriptNotAvailableLanguageError) {
    return "Transcript is not available in the requested language.";
  }
  if (e instanceof YoutubeTranscriptEmptyError) {
    return "This video has no captions or the transcript could not be retrieved. Try a video with subtitles (including auto-generated) enabled.";
  }
  if (e instanceof YoutubeTranscriptError && e.message) {
    return e.message;
  }
  if (e instanceof Error) {
    return e.message;
  }
  return "Failed to get YouTube transcript.";
}

export async function getTranscriptText(videoUrlOrId: string): Promise<string> {
  if (!videoUrlOrId?.trim()) {
    throw new Error("Please provide a YouTube video URL or video ID.");
  }

  let items;
  try {
    items = await YoutubeTranscript.fetchTranscript(videoUrlOrId.trim());
  } catch (e) {
    throw new Error(toUserMessage(e));
  }

  const text = items
    .map((item) => item.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    throw new Error(
      "This video has no captions or the transcript could not be retrieved. Try a video with subtitles (including auto-generated) enabled."
    );
  }

  return text.length > MAX_TRANSCRIPT_LENGTH
    ? text.slice(0, MAX_TRANSCRIPT_LENGTH)
    : text;
}
