// components/GuidInitializer.tsx
'use client';

import { useUserGuid } from "@/hook/useUserGuid";

export default function GuidInitializer() {
  useUserGuid(); // Gọi hook để check/set GUID

  return null; // Component này không cần render gì
}