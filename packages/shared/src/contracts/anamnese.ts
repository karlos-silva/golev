import type { EligibilityReason } from '../domain/anamnese';

export interface AnamneseResponse {
  /** id do registro salvo, ou null quando inelegível (não persistido). */
  id: string | null;
  eligible: boolean;
  imc: number;
  reasons: EligibilityReason[];
}
