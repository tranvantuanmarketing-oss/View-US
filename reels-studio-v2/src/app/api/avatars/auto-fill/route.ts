import { NextRequest, NextResponse } from "next/server";
import { authenticateApi } from "@/lib/auth";
import { repository } from "@/lib/repository";
import { Gender } from "@/lib/types";
import { normalizeLocale } from "@/lib/locales";

// Native names banks for supported page locales
const NATIVE_NAMES_BY_LOCALE: Record<string, { female: string[]; male: string[] }> = {
  pl: {
    female: ["Anna Kowalska", "Zofia Nowak", "Maria Wiśniewska", "Katarzyna Wójcik", "Agnieszka Zielińska", "Ewa Szymańska", "Magdalena Woźniak", "Joanna Dąbrowska"],
    male: ["Jan Kowalski", "Piotr Nowak", "Tomasz Wiśniewski", "Michał Wójcik", "Andrzej Zieliński", "Paweł Szymański", "Krzysztof Woźniak", "Łukasz Dąbrowski"],
  },
  fr: {
    female: [
      "Camille Laurent", "Élodie Blanc", "Manon Castagne", "Charlotte Martin",
      "Mathilde Rousseau", "Aurélie Dupuis", "Céline Bernard", "Juliette Lefebvre",
      "Sandrine Leroy", "Nathalie Moreau", "Brigitte Lambert", "Monique Girard"
    ],
    male: [
      "Lucas Dubois", "Julien Tardieu", "Étienne Roche", "Antoine Rousseau",
      "Henri Beaumont", "Marc Fontaine", "Noah Lefebvre", "Thomas Mitchell",
      "Franck Meynard", "Richard Ross", "Sébastien Colin", "Philippe Guérin"
    ],
  },
  nl: {
    female: [
      "Anouk van Dijk", "Saskia Bakker", "Fleur Meijer", "Emma de Jong",
      "Lieke Visser", "Sophie Smit", "Lotte de Vries", "Sanne Vos",
      "Maaike Mulder", "Ingrid Bos", "Astrid Hendriks", "Marleen Dekker"
    ],
    male: [
      "Daan de Vries", "Lars van den Berg", "Bram Bakker", "Thijs Meijer",
      "Sem Janssen", "Milan de Boer", "Ruben Visser", "Luuk Smit",
      "Jan van Dijk", "Pieter Vos", "Hendrik Mulder", "Willem Bos"
    ],
  },
  de: {
    female: [
      "Hannah Becker", "Sophie Weber", "Emma Schmidt", "Mia Wagner",
      "Anna Müller", "Lena Fischer", "Julia Schneider", "Laura Hoffmann",
      "Sabine Meyer", "Monika Schulz", "Karin Richter", "Birgit Schwarz"
    ],
    male: [
      "Lukas Becker", "Jonas Weber", "Leon Schmidt", "Finn Wagner",
      "Felix Müller", "Niklas Fischer", "Maximilian Schneider", "Paul Hoffmann",
      "Klaus Meyer", "Wolfgang Schulz", "Dieter Richter", "Helmut Schwarz"
    ],
  },
  en: {
    female: [
      "Charlotte Jade", "Elena Vance", "Victoria Stirling", "Sarah Jenkins",
      "Emily Watson", "Jessica Taylor", "Grace Miller", "Chloe Davis",
      "Margaret Campbell", "Barbara Mitchell", "Dorothy Wilson", "Helen Anderson"
    ],
    male: [
      "Marcus Holt", "Ethan Cross", "James Cooper", "Noah Mitchell",
      "Liam Campbell", "Oliver Bennett", "William Anderson", "Benjamin Foster",
      "Robert Jenkins", "Arthur Watson", "Charles Taylor", "Edward Miller"
    ],
  },
  es: {
    female: [
      "Sofía García", "Lucía Rodríguez", "Valentina González", "Martina Fernández",
      "Camila López", "Isabella Martínez", "Carmen Sánchez", "Elena Romero",
      "Dolores Torres", "Mercedes Navarro", "Pilar Gil", "Teresa Serrano"
    ],
    male: [
      "Mateo García", "Santiago Rodríguez", "Sebastián González", "Alejandro Fernández",
      "Diego López", "Carlos Martínez", "Javier Sánchez", "Manuel Romero",
      "Antonio Torres", "Francisco Navarro", "José Gil", "Fernando Serrano"
    ],
  },
};

export async function POST(req: NextRequest) {
  const auth = await authenticateApi();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const { avatar_ids, locale = "fr" } = body;

    const loc = normalizeLocale(locale || "fr");
    const namesBank = NATIVE_NAMES_BY_LOCALE[loc] || NATIVE_NAMES_BY_LOCALE.fr;

    const allAvatars = await repository.avatars.list();
    const targetAvatars = avatar_ids && Array.isArray(avatar_ids) && avatar_ids.length > 0
      ? allAvatars.filter((a) => avatar_ids.includes(a.id))
      : allAvatars;

    const updatedList = [];
    let fIdx = 0;
    let mIdx = 0;

    for (let i = 0; i < targetAvatars.length; i++) {
      const av = targetAvatars[i];
      // Alternate or preserve gender
      const gender: Gender = av.gender || (i % 2 === 0 ? "nu" : "nam");

      let newName = av.name;
      if (gender === "nu") {
        newName = namesBank.female[fIdx % namesBank.female.length];
        fIdx++;
      } else {
        newName = namesBank.male[mIdx % namesBank.male.length];
        mIdx++;
      }

      // Age brackets: distributed evenly across 20-34, 35-49, 50-64, 65+
      const bucket = i % 4;
      let age_min = 25;
      let age_max = 38;
      if (bucket === 0) {
        age_min = 20;
        age_max = 34;
      } else if (bucket === 1) {
        age_min = 35;
        age_max = 49;
      } else if (bucket === 2) {
        age_min = 50;
        age_max = 64;
      } else {
        age_min = 65;
        age_max = 78;
      }

      const updated = await repository.avatars.update(av.id, {
        name: newName,
        gender,
        age_min,
        age_max,
      });

      if (updated) updatedList.push(updated);
    }

    return NextResponse.json({
      success: true,
      message: `Đã tự động điền tên người kể (bản địa ${loc.toUpperCase()}), giới tính và độ tuổi cho ${updatedList.length} avatar.`,
      data: updatedList,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi tự động điền thông tin avatar." },
      { status: 500 }
    );
  }
}
