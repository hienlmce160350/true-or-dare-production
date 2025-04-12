import { getStorage, setStorage } from "@/hooks/use-local-storage";
import { generateGuid } from "@/utils/generate-guid";
import { useEffect, useState } from "react";

export function useUserGuid() {
  const [guid, setGuid] = useState<string | null>(null);

  const resetGuid = () => {
    const newGuid = generateGuid();
    if (typeof window !== "undefined") {
      const state = {
        state: {
          playerId: newGuid,
          playerName: "",
        },
      };
      setStorage("player", state);
    }
    setGuid(newGuid);
  };

  useEffect(() => {
    // Chạy chỉ ở client-side
    if (typeof window !== "undefined") {
      // Lấy GUID từ localStorage

      let storedGuid = getStorage("player");

      // Nếu chưa có GUID, generate và lưu
      if (!storedGuid) {
        storedGuid = generateGuid();

        const state = {
          state: {
            playerId: storedGuid,
            playerName: "",
          },
        };
        setStorage("player", state);
      }

      setGuid(storedGuid);
    }
  }, []);

  return { guid, resetGuid };
}
