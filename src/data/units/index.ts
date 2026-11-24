import type { UnitDetail } from '../../types/grammar';
import { GROUP_1_UNITS } from './group1';
import { GROUP_2_UNITS } from './group2';
import { GROUP_3_UNITS } from './group3';
import { GROUP_4_UNITS } from './group4';

export const DEEP_UNITS: UnitDetail[] = [
  ...GROUP_1_UNITS,
  ...GROUP_2_UNITS,
  ...GROUP_3_UNITS,
  ...GROUP_4_UNITS,
];

const UNIT_DETAIL_MAP = new Map<number, UnitDetail>(
  DEEP_UNITS.map((unit) => [unit.unitId, unit]),
);

const EXERCISE_MAP = new Map(
  DEEP_UNITS.flatMap((unit) => unit.exercises.map((ex) => [ex.id, ex] as const)),
);

export function getUnitDetail(unitId: number): UnitDetail | undefined {
  return UNIT_DETAIL_MAP.get(unitId);
}

export function getExerciseById(exerciseId: string) {
  return EXERCISE_MAP.get(exerciseId);
}
