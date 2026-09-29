import { getAvailableRitualRecommendation } from "@/lib/ritual-recommendation";
import {
  ritualExperienceOptions,
  ritualIntentions,
  type RitualExperienceId,
  type RitualIntentionId,
} from "@/lib/rituals-data";

const intentionIds = new Set<string>(ritualIntentions.map(({ id }) => id));
const experienceIds = new Set<string>(ritualExperienceOptions.map(({ id }) => id));
const responseHeaders = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const intention = params.get("intention");
  const experience = params.get("experience");

  if (
    !intention ||
    !experience ||
    !intentionIds.has(intention) ||
    !experienceIds.has(experience)
  ) {
    return Response.json(
      { error: "Intenção ou experiência inválida." },
      { status: 400, headers: responseHeaders },
    );
  }

  try {
    const result = await getAvailableRitualRecommendation(
      intention as RitualIntentionId,
      experience as RitualExperienceId,
    );

    return Response.json(result, { headers: responseHeaders });
  } catch {
    return Response.json(
      {
        error:
          "Não foi possível consultar peso e estoque agora. Tente novamente em instantes.",
      },
      { status: 503, headers: responseHeaders },
    );
  }
}
