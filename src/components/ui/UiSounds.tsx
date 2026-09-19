"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { armNotificationSound, playNavigateTick, playSuccessChime, playThanksVoice } from "@/lib/notification-sound";
import { SUCCESS_EVENT } from "@/lib/success-sound";

// Âm thanh phản hồi thao tác: "tách" nhẹ khi chuyển trang, "ting" + lời cảm ơn khi hoàn tất việc quan trọng.
// Mọi tiếng đều theo công tắc Âm thanh trong Cài đặt của khách. Trình duyệt chỉ cho phát tiếng sau lần
// chạm đầu tiên vào trang nên trước đó im lặng.
export default function UiSounds() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    armNotificationSound();
    function onSuccess(e: Event) {
      const voice = Boolean((e as CustomEvent<{ voice?: boolean }>).detail?.voice);
      playSuccessChime();
      if (voice) setTimeout(playThanksVoice, 650);
    }
    window.addEventListener(SUCCESS_EVENT, onSuccess);
    return () => window.removeEventListener(SUCCESS_EVENT, onSuccess);
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!pathname.startsWith("/admin")) playNavigateTick();
  }, [pathname]);

  return null;
}
