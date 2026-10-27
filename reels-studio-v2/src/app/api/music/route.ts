import { NextRequest, NextResponse } from "next/server";
import { authenticateApi } from "@/lib/auth";
import { repository } from "@/lib/repository";
import { Mood } from "@/lib/types";

export async function GET(req: NextRequest) {
  const auth = await authenticateApi();
  if (auth.errorResponse) return auth.errorResponse;

  const tracks = await repository.music.list();
  const moodFilter = req.nextUrl.searchParams.get("mood");

  const filtered = moodFilter
    ? tracks.filter((t) => t.mood === moodFilter)
    : tracks;

  return NextResponse.json({
    success: true,
    data: filtered,
  });
}

export async function POST(req: NextRequest) {
  const auth = await authenticateApi();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const { title, mood, file_path, duration_sec } = body;

    if (!title || !file_path) {
      return NextResponse.json(
        { success: false, error: "Tiêu đề và đường dẫn file là bắt buộc." },
        { status: 400 }
      );
    }

    const validMood: Mood = ["tuoi-sang", "nhe-nhang", "tram"].includes(mood)
      ? mood
      : "tram";

    const newTrack = await repository.music.create({
      title: title.trim(),
      mood: validMood,
      file_path: file_path.trim(),
      duration_sec: Number(duration_sec) || 30,
    });

    return NextResponse.json({
      success: true,
      message: "Đã thêm track mới vào kho nhạc chung.",
      data: newTrack,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi thêm bài nhạc." },
      { status: 500 }
    );
  }
}
