// Si no tienes zustand instalado: npm install zustand
import { create } from "zustand";

export type DentistEmergencyState = {
  isAvailableForEmergency: boolean;
  setIsAvailableForEmergency: (v: boolean) => void;
};

export const useDentistEmergencyState = create<DentistEmergencyState>((set) => ({
  isAvailableForEmergency: false,
  setIsAvailableForEmergency: (v: boolean) => set(() => ({ isAvailableForEmergency: v })),
})); 