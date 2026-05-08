import prisma from "@/lib/prisma";

export function normalizeTeamSize(participantType: string, teamSize: number | null | undefined) {
  if (participantType !== "TEAM") {
    return 1;
  }

  return Math.max(teamSize || 2, 2);
}

export async function repairLegacyTeamEvents() {
  await prisma.event.updateMany({
    where: {
      participantType: "TEAM",
      teamSize: { lt: 2 },
    },
    data: {
      teamSize: 2,
    },
  });
}
