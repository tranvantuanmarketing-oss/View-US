import { NextRequest, NextResponse } from "next/server";
import { authenticateApi } from "@/lib/auth";
import { repository } from "@/lib/repository";
import groupData from "@/data/groups.json";

export async function GET(req: NextRequest) {
  const auth = await authenticateApi();
  if (auth.errorResponse) return auth.errorResponse;

  const templates = await repository.templates.list();
  return NextResponse.json({
    success: true,
    data: templates,
    groups: groupData,
  });
}
