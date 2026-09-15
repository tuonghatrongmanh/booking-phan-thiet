"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CoinShopModal from "@/components/coin-shop/CoinShopModal";
import type { CoinsEarnedDetail } from "@/lib/coin-fx";

type FlyingCoin = { id: number; x: number; y: number; targetX: number; targetY: number; phase: "start" | "flying" };

// Hien so xu cua nguoi dung o header (giua co flag va avatar). Nghe 2 su kien tren
// window: "coins-earned" (choi game thang xu - co hieu ung dong xu BAY tu vi tri
// nguon toi day) va "coins-changed" (doi thuong tru xu - chi can cap nhat so, khong
// can hieu ung bay). Dung window.CustomEvent vi Header khong nam trong 1 layout dung
// chung voi cac trang game/doi thuong nen khong the dung React Context xuyen trang.
export default function HeaderCoinBadge({ initialCoins, avatar, name }: { initialCoins: number; avatar: string; name: string }) {
  const [coins, setCoins] = useState(initialCoins);
  const [bump, setBump] = useState(false);
  const [flying, setFlying] = useState<FlyingCoin[]>([]);
  const badgeRef = useRef<HTMLButtonElement>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const idRef = useRef(0);

  useEffect(() => {
    function triggerBump() {
      setBump(true);
      setTimeout(() => setBump(false), 450);
    }

    function onEarned(e: Event) {
      const { newBalance, sourceRect } = (e as CustomEvent<CoinsEarnedDetail>).detail;
      const badgeRect = badgeRef.current?.getBoundingClientRect();

      if (!sourceRect || !badgeRect) {
        setCoins(newBalance);
        triggerBump();
        return;
      }

      const id = idRef.current++;
      const startX = sourceRect.x + sourceRect.width / 2;
      const startY = sourceRect.y + sourceRect.height / 2;
      const targetX = badgeRect.x + badgeRect.width / 2;
      const targetY = badgeRect.y + badgeRect.height / 2;

      setFlying((f) => [...f, { id, x: startX, y: startY, targetX, targetY, phase: "start" }]);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFlying((f) => f.map((c) => (c.id === id ? { ...c, phase: "flying" } : c)));
        });
      });

      setTimeout(() => {
        setFlying((f) => f.filter((c) => c.id !== id));
        setCoins(newBalance);
        triggerBump();
      }, 750);
    }

    function onChanged(e: Event) {
      const { newBalance } = (e as CustomEvent<{ newBalance: number }>).detail;
      setCoins(newBalance);
    }

    window.addEventListener("coins-earned", onEarned);
    window.addEventListener("coins-changed", onChanged);
    return () => {
      window.removeEventListener("coins-earned", onEarned);
      window.removeEventListener("coins-changed", onChanged);
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setShopOpen(true)}
        ref={badgeRef}
        aria-label="Xu của bạn"
        className="flex items-center gap-1 sm:gap-1.5 bg-white/10 hover:bg-white/20 transition rounded-lg px-2 sm:px-2.5 py-1.5 text-white text-xs sm:text-sm font-bold shrink-0"
      >
        <i className="fa-solid fa-coins text-amber-300" aria-hidden="true" />
        <span className={bump ? "inline-block animate-coin-bump" : "inline-block"}>{coins.toLocaleString("vi-VN")}</span>
      </button>

      <CoinShopModal
        open={shopOpen}
        onClose={() => setShopOpen(false)}
        avatar={avatar}
        name={name}
        coins={coins}
        isLoggedIn
      />

      {typeof document !== "undefined" &&
        createPortal(
          <>
            {flying.map((c) => (
              <i
                key={c.id}
                aria-hidden="true"
                className="fa-solid fa-circle-dollar-to-slot fixed z-[999] pointer-events-none text-amber-400 text-xl transition-all duration-700 ease-in"
                style={{
                  left: (c.phase === "flying" ? c.targetX : c.x) - 10,
                  top: (c.phase === "flying" ? c.targetY : c.y) - 10,
                  opacity: c.phase === "flying" ? 0.2 : 1,
                  transform: c.phase === "flying" ? "scale(0.4)" : "scale(1)",
                }}
              />
            ))}
          </>,
          document.body
        )}
    </>
  );
}
