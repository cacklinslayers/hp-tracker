import { useState, useEffect } from "react";
import { registerServiceWorker } from "./registerServiceWorker";
import { createClient } from "@supabase/supabase-js";
import theme from "./theme";

const SUPABASE_URL = "https://ifktugmhxyfkulefxzpv.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlma3R1Z21oeHlma3VsZWZ4enB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMjM1OTEsImV4cCI6MjA3OTg5OTU5MX0.YbjJe_Y6xZnOjRrYvfHQYimbNaQ-we8jT0kebnA1JPk";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function getOrCreateClientId() {
  try {
    const stored = localStorage.getItem("hp-tracker-client-id");
    if (stored) return stored;

    const id =
      crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    localStorage.setItem("hp-tracker-client-id", id);
    return id;
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}
function SplashScreen() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#BD1A28",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeOutSplash 2s ease forwards",
      }}
    >
      <img
        src="https://cdn.shopify.com/s/files/1/0940/5808/6737/files/Cacklin_Slayer_Logo_ROOD.svg?v=1764691944"
        alt="Splash Logo"
        style={{
          width: 200,
          height: "auto",
          opacity: 0,
          animation: "fadeInSplash 0.8s ease forwards 0.2s",
        }}
      />
    </div>
  );
}
function Banner() {
  return (
    <a
      href="https://www.cacklinslayers.com"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "sticky",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,

        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",

        background: "#BD1A28", // primaire rode kleur
        color: "white",
        textDecoration: "none",
        height: 80,

        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,

        fontFamily: theme.fonts.body,
        padding: 8,
        boxSizing: "border-box",
      }}
    >
      <img
        src="https://cdn.shopify.com/s/files/1/0940/5808/6737/files/Logo_Rood_Vierkant.png?v=1749486365"
        alt="Cacklin' Slayers Logo"
        style={{
          height: 34,
          marginBottom: 4,
          objectFit: "contain",
        }}
      />
      <div style={{ fontSize: 14, fontWeight: 700 }}>
        Want more? Visit www.cacklinslayers.com
      </div>
    </a>
  );
}
export default function App() {
  /* ---------- PWA UPDATE STATE ---------- */
  const [updateReady, setUpdateReady] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    registerServiceWorker((worker) => {
      setWaitingWorker(worker);
      setUpdateReady(true);
    });
  }, []);

  const reloadApp = () => {
    waitingWorker?.postMessage({ type: "SKIP_WAITING" });
    window.location.reload();
  };

  /* ---------- SPLASH ---------- */
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  /* ---------- MAIN STATE ---------- */
  const [page, setPage] = useState("overview");

  const [team, setTeam] = useState(() => {
    const saved = localStorage.getItem("adventurer-team");
    return saved ? JSON.parse(saved) : [];
  });

  const [selected, setSelected] = useState([]);
  const [deathSaveTarget, setDeathSaveTarget] = useState(null);

  const [newName, setNewName] = useState("");
  const [newLevel, setNewLevel] = useState("");
  const [newHP, setNewHP] = useState("");
  const [newAC, setNewAC] = useState("");

  // DM / premium
  const [hasPremium, setHasPremium] = useState(false);
  const [showDMPaywall, setShowDMPaywall] = useState(false);
  const [dungeonCode, setDungeonCode] = useState("");

  // Player dungeon state
  const [clientId] = useState(() => getOrCreateClientId());
  const [isInDungeonAsPlayer, setIsInDungeonAsPlayer] = useState(false);
  const [playerDungeonCode, setPlayerDungeonCode] = useState("");

  /* ---------- SAVE TEAM ---------- */
  useEffect(() => {
    localStorage.setItem("adventurer-team", JSON.stringify(team));
  }, [team]);

  /* ---------- UTILS ---------- */
  const generateDungeonCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let part1 = "";
    let part2 = "";
    for (let i = 0; i < 3; i++) {
      part1 += chars[Math.floor(Math.random() * chars.length)];
      part2 += chars[Math.floor(Math.random() * chars.length)];
    }
    return `${part1}-${part2}`;
  };

  const normalizeCode = (code) => code.replace(/\s+/g, "").toUpperCase();

  /* ---------- ADD ADVENTURER ---------- */
  const addAdventurer = () => {
    if (!newName.trim() || !newLevel || !newHP) return;

    const adv = {
      id: Date.now(),
      name: newName.trim(),
      level: parseInt(newLevel, 10),
      hp: parseInt(newHP, 10),
      maxHp: parseInt(newHP, 10),
      tempHp: 0,
      ac: parseInt(newAC, 10) || 10,
      dead: false,
    };

    setTeam((t) => [...t, adv]);
    setNewName("");
    setNewLevel("");
    setNewHP("");
    setNewAC("");
    setPage("overview");
  };

  /* ---------- DELETE ADVENTURER ---------- */
  const deleteAdventurer = (id) => {
    setTeam((t) => t.filter((p) => p.id !== id));
    setSelected((s) => s.filter((p) => p.id !== id));
    if (deathSaveTarget?.id === id) setDeathSaveTarget(null);
  };

  /* ---------- BATTLE ---------- */
  const startBattleForAdventurer = (id) => {
    const adv = team.find((p) => p.id === id);
    if (!adv || adv.dead) return;
    setSelected([{ ...adv }]);
    setPage("battle");
  };

  const healToFullSelected = () => {
    const ids = selected.map((s) => s.id);
    setTeam((t) =>
      t.map((p) => (ids.includes(p.id) ? { ...p, hp: p.maxHp } : p))
    );
    setSelected((s) => s.map((p) => ({ ...p, hp: p.maxHp })));
  };

  const levelUpSelected = (amount) => {
    const amt = parseInt(amount, 10);
    if (!amt) return;

    const ids = selected.map((s) => s.id);

    setTeam((t) =>
      t.map((p) =>
        ids.includes(p.id)
          ? {
              ...p,
              maxHp: p.maxHp + amt,
              hp: p.hp + amt,
              level: p.level + 1,
            }
          : p
      )
    );

    setSelected((s) =>
      s.map((p) => ({
        ...p,
        maxHp: p.maxHp + amt,
        hp: p.hp + amt,
        level: p.level + 1,
      }))
    );
  };

  const addTempHpSelected = (amount) => {
    const amt = parseInt(amount, 10);
    if (!amt) return;
    setSelected((s) => s.map((p) => ({ ...p, tempHp: amt })));
  };

  const commitBattleChanges = (updatedSelected) => {
    setTeam((t) =>
      t.map((p) => {
        const u = updatedSelected.find((us) => us.id === p.id);
        return u
          ? {
              ...p,
              hp: u.hp,
              maxHp: u.maxHp,
              tempHp: u.tempHp,
              level: u.level,
              ac: u.ac,
            }
          : p;
      })
    );
  };

  /* ---------- DEATH SAVE ---------- */
  useEffect(() => {
    if (selected.length === 1 && selected[0].hp <= 0 && !selected[0].dead) {
      setDeathSaveTarget(selected[0]);
      setPage("death");
    }
  }, [selected]);

  /* ---------- DM MODE ---------- */
  const handleCreateDungeonClick = () => {
    if (!hasPremium) return setShowDMPaywall(true);
    const code = dungeonCode || generateDungeonCode();
    setDungeonCode(code);
    setPage("dmCode");
  };

  const unlockDMModeAndStart = () => {
    const code = generateDungeonCode();
    setHasPremium(true);
    setDungeonCode(code);
    setShowDMPaywall(false);
    setPage("dmCode");
  };

  const endDungeon = () => {
    setDungeonCode("");
    setPage("overview");
  };

  /* ---------- RENDER ---------- */
  return (
    <>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: theme.colors.background,
          position: "relative",
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 18,
            boxSizing: "border-box",
            fontFamily: theme.fonts.body,
          }}
        >
          {showSplash && <SplashScreen />}

          {!showSplash && (
            <>
              {page === "setup" && (
                <SetupPage
                  newName={newName}
                  setNewName={setNewName}
                  newLevel={newLevel}
                  setNewLevel={setNewLevel}
                  newHP={newHP}
                  setNewHP={setNewHP}
                  newAC={newAC}
                  setNewAC={setNewAC}
                  addAdventurer={addAdventurer}
                  team={team}
                  goOverview={() => setPage("overview")}
                />
              )}

              {page === "overview" && (
                <OverviewPage
                  team={team}
                  startBattleForAdventurer={startBattleForAdventurer}
                  deleteAdventurer={deleteAdventurer}
                  goToSetup={() => setPage("setup")}
                  setTeam={setTeam}
                  onCreateDungeon={handleCreateDungeonClick}
                  onJoinDungeon={() => setPage("joinDungeon")}
                  playerDungeonCode={playerDungeonCode}
                />
              )}

              {page === "battle" && (
                <BattlePage
                  selected={selected}
                  setSelected={setSelected}
                  goOverview={() => {
                    commitBattleChanges(selected);
                    setSelected([]);
                    setPage("overview");
                  }}
                  healToFullSelected={healToFullSelected}
                  levelUpSelected={levelUpSelected}
                  addTempHpSelected={addTempHpSelected}
                />
              )}

              {page === "death" && deathSaveTarget && (
                <DeathSavePage
                  target={deathSaveTarget}
                  saveToTeam={(updates) =>
                    setTeam((t) =>
                      t.map((p) =>
                        p.id === deathSaveTarget.id ? { ...p, ...updates } : p
                      )
                    )
                  }
                  backToBattle={(revived) => {
                    setSelected([
                      {
                        ...deathSaveTarget,
                        hp: revived ? 1 : 0,
                        dead: !revived,
                      },
                    ]);
                    setDeathSaveTarget(null);
                    setPage(revived ? "battle" : "overview");
                  }}
                />
              )}

              {page === "dmCode" && dungeonCode && (
                <DMDungeonCodePage
                  dungeonCode={dungeonCode}
                  goToDashboard={() => setPage("dmDashboard")}
                  endDungeon={endDungeon}
                  goOverview={() => setPage("overview")}
                />
              )}

              {page === "dmDashboard" && dungeonCode && (
                <DMDashboardPage
                  dungeonCode={dungeonCode}
                  goBack={() => setPage("overview")}
                />
              )}

              {page === "joinDungeon" && (
                <JoinDungeonPage
                  team={team}
                  clientId={clientId}
                  setPlayerDungeonCode={setPlayerDungeonCode}
                  setIsInDungeonAsPlayer={setIsInDungeonAsPlayer}
                  goBack={() => setPage("overview")}
                />
              )}

              {showDMPaywall && (
                <DMPaywallModal
                  close={() => setShowDMPaywall(false)}
                  unlock={unlockDMModeAndStart}
                />
              )}
            </>
          )}
        </div>

        {/* ALWAYS ON SCREEN */}
        <Banner />

        {/* UPDATE POPUP */}
        {updateReady && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: 24,
                borderRadius: 12,
                width: "90%",
                maxWidth: 360,
                textAlign: "center",
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              }}
            >
              <h2
                style={{
                  fontFamily: '"taurunum", sans-serif',
                  fontSize: 28,
                  marginBottom: 14,
                }}
              >
                New Update Available
              </h2>

              <p
                style={{
                  fontFamily: theme.fonts.body,
                  fontSize: 16,
                  marginBottom: 18,
                }}
              >
                A new version of the app is ready. Reload now?
              </p>

              <button
                onClick={reloadApp}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  borderRadius: 10,
                  border: "none",
                  marginBottom: 10,
                  background: theme.colors.primaryRed,
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Reload App
              </button>

              <button
                onClick={() => setUpdateReady(false)}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  borderRadius: 10,
                  border: "none",
                  background: theme.colors.btnDark,
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Not Now
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
function SetupPage({
  newName,
  setNewName,
  newLevel,
  setNewLevel,
  newHP,
  setNewHP,
  newAC,
  setNewAC,
  addAdventurer,
  team,
  goOverview,
}) {
  /* -------------------- UI HELPERS (identiek aan BattlePage) -------------------- */

  const card = {
    padding: 12,
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #D1D5DB",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  };

  const btn = (bg) => ({
    padding: "10px 0",
    border: "none",
    borderRadius: 8,
    width: "100%",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    background: bg,
    fontFamily: theme.fonts.body,
    fontSize: 16,
  });

  const inputStyle = {
    padding: 10,
    borderRadius: 10,
    border: `1px solid ${theme.colors.border}`,
    fontFamily: theme.fonts.body,
    fontSize: 16,
    width: "100%",
    background: "#F3F3F3",
    boxSizing: "border-box", // FIX: hiermee matcht het volledig met BattlePage
  };

  /* -------------------- UI -------------------- */

  return (
    <div style={{ paddingBottom: 12 }}>
      {/* PAGE TITLE */}
      <h1
        style={{
          marginBottom: 14,
          fontFamily: '"taurunum", sans-serif',
          textAlign: "left",
        }}
      >
        Add an Adventurer
      </h1>

      {/* INPUT CARD */}
      <div style={{ ...card, marginBottom: 14 }}>
        {/* INPUT GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)", // FIX: consistent en stabiel
            gap: 8,
            marginBottom: 10,
          }}
        >
          <input
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={inputStyle}
          />

          <input
            placeholder="Level"
            value={newLevel}
            onChange={(e) => setNewLevel(e.target.value)}
            style={inputStyle}
          />

          <input
            placeholder="HP"
            value={newHP}
            onChange={(e) => setNewHP(e.target.value)}
            style={inputStyle}
          />

          <input
            placeholder="AC"
            value={newAC}
            onChange={(e) => setNewAC(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* ADD BUTTON */}
        <button onClick={addAdventurer} style={btn(theme.colors.primaryGreen)}>
          Add Adventurer
        </button>
      </div>

      {/* CURRENT PARTY TITLE */}
      <div
        style={{
          marginBottom: 8,
          fontFamily: theme.fonts.body,
          fontWeight: 600,
          fontSize: 16,
        }}
      >
        Current Party ({team.length})
      </div>

      {/* CHARACTER LIST */}
      <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
        {team.map((p) => (
          <div key={p.id} style={card}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                {/* NAME + LEVEL */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontFamily: '"taurunum", sans-serif',
                      fontSize: 22,
                    }}
                  >
                    {p.name}
                  </div>

                  <div
                    style={{
                      fontSize: 14,
                      fontFamily: theme.fonts.body,
                      opacity: 0.8,
                    }}
                  >
                    Lvl {p.level}
                  </div>
                </div>

                {/* HP */}
                <div
                  style={{
                    marginTop: 2,
                    fontSize: 13,
                    fontFamily: theme.fonts.body,
                  }}
                >
                  HP {p.hp}/{p.maxHp}
                </div>

                {/* AC */}
                <div
                  style={{
                    marginTop: 2,
                    fontSize: 13,
                    fontFamily: theme.fonts.body,
                    opacity: 0.8,
                  }}
                >
                  AC: {p.ac}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* BACK BUTTON */}
      <div style={{ textAlign: "center", marginTop: 4 }}>
        <button
          onClick={goOverview}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            background: theme.colors.primaryRed,
            color: "white",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            fontFamily: theme.fonts.body,
          }}
        >
          Back to Overview
        </button>
      </div>
    </div>
  );
}
function OverviewPage({
  team,
  startBattleForAdventurer,
  deleteAdventurer,
  goToSetup,
  setTeam,
  onCreateDungeon,
  onJoinDungeon,
  playerDungeonCode,
}) {
  const [popup, setPopup] = useState(null);
  const [acEdit, setAcEdit] = useState(null);

  const handleClick = (adv) => {
    if (adv.hp <= 0 || adv.dead) {
      setPopup(adv);
    } else {
      startBattleForAdventurer(adv.id);
    }
  };

  const reviveAdv = (id) => {
    setTeam((t) =>
      t.map((p) => (p.id === id ? { ...p, hp: 1, dead: false } : p))
    );
    setPopup(null);
  };

  const openAcEdit = (adv) => {
    setAcEdit({
      id: adv.id,
      name: adv.name,
      value: adv.ac?.toString() ?? "",
    });
  };

  const saveAc = () => {
    if (!acEdit) return;
    const val = parseInt(acEdit.value, 10);
    if (!val) return;
    setTeam((t) => t.map((p) => (p.id === acEdit.id ? { ...p, ac: val } : p)));
    setAcEdit(null);
  };

  return (
    <div>
      <h1
        style={{
          marginBottom: 16,
          fontFamily: '"taurunum", sans-serif',
        }}
      >
        My Party
      </h1>

      {playerDungeonCode && (
        <div
          style={{
            marginBottom: 16,
            padding: 8,
            borderRadius: 8,
            background: "#ecfdf5",
            border: "1px solid #bbf7d0",
            fontSize: 13,
          }}
        >
          Connected to dungeon{" "}
          <strong>{playerDungeonCode.toUpperCase()}</strong>
        </div>
      )}

      <div
        style={{
          marginBottom: 12,
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <button onClick={goToSetup} style={buttonStyle}>
          Add an adventurer
        </button>
        <button
          onClick={onCreateDungeon}
          style={{ ...buttonStyle, background: "#BD1A28" }}
        >
          Create Dungeon
        </button>
        <button
          onClick={onJoinDungeon}
          style={{ ...buttonStyle, background: "#03A23A" }}
        >
          Join Dungeon
        </button>
      </div>

      {team.length === 0 && (
        <div>You must gather your party before venturing forth.</div>
      )}

      <div style={{ display: "grid", gap: 8 }}>
        {team.map((p) => (
          <div key={p.id} style={cardStyle} onClick={() => handleClick(p)}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* LEFT COLUMN */}
              <div style={{ cursor: "pointer" }}>
                {/* NAME + LEVEL */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontFamily: '"taurunum", sans-serif',
                      fontSize: 22,
                    }}
                  >
                    {p.name}
                  </div>

                  <div
                    style={{
                      fontFamily: theme.fonts.body, // Lora
                      fontSize: 14,
                      opacity: 0.8,
                    }}
                  >
                    Lvl {p.level}
                  </div>
                </div>

                {/* HP */}
                <div style={{ fontSize: 14 }}>
                  HP {p.hp}/{p.maxHp}
                </div>

                {/* AC */}
                <div style={{ fontSize: 14, opacity: 0.8 }}>AC: {p.ac}</div>
              </div>

              {/* DELETE BUTTON */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteAdventurer(p.id);
                }}
                style={{
                  ...smallBtnStyle,
                  background: theme.colors.btnDanger,
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Death popup */}
      {popup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "#000000cc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 24,
              borderRadius: 12,
              minWidth: 260,
              boxShadow: theme.shadow.card,
            }}
          >
            <div style={{ marginBottom: 12 }}>
              Adventurer <strong>{popup.name}</strong> has died.
            </div>
            <button
              onClick={() => reviveAdv(popup.id)}
              style={{ ...buttonStyle, marginRight: 8 }}
            >
              Revive
            </button>
            <button
              onClick={() => {
                deleteAdventurer(popup.id);
                setPopup(null);
              }}
              style={{ ...buttonStyle, background: theme.colors.btnDanger }}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* AC edit popup */}
      {acEdit && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "#000000cc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 24,
              borderRadius: 12,
              minWidth: 260,
              boxShadow: theme.shadow.card,
            }}
          >
            <div style={{ marginBottom: 12 }}>
              Adjust AC for <strong>{acEdit.name}</strong>
            </div>
            <input
              type="number"
              value={acEdit.value}
              onChange={(e) =>
                setAcEdit((prev) => ({ ...prev, value: e.target.value }))
              }
              style={{
                padding: 8,
                width: "100%",
                marginBottom: 12,
                borderRadius: theme.radius.md,
                border: `1px solid ${theme.colors.border}`,
              }}
              placeholder="New AC"
            />
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button
                onClick={() => setAcEdit(null)}
                style={{ ...buttonStyle, background: "#6b7280" }}
              >
                Cancel
              </button>
              <button
                onClick={saveAc}
                style={{ ...buttonStyle, background: theme.colors.btnPrimary }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function BattlePage({
  selected,
  setSelected,
  goOverview,
  levelUpSelected,
  onSyncStats,
}) {
  const [input, setInput] = useState("");
  const [popup, setPopup] = useState(null); // "long" | "short" | "level" | "temp"
  const [editingAC, setEditingAC] = useState(null);

  /* -------------------- UI HELPERS -------------------- */

  // Algemeen button-stijl, iets compacter gemaakt
  const btn = (bg) => ({
    padding: "10px 0",
    border: "none",
    borderRadius: 8,
    width: "100%",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    background: bg,
    fontFamily: theme.fonts.body,
    fontSize: 16,
  });

  const card = {
    padding: 12, // was 14
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #D1D5DB",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  };

  // Numpad keys compacter
  const keyStyle = {
    padding: "10px 0", // was 16
    fontSize: 18, // was 20
    borderRadius: 10,
    border: "1px solid #9ca3af",
    background: "#F3F3F3",
    cursor: "pointer",
  };

  // Heal / Damage knoppen even hoog als de rest-knoppen
  const bigKey = (bg) => ({
    flex: 1,
    padding: "10px 0", // was 14
    borderRadius: 10,
    border: "none",
    fontSize: 16, // was 18
    fontWeight: 700,
    cursor: "pointer",
    background: bg,
    color: "white",
    fontFamily: theme.fonts.body,
  });

  const hpColor = (p) => {
    const r = p.hp / p.maxHp;
    if (r > 0.6) return theme.colors.primaryGreen;
    if (r > 0.3) return theme.colors.primaryYellow;
    return theme.colors.primaryRed;
  };

  /* -------------------- Logic -------------------- */

  const pressNumber = (n) => setInput((p) => p + n);
  const clearInput = () => setInput("");

  const applyChange = (type) => {
    const amt = parseInt(input, 10);
    if (!amt) return;

    setSelected((old) => {
      const updated = old.map((p) => {
        let hp = p.hp;
        let temp = p.tempHp;

        if (type === "damage") {
          let dmg = amt;
          if (temp > 0) {
            const absorbed = Math.min(temp, dmg);
            temp -= absorbed;
            dmg -= absorbed;
          }
          if (dmg > 0) hp = Math.max(0, hp - dmg);
        }

        if (type === "heal") {
          hp = Math.min(p.maxHp, hp + amt);
        }

        return { ...p, hp, tempHp: temp };
      });

      onSyncStats?.(updated);
      return updated;
    });

    setInput("");
  };

  const allAtMax = selected.every((p) => p.hp >= p.maxHp);

  /* -------------------- AC EDIT -------------------- */

  const saveAC = () => {
    if (!editingAC) return;
    const value = parseInt(editingAC.value, 10);
    if (!value) return;

    setSelected((old) => {
      const updated = old.map((p) =>
        p.id === editingAC.id ? { ...p, ac: value } : p
      );
      onSyncStats?.(updated);
      return updated;
    });

    setEditingAC(null);
  };

  /* -------------------- Popup Logic -------------------- */

  const confirmLongRest = () => {
    setSelected((old) => {
      const up = old.map((p) => ({
        ...p,
        hp: p.maxHp,
        tempHp: 0,
      }));
      onSyncStats?.(up);
      return up;
    });
    setPopup(null);
  };

  const confirmShortRest = () => {
    const amt = parseInt(input, 10);
    if (!amt) return;

    setSelected((old) => {
      const up = old.map((p) => ({
        ...p,
        hp: Math.min(p.hp + amt, p.maxHp),
      }));
      onSyncStats?.(up);
      return up;
    });

    setInput("");
    setPopup(null);
  };

  const confirmLevelUp = () => {
    const amt = parseInt(input, 10);
    if (!amt) return;
    levelUpSelected(amt);
    setInput("");
    setPopup(null);
  };

  const confirmTempHp = () => {
    const amt = parseInt(input, 10);
    if (!amt) return;

    setSelected((old) => {
      const up = old.map((p) => ({
        ...p,
        tempHp: amt,
      }));
      onSyncStats?.(up);
      return up;
    });

    setInput("");
    setPopup(null);
  };

  /* -------------------- Popup Component -------------------- */

  const Popup = ({ title, onConfirm, keypad }) => (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          width: 280,
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: 16, fontFamily: theme.fonts.body }}>
          {title}
        </h2>

        {keypad && (
          <>
            {/* INPUT */}
            <div
              style={{
                marginBottom: 12,
                fontSize: 16,
                fontWeight: 600,
                fontFamily: theme.fonts.body,
                textAlign: "Left",
              }}
            >
              Input: <strong>{input || 0}</strong>
            </div>

            {/* KEYPAD */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
                marginBottom: 12,
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button key={n} style={keyStyle} onClick={() => pressNumber(n)}>
                  {n}
                </button>
              ))}
              <button style={keyStyle} onClick={() => pressNumber(0)}>
                0
              </button>
              <button style={keyStyle} onClick={clearInput}>
                C
              </button>
              <div />
            </div>
          </>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={onConfirm} style={btn(theme.colors.primaryGreen)}>
            Confirm
          </button>
          <button
            onClick={() => {
              setPopup(null);
              setInput("");
            }}
            style={btn(theme.colors.primaryRed)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  /* -------------------- UI -------------------- */

  return (
    <div style={{ paddingBottom: 12 }}>
      {/* CHARACTER CARD */}
      <div
        style={{
          display: "grid",
          gap: 10, // was 12
          marginBottom: 14, // was 20
        }}
      >
        {selected.map((p) => (
          <div key={p.id} style={card}>
            {/* NAME + LEVEL */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6, // was 8
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 6, // was 8
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontFamily: '"taurunum", sans-serif',
                      fontSize: 28, // was 32
                    }}
                  >
                    {p.name}
                  </div>

                  <div
                    style={{
                      fontSize: 13, // was 14
                      opacity: 0.8,
                      fontFamily: theme.fonts.body,
                    }}
                  >
                    Lvl {p.level}
                  </div>
                </div>

                {/* HP + TEMP HP */}
                <div
                  style={{
                    marginTop: 3, // was 4
                    fontSize: 12, // was 13
                    fontFamily: theme.fonts.body,
                  }}
                >
                  HP {p.hp}/{p.maxHp} • Temp {p.tempHp}
                </div>

                {/* AC LINE */}
                <div
                  style={{
                    marginTop: 2,
                    fontSize: 12, // was 13
                    fontFamily: theme.fonts.body,
                    opacity: 0.8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6, // was 8
                  }}
                >
                  AC: {p.ac}
                  {/* AC EDIT BUTTON */}
                  <button
                    onClick={() =>
                      setEditingAC({
                        id: p.id,
                        value: p.ac.toString(),
                      })
                    }
                    style={{
                      padding: "3px 6px", // was 4x8
                      fontSize: 11, // was 12
                      borderRadius: 6,
                      border: "none",
                      cursor: "pointer",
                      background: "#e5e7eb",
                      fontFamily: theme.fonts.body,
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>

            {/* HP BAR */}
            <div
              style={{
                height: 22, // was 26
                background: "#DDD",
                borderRadius: 6,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  height: "100%",
                  width: `${(p.hp / p.maxHp) * 100}%`,
                  background: hpColor(p),
                  zIndex: 1,
                }}
              />
              {p.tempHp > 0 && (
                <div
                  style={{
                    position: "absolute",
                    height: "100%",
                    width: `${(p.tempHp / p.maxHp) * 100}%`,
                    background: theme.colors.primaryBlue,
                    opacity: 1,
                    zIndex: 2,
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* REST BUTTON GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 8, // was 10
          marginBottom: 14, // was 20
        }}
      >
        <button
          style={btn(theme.colors.primaryGreen)}
          onClick={() => setPopup("long")}
        >
          Long Rest
        </button>
        <button
          style={btn(theme.colors.primaryYellow)}
          onClick={() => setPopup("short")}
        >
          Short Rest
        </button>
        <button style={btn("#7c3aed")} onClick={() => setPopup("level")}>
          Level Up
        </button>
        <button
          style={btn(theme.colors.primaryBlue)}
          onClick={() => setPopup("temp")}
        >
          Temp HP
        </button>
      </div>

      {/* INPUT + KEYPAD */}
      <div style={{ ...card, marginBottom: 14 }}>
        <div
          style={{
            marginBottom: 8, // was 10
            fontWeight: 600,
            fontFamily: theme.fonts.body,
          }}
        >
          Input: <strong>{input || 0}</strong>
        </div>

        {/* KEYPAD */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 6, // was 8
            marginBottom: 10, // was 12
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button key={n} style={keyStyle} onClick={() => pressNumber(n)}>
              {n}
            </button>
          ))}
          <button style={keyStyle} onClick={() => pressNumber(0)}>
            0
          </button>
          <button style={keyStyle} onClick={clearInput}>
            C
          </button>
          <div />
        </div>

        {/* HEAL / DAMAGE */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            style={bigKey(allAtMax ? "#ccc" : theme.colors.primaryGreen)}
            onClick={() => !allAtMax && applyChange("heal")}
          >
            Heal
          </button>
          <button
            style={bigKey(theme.colors.primaryRed)}
            onClick={() => applyChange("damage")}
          >
            Damage
          </button>
        </div>
      </div>

      {/* BACK BUTTON */}
      <div style={{ textAlign: "center", marginTop: 4 }}>
        <button
          onClick={goOverview}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            background: theme.colors.btnDark,
            color: "white",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            fontFamily: theme.fonts.body,
          }}
        >
          Back to Overview
        </button>
      </div>

      {/* REST POPUPS */}
      {popup === "long" && (
        <Popup
          title="Take a Long Rest"
          onConfirm={confirmLongRest}
          keypad={false}
        />
      )}
      {popup === "short" && (
        <Popup
          title="Take a Short Rest"
          onConfirm={confirmShortRest}
          keypad={true}
        />
      )}
      {popup === "level" && (
        <Popup title="Level Up!" onConfirm={confirmLevelUp} keypad={true} />
      )}
      {popup === "temp" && (
        <Popup title="Add Temp HP" onConfirm={confirmTempHp} keypad={true} />
      )}

      {/* AC EDIT POPUP */}
      {editingAC && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 24,
              borderRadius: 12,
              width: 260,
              boxShadow: theme.shadow.card,
            }}
          >
            <h2 style={{ marginBottom: 12, fontFamily: theme.fonts.body }}>
              Edit AC
            </h2>

            <input
              type="number"
              value={editingAC.value}
              onChange={(e) =>
                setEditingAC((prev) => ({ ...prev, value: e.target.value }))
              }
              style={{
                padding: 8,
                width: "100%",
                marginBottom: 12,
                borderRadius: theme.radius.md,
                border: `1px solid ${theme.colors.border}`,
                fontFamily: theme.fonts.body,
              }}
            />

            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button
                onClick={() => setEditingAC(null)}
                style={{ ...btn("#6b7280"), width: "auto" }}
              >
                Cancel
              </button>
              <button
                onClick={saveAC}
                style={{ ...btn(theme.colors.primaryBlue), width: "auto" }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function DeathSavePage({ target, saveToTeam, backToBattle }) {
  const [saves, setSaves] = useState(0);
  const [fails, setFails] = useState(0);
  const [died, setDied] = useState(false);

  const black = "#000000";
  const softBlack = "#050505";

  const redFail1 = "rgb(100, 0, 0)"; // fail 1
  const redFail2 = "rgb(170, 0, 0)"; // fail 2

  let redHeight = 0;
  let redColor = redFail1;

  if (fails === 1) {
    redHeight = 30;
    redColor = redFail1;
  }

  if (fails === 2) {
    redHeight = 70;
    redColor = redFail2;
  }

  const gradientStops =
    fails >= 3
      ? `${redFail2} 0%, ${redFail2} 100%`
      : `
    ${softBlack} 0%,
    ${softBlack} ${100 - redHeight}%,
    ${redColor} ${100 - redHeight}%,
    ${redColor} 100%
  `;

  const balance = saves - fails; // -3..3
  const clamped = Math.max(-3, Math.min(3, balance));
  const t = (clamped + 3) / 6; // 0..1

  const tense = saves === fails && saves > 0 && saves < 3;

  const curveHeight = 10;
  const baseY = 30;
  const parabola = 1 - 4 * (t - 0.5) * (t - 0.5);
  const orbY = baseY - curveHeight * parabola;
  const orbX = 5 + t * 90;

  const orbColor = fails > saves ? redFail2 : "#ffffff";

  let narrator = "Between life and death, the world holds its breath.";

  if (fails === 1) narrator = "A chill crawls up your spine. Darkness stirs.";
  if (fails === 2) narrator = "Blood drips into the weave. One more breath...";
  if (saves === 1 && fails === 0)
    narrator = "A faint spark flickers in the void.";
  if (saves === 2 && fails === 0) narrator = "Hope steadies for a moment.";
  if (saves === 1 && fails === 1) narrator = "The scales tremble. Fate wavers.";
  if (saves === 2 && fails === 2)
    narrator = "A razor’s edge. One last heartbeat.";
  if (saves >= 3) narrator = "The thread of life holds. Consciousness returns.";
  if (fails >= 3) narrator = "The last spark fades. A soul slips away.";

  useEffect(() => {
    if (saves >= 3) {
      saveToTeam({ hp: 1, dead: false });
      backToBattle(true);
    }
    if (fails >= 3) {
      saveToTeam({ hp: 0, dead: true });
      setDied(true);
    }
  }, [saves, fails]);

  const addSave = () => {
    if (!died && saves < 3 && fails < 3) setSaves((v) => v + 1);
  };

  const addFail = () => {
    if (!died && saves < 3 && fails < 3) setFails((v) => v + 1);
  };

  const resetAll = () => {
    setSaves(0);
    setFails(0);
    setDied(false);
  };

  if (died) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100%",
          background: redFail2,
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          boxSizing: "border-box",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: '"taurunum", sans-serif',
            fontSize: 46,
            marginBottom: 16,
          }}
        >
          YOU DIED
        </h1>

        <p
          style={{
            fontFamily: theme.fonts.body,
            opacity: 0.9,
            maxWidth: 260,
            marginBottom: 20,
          }}
        >
          The final spark leaves {target.name}&apos;s body.
        </p>

        <button
          onClick={() => backToBattle(false)}
          style={{
            ...theme.components.button.base,
            background: theme.colors.btnDark,
          }}
        >
          Back to Overview
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        padding: 24,
        boxSizing: "border-box",
        backgroundColor: black,
        backgroundImage: `linear-gradient(to bottom, ${gradientStops})`,
        backgroundSize: "100% 100%",
        animation: "pulseAura 3s ease-in-out infinite",
        color: "white",
        overflow: "hidden",
        position: "relative",

        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* PULSE ANIMATION */}
      <style>
        {`
        @keyframes pulseAura {
          0% { filter: brightness(0.90); }
          50% { filter: brightness(1.10); }
          100% { filter: brightness(0.90); }
        }

        @keyframes driftCurve {
          0% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
          100% { transform: translateY(0); }
        }

        @keyframes pulseOrb {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
      `}
      </style>

      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div
          style={{
            fontFamily: '"taurunum", sans-serif',
            fontSize: 32,
            marginBottom: 4,
          }}
        >
          Death Saves
        </div>
        <div
          style={{
            fontFamily: '"taurunum", sans-serif',
            fontSize: 26,
          }}
        >
          {target.name}
        </div>
      </div>

      {/* Soulmeter */}
      <div style={{ maxWidth: 360, margin: "0 auto 26px auto" }}>
        <div
          style={{
            position: "relative",
            height: 60,
            animation: "driftCurve 2.6s ease-in-out infinite",
          }}
        >
          <svg
            viewBox="0 0 100 50"
            width="100%"
            height="60"
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            <path
              d="M 5 30 Q 50 10 95 30"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="2"
              fill="none"
            />

            <g
              style={{
                transformOrigin: "center",
                animation: "pulseOrb 2.2s ease-in-out infinite",
              }}
            >
              <circle
                cx={orbX}
                cy={orbY}
                r="5"
                fill={orbColor}
                style={{
                  filter: tense
                    ? "drop-shadow(0 0 10px rgba(255,255,255,1))"
                    : "drop-shadow(0 0 6px rgba(0,0,0,0.6))",
                  transition: "cx 0.35s ease, cy 0.35s ease",
                }}
              />
            </g>
          </svg>
        </div>

        <div
          style={{
            textAlign: "center",
            fontFamily: theme.fonts.body,
            fontSize: 13,
            opacity: 0.9,
            marginTop: 6,
          }}
        >
          Saves {saves}/3 • Fails {fails}/3
        </div>
      </div>

      {/* Narrator */}
      <div
        style={{
          maxWidth: 420,
          margin: "0 auto 24px auto",
          textAlign: "center",
          fontFamily: theme.fonts.body,
          fontSize: 14,
          opacity: 0.95,
        }}
      >
        {narrator}
      </div>

      {/* SAVE / FAIL buttons */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={`fail-${i}`}
              onClick={addFail}
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: i < fails ? theme.colors.primaryRed : "#333",
                border:
                  i < fails
                    ? "2px solid rgba(255,255,255,0.85)"
                    : "1px solid #555",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 11,
                fontFamily: theme.fonts.body,
                transition: "all 0.2s",
              }}
            >
              FAIL
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={`save-${i}`}
              onClick={addSave}
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: i < saves ? theme.colors.primaryGreen : "#333",
                border:
                  i < saves
                    ? "2px solid rgba(255,255,255,0.85)"
                    : "1px solid #555",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 11,
                fontFamily: theme.fonts.body,
                transition: "all 0.2s",
              }}
            >
              SAVE
            </div>
          ))}
        </div>
      </div>

      {/* Buttons bottom */}
      <div style={{ textAlign: "center", marginTop: 12 }}>
        <button
          onClick={resetAll}
          style={{
            ...theme.components.button.base,
            background: "#4b5563",
            marginRight: 8,
          }}
        >
          Reset
        </button>
        <button
          onClick={() => backToBattle(false)}
          style={{
            ...theme.components.button.base,
            background: theme.colors.btnDark,
          }}
        >
          Back to Overview
        </button>
      </div>
    </div>
  );
}
function JoinDungeonPage({
  team,
  clientId,
  setPlayerDungeonCode,
  setIsInDungeonAsPlayer,
  goBack,
}) {
  const [code, setCode] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const normalizedCode = code.replace(/\s+/g, "").toUpperCase();

  /* ---------------- CHARACTER CARD STYLE ---------------- */

  const card = {
    padding: 12,
    background: "#fff",
    borderRadius: 12,
    border: `1px solid ${theme.colors.border}`,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    cursor: "pointer",
  };

  const selectedCard = {
    ...card,
    background: theme.colors.primaryRed,
    color: "white",
    boxShadow: `0 0 0 1px ${theme.colors.primaryRed}`,
  };

  /* ---------------- JOIN LOGIC ---------------- */

  const doJoin = async () => {
    setError("");
    if (!normalizedCode || !selectedId) {
      setError("Enter a dungeon code and choose a hero.");
      return;
    }

    const character = team.find((p) => p.id === selectedId);
    if (!character) {
      setError("Invalid hero.");
      return;
    }

    setBusy(true);
    try {
      const { error: upsertError } = await supabase.from("players").upsert({
        dungeon_code: normalizedCode,
        client_id: clientId,
        character_id: character.id,
        name: character.name,
        level: character.level,
        hp: character.hp,
        max_hp: character.maxHp,
        temp_hp: character.tempHp || 0,
        ac: character.ac ?? 10,
        updated_at: new Date().toISOString(),
      });

      if (upsertError) {
        setError("Could not join dungeon. Check the code.");
      } else {
        setPlayerDungeonCode(normalizedCode);
        setIsInDungeonAsPlayer(true);
        goBack();
      }
    } catch (e) {
      setError("Something went wrong while joining.");
    } finally {
      setBusy(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div>
      {/* PAGE TITLE */}
      <h1
        style={{
          marginBottom: 12,
          fontFamily: '"taurunum", sans-serif',
          fontSize: 32,
        }}
      >
        Join Dungeon
      </h1>

      {/* DUNGEON CODE CARD */}
      <div style={{ ...card, marginBottom: 14 }}>
        <input
          placeholder="Enter the dungeon code to send in your hero… (e.g. XG4-92K)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{
            padding: 10,
            width: "100%",
            marginBottom: 6,
            borderRadius: 10,
            border: `1px solid ${theme.colors.border}`,
            fontFamily: theme.fonts.body,
            fontSize: 16,
            background: "#F3F3F3",
            boxSizing: "border-box",
          }}
        />

        <div style={{ fontSize: 12, color: "#6b7280" }}>
          Changes in HP / Temp HP / AC are automatically shared with the DM.
        </div>
      </div>

      {/* SECTION TITLE */}
      <h2
        style={{
          marginBottom: 10,
          fontFamily: '"taurunum", sans-serif',
          fontSize: 28,
        }}
      >
        Choose Your Hero
      </h2>

      {/* HERO LIST */}
      <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
        {team.map((p) => {
          const isSelected = p.id === selectedId;
          const style = isSelected ? selectedCard : card;

          return (
            <div key={p.id} style={style} onClick={() => setSelectedId(p.id)}>
              {/* NAME + LEVEL */}
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    fontFamily: '"taurunum", sans-serif',
                    fontSize: 24,
                    fontWeight: 700,
                  }}
                >
                  {p.name}
                </div>

                <div
                  style={{
                    fontSize: 14,
                    opacity: isSelected ? 1 : 0.7,
                    fontFamily: theme.fonts.body,
                  }}
                >
                  Lvl {p.level}
                </div>
              </div>

              {/* HP */}
              <div
                style={{
                  fontSize: 14,
                  marginTop: 2,
                  fontFamily: theme.fonts.body,
                  opacity: isSelected ? 0.95 : 0.85,
                }}
              >
                HP {p.hp}/{p.maxHp} • Temp {p.tempHp || 0}
              </div>

              {/* AC */}
              <div
                style={{
                  fontSize: 14,
                  marginTop: 2,
                  fontFamily: theme.fonts.body,
                  opacity: isSelected ? 0.95 : 0.85,
                }}
              >
                AC: {p.ac}
              </div>
            </div>
          );
        })}
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div
          style={{
            marginBottom: 12,
            padding: 8,
            borderRadius: 8,
            background: "#fef2f2",
            color: "#b91c1c",
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      {/* BUTTONS */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={goBack}
          disabled={busy}
          style={{
            ...buttonStyle,
            background: theme.colors.btnDark,
            width: "100%",
          }}
        >
          Cancel
        </button>

        <button
          onClick={doJoin}
          disabled={busy}
          style={{
            ...buttonStyle,
            background: theme.colors.primaryGreen,
            width: "100%",
          }}
        >
          {busy ? "Joining..." : "Join Dungeon"}
        </button>
      </div>
    </div>
  );
}
function DMDungeonCodePage({
  dungeonCode,
  goToDashboard,
  endDungeon,
  goOverview,
}) {
  return (
    <div>
      <h1
        style={{
          marginBottom: 12,
          fontFamily: '"taurunum", sans-serif',
        }}
      >
        Dungeon Created!
      </h1>

      <div
        style={{
          padding: 20,
          background: theme.colors.card,
          borderRadius: theme.radius.lg,
          border: `1px solid ${theme.colors.border}`,
          textAlign: "center",
          marginBottom: 20,
          boxShadow: theme.shadow.card,
        }}
      >
        <div
          style={{
            marginBottom: 6,
            fontSize: 14,
            color: "#6b7280",
            fontFamily: theme.fonts.body,
          }}
        >
          Give this code to your players:
        </div>

        <div
          style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: 2,
            padding: 12,
            borderRadius: 8,
            background: "#f3f4f6",
            border: `1px solid ${theme.colors.border}`,
            marginBottom: 12,
            fontFamily: theme.fonts.title,
          }}
        >
          {dungeonCode}
        </div>

        <button
          onClick={goToDashboard}
          style={{
            ...buttonStyle,
            background: theme.colors.primaryGreen,
            width: "100%",
            marginBottom: 10,
          }}
        >
          Go to DM Dashboard
        </button>

        <button
          onClick={endDungeon}
          style={{
            ...buttonStyle,
            background: theme.colors.btnDanger,
            width: "100%",
          }}
        >
          End Dungeon
        </button>
      </div>

      <div style={{ textAlign: "center" }}>
        <button
          onClick={goOverview}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            background: theme.colors.btnDark,
            color: "white",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            fontFamily: theme.fonts.body,
          }}
        >
          Back to Overview
        </button>
      </div>
    </div>
  );
}
function DMDashboardPage({ dungeonCode, goBack }) {
  const [players, setPlayers] = useState([]);
  const normalized = dungeonCode.toUpperCase();

  const loadPlayers = async () => {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("dungeon_code", normalized);

    if (!error && data) setPlayers(data);
  };

  useEffect(() => {
    loadPlayers();

    const channel = supabase
      .channel("players-watch-" + normalized)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `dungeon_code=eq.${normalized}`,
        },
        (payload) => {
          setPlayers((prev) => {
            if (payload.eventType === "INSERT") {
              const exists = prev.some(
                (p) => p.client_id === payload.new.client_id
              );
              if (exists) {
                return prev.map((p) =>
                  p.client_id === payload.new.client_id ? payload.new : p
                );
              }
              return [...prev, payload.new];
            }

            if (payload.eventType === "UPDATE") {
              return prev.map((p) =>
                p.client_id === payload.new.client_id ? payload.new : p
              );
            }

            if (payload.eventType === "DELETE") {
              return prev.filter((p) => p.client_id !== payload.old.client_id);
            }

            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dungeonCode]);

  return (
    <div>
      <h1
        style={{
          marginBottom: 8,
          fontFamily: '"taurunum", sans-serif',
        }}
      >
        DM Dashboard
      </h1>

      <div
        style={{
          marginBottom: 12,
          fontSize: 14,
          padding: 8,
          borderRadius: theme.radius.md,
          background: theme.colors.card,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        Dungeon code: <strong>{normalized}</strong>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {players.length === 0 && (
          <div
            style={{
              padding: 12,
              background: "#fef9c3",
              border: "1px solid #fde047",
              borderRadius: 8,
              fontSize: 14,
            }}
          >
            Wacht op spelers…
          </div>
        )}

        {players.map((p) => (
          <div
            key={p.client_id}
            style={{
              padding: 12,
              borderRadius: 10,
              border: `1px solid ${theme.colors.border}`,
              background: theme.colors.card,
              boxShadow: theme.shadow.card,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontFamily: theme.fonts.title,
              }}
            >
              {p.name}
            </div>
            <div style={{ fontSize: 13 }}>
              Lvl {p.level} • AC {p.ac}
            </div>
            <div style={{ fontSize: 13 }}>
              HP {p.hp}/{p.max_hp} • Temp {p.temp_hp}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <button
          onClick={goBack}
          style={{ ...buttonStyle, background: theme.colors.btnDark }}
        >
          Terug naar overzicht
        </button>
      </div>
    </div>
  );
}
const cardStyle = {
  ...theme.components.card,
};
const buttonStyle = {
  ...theme.components.button.base,
  background: theme.colors.btnPrimary,
};
const smallBtnStyle = {
  ...theme.components.button.base,
  padding: "6px 8px",
  fontSize: 12,
};
const splashStyles = `
@keyframes fadeInSplash {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes fadeOutSplash {
  0% { opacity: 1; }
  70% { opacity: 1; }
  100% { opacity: 0; pointer-events: none; }
}
`;
if (
  typeof document !== "undefined" &&
  !document.getElementById("splash-styles")
) {
  const style = document.createElement("style");
  style.id = "splash-styles";
  style.innerHTML = splashStyles;
  document.head.appendChild(style);
}
function DMPaywallModal({ close, unlock }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "white",
          padding: 24,

          // ⭐ MATCHT NU PERFECT MET JE KAARTEN
          borderRadius: 12,
          border: `1px solid ${theme.colors.border}`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",

          width: "100%",
          maxWidth: 420,

          textAlign: "center",

          // Ruimte tot de randen op mobiel
          margin: "0 16px",
        }}
      >
        {/* TITLE */}
        <h2
          style={{
            fontFamily: '"taurunum", sans-serif',
            fontSize: 32,
            marginBottom: 16,
          }}
        >
          DM Mode
        </h2>

        {/* DESCRIPTION */}
        <p
          style={{
            fontFamily: theme.fonts.body,
            fontSize: 16,
            lineHeight: 1.5,
            marginBottom: 20,
          }}
        >
          With DM Mode you can:
          <br />• Create dungeons
          <br />• Let players join
          <br />• View HP & AC in real-time
        </p>

        {/* UNLOCK BUTTON */}
        <button
          onClick={unlock}
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: 10,
            border: "none",
            marginBottom: 12,
            cursor: "pointer",
            background: theme.colors.primaryRed,
            color: "white",
            fontWeight: 700,
            fontFamily: theme.fonts.body,
            fontSize: 16,
          }}
        >
          Unlock DM Mode (Free)
        </button>

        {/* CANCEL BUTTON */}
        <button
          onClick={close}
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background: theme.colors.btnDark,
            color: "white",
            fontWeight: 700,
            fontFamily: theme.fonts.body,
            fontSize: 16,
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
