import type { Pack, RoleRecommendation } from "@/lib/types";

export function getPrimaryLane(pack: Pack): RoleRecommendation | undefined {
  const selectedId = pack.selectedRoleTargetIds[0];
  return pack.roleRecommendations.find((role) => role.id === selectedId) ?? pack.roleRecommendations[0];
}
