"""Met à jour data/fighters.json (modèles UFC de l'appli) depuis ufcstats.com.

Source : la base publique https://github.com/Greco1899/scrape_ufc_stats (rafraîchie chaque jour).
Usage : python3 tools/build_fighters.py CHEMIN_DU_DEPOT_GRECO1899 [CHEMIN_DE_fighters.json]

- Garde les combattants qui ont au moins 3 combats UFC, et ceux qui ont combattu à l'UFC
  ces 2 dernières années (nouveaux venus comme Yaroslav Amosov), même avec 1 ou 2 combats.
- Recalcule bilan, finitions, gabarit et statistiques à partir de tous leurs combats.
- Garde le profil de style déjà attribué ; un nouveau combattant reçoit le profil
  dont il est le plus proche (centres des profils existants).
"""
import json, math, re, sys
from collections import Counter, defaultdict
import pandas as pd

REPO = sys.argv[1]
OUT = sys.argv[2] if len(sys.argv) > 2 else "data/fighters.json"
MIN_FIGHTS = 3
ACTIVE_YEARS = 2  # un combattant récent (dernier combat UFC il y a moins de 2 ans) est gardé même avec 1 ou 2 combats

WC = [("women's strawweight", "Pailles (F)"), ("women's flyweight", "Mouches (F)"), ("women's bantamweight", "Coqs (F)"),
      ("women's featherweight", "Plumes (F)"), ("light heavyweight", "Mi-lourds"), ("heavyweight", "Lourds"),
      ("middleweight", "Moyens"), ("welterweight", "Mi-moyens"), ("lightweight", "Légers"), ("featherweight", "Plumes"),
      ("bantamweight", "Coqs"), ("flyweight", "Mouches"), ("catch weight", "Catch Weight"), ("open weight", "Open Weight")]
ST = {"Orthodox": "Orthodoxe", "Southpaw": "Gaucher", "Switch": "Change de garde", "Open Stance": "Garde ouverte", "Sideways": "Garde ouverte"}
POS = [("from mount", "depuis la montée"), ("from back control", "depuis le dos"), ("from half guard", "depuis la demi-garde"),
       ("from side control", "depuis le contrôle latéral"), ("from crucifix", "depuis le crucifix"), ("from guard", "depuis la garde"),
       ("in clinch", "au clinch"), ("on ground", "au sol"), ("at distance", "à distance")]
SUBS = [("rear naked", "Étranglement arrière"), ("guillotine", "Guillotine"), ("triangle armbar", "Triangle et clé de bras"),
        ("arm triangle", "Arm-triangle"), ("armbar", "Clé de bras"), ("triangle", "Triangle"), ("d'arce", "D'arce"), ("anaconda", "Anaconda"),
        ("kimura", "Kimura"), ("americana", "Clé américaine"), ("kneebar", "Clé de genou"), ("heel hook", "Clé de talon"),
        ("ankle", "Clé de cheville"), ("toe hold", "Clé d'orteil"), ("calf slicer", "Calf slicer"), ("neck crank", "Clé de nuque"),
        ("twister", "Twister"), ("von flue", "Étranglement Von Flue"), ("north-south", "Étranglement nord-sud"), ("north south", "Étranglement nord-sud"),
        ("ezekiel", "Ezekiel"), ("omoplata", "Omoplata"), ("peruvian", "Cravate péruvienne"), ("bulldog", "Bulldog"), ("scarf", "Clé de nuque"),
        ("choke", "Étranglement")]


def wc_fr(s):
    s = str(s).lower()
    for k, v in WC:
        if k in s:
            return v
    return str(s).replace(" Bout", "").strip()


def fin_label(method, details):
    d = str(details).lower().replace("technical submission", "").strip()
    if method.startswith("Submission"):
        for k, v in SUBS:
            if k in d:
                return v
        return "Clé articulaire"
    if "spinning back fist" in d: return "Backfist retourné"
    if "spinning back elbow" in d: return "Coude retourné"
    if "spinning" in d or "wheel kick" in d: return "Wheel kick" if "wheel" in d else "Coup de pied retourné"
    if "flying knee" in d: return "Genou sauté"
    if "slam" in d: return "Projection (slam)"
    pos = next((v for k, v in POS if k in d), "")
    if "punch" in d:
        if "body" in d: return "Coups de poing au corps"
        if pos in ("à distance", ""): return "Coups de poing à distance"
        if pos == "au clinch": return "Coups de poing au clinch"
        return "Ground and pound au sol" if pos == "au sol" else f"Ground and pound {pos}"
    if "elbow" in d: return f"Coudes à la tête {pos}".strip()
    if "knee" in d:
        return f"Genou {'au corps' if 'body' in d else 'à la tête'} {pos}".strip()
    if "kick" in d:
        if "body" in d: return "Coup de pied au corps"
        if "leg" in d: return "Low kick"
        if "front" in d: return "Front kick au visage"
        return "High kick"
    return None


def of(x, i):
    m = re.match(r"\s*(\d+)\s+of\s+(\d+)", str(x))
    return int(m.group(i + 1)) if m else 0


def secs(t):
    m = re.match(r"\s*(\d+):(\d+)", str(t))
    return int(m.group(1)) * 60 + int(m.group(2)) if m else 0


def fight_seconds(rnd, time, fmt):
    lens = [int(x) for x in re.findall(r"\d+", re.sub(r"^\d+ Rnd", "", str(fmt)))] or [5] * 5
    r = int(rnd) if str(rnd).isdigit() else 1
    return sum(lens[: r - 1]) * 60 + secs(time)


def cm(h):
    m = re.match(r"(\d+)'\s*(\d+)", str(h))
    return round((int(m.group(1)) * 12 + int(m.group(2))) * 2.54) if m else None


def cm_reach(r):
    m = re.match(r"(\d+(?:\.\d+)?)", str(r))
    return round(float(m.group(1)) * 2.54) if m and str(r).strip() != "--" else None


ev = pd.read_csv(f"{REPO}/ufc_event_details.csv"); ev["EVENT"] = ev.EVENT.str.strip(); ev["d"] = pd.to_datetime(ev.DATE.str.strip(), errors="coerce")
res = pd.read_csv(f"{REPO}/ufc_fight_results.csv"); res["EVENT"] = res.EVENT.str.strip(); res["BOUT"] = res.BOUT.str.strip()
st = pd.read_csv(f"{REPO}/ufc_fight_stats.csv"); st["EVENT"] = st.EVENT.str.strip(); st["BOUT"] = st.BOUT.str.strip(); st["FIGHTER"] = st.FIGHTER.str.strip()
tott = pd.read_csv(f"{REPO}/ufc_fighter_tott.csv"); tott["FIGHTER"] = tott.FIGHTER.str.strip(); tott = tott.drop_duplicates("FIGHTER")
res = res.merge(ev[["EVENT", "d"]], on="EVENT", how="left")

COLS = ["KD", "SUB.ATT"]
st["sig_l"] = st["SIG.STR."].map(lambda x: of(x, 0)); st["sig_a"] = st["SIG.STR."].map(lambda x: of(x, 1))
st["td_l"] = st["TD"].map(lambda x: of(x, 0)); st["td_a"] = st["TD"].map(lambda x: of(x, 1))
for c in ["HEAD", "BODY", "LEG", "DISTANCE", "CLINCH", "GROUND"]:
    st[c.lower()] = st[c].map(lambda x: of(x, 0))
st["ctrl_s"] = st.CTRL.map(secs)
for c in COLS: st[c] = pd.to_numeric(st[c], errors="coerce").fillna(0)
agg = st.groupby(["EVENT", "BOUT", "FIGHTER"])[["sig_l", "sig_a", "td_l", "td_a", "head", "body", "leg", "distance", "clinch", "ground", "ctrl_s", "KD", "SUB.ATT"]].sum().reset_index()
aggd = {(r["EVENT"], r["BOUT"], r["FIGHTER"]): r for r in agg.to_dict("records")}

per = defaultdict(list)
for r in res.to_dict("records"):
    names = [x.strip() for x in r["BOUT"].split(" vs. ")]
    if len(names) != 2: continue
    oc = str(r["OUTCOME"]).split("/")
    for i, me in enumerate(names):
        per[me].append({"opp": names[1 - i], "out": oc[i] if len(oc) == 2 else "", "method": str(r["METHOD"]).strip(), "details": r["DETAILS"],
                        "wc": r["WEIGHTCLASS"], "d": r["d"], "sec": fight_seconds(r["ROUND"], r["TIME"], r["TIME FORMAT"]), "ev": r["EVENT"], "bout": r["BOUT"]})

old = json.load(open(OUT))
old_p = {x["n"]: x["p"] for x in old["f"]}
rows = []
recent = res.d.max() - pd.DateOffset(years=ACTIVE_YEARS)
for name, fights in per.items():
    lastd = max((f["d"] for f in fights if pd.notna(f["d"])), default=pd.NaT)
    if len(fights) < MIN_FIGHTS and not (pd.notna(lastd) and lastd >= recent): continue
    fights.sort(key=lambda f: f["d"] if pd.notna(f["d"]) else pd.Timestamp(0))
    W = sum(f["out"] == "W" for f in fights); L = sum(f["out"] == "L" for f in fights); D = sum(f["out"] == "D" for f in fights)
    wins = [f for f in fights if f["out"] == "W"]
    ko = sum("KO" in f["method"] for f in wins); sub = sum(f["method"].startswith("Submission") for f in wins); dec = sum(f["method"].startswith("Decision") for f in wins)
    fins = Counter(l for f in wins if ("KO" in f["method"] or f["method"].startswith("Submission")) for l in [fin_label(f["method"], f["details"])] if l)
    T = defaultdict(float); O = defaultdict(float); sec = 0
    for f in fights:
        a = aggd.get((f["ev"], f["bout"], name)); b = aggd.get((f["ev"], f["bout"], f["opp"]))
        if a is None or b is None or not f["sec"]: continue
        sec += f["sec"]
        for k in ["sig_l", "sig_a", "td_l", "td_a", "head", "body", "leg", "distance", "clinch", "ground", "ctrl_s", "KD", "SUB.ATT"]:
            T[k] += a[k]; O[k] += b[k]
    if not sec: continue
    mins = sec / 60; q = lambda a, b: round(a / b, 2) if b else None
    s = {"slpm": q(T["sig_l"], mins), "sapm": q(O["sig_l"], mins), "acc": q(T["sig_l"], T["sig_a"]),
         "head": q(T["head"], T["sig_l"]), "body": q(T["body"], T["sig_l"]), "leg": q(T["leg"], T["sig_l"]),
         "dist": q(T["distance"], T["sig_l"]), "clinch": q(T["clinch"], T["sig_l"]), "ground": q(T["ground"], T["sig_l"]),
         "td15": q(T["td_a"] * 15, mins), "tdl15": q(T["td_l"] * 15, mins), "tdacc": q(T["td_l"], T["td_a"]),
         "tdd": round(1 - O["td_l"] / O["td_a"], 2) if O["td_a"] else None, "ctrl": q(T["ctrl_s"], sec),
         "sub15": q(T["SUB.ATT"] * 15, mins), "kd15": q(T["KD"] * 15, mins),
         "sdef": round(1 - O["sig_l"] / O["sig_a"], 2) if O["sig_a"] else None}
    t = tott[tott.FIGHTER == name]
    last = fights[-1]
    rows.append({"n": name, "wc": wc_fr(last["wc"]), "h": cm(t.HEIGHT.iloc[0]) if len(t) else None, "r": cm_reach(t.REACH.iloc[0]) if len(t) else None,
                 "st": ST.get(str(t.STANCE.iloc[0]).strip()) if len(t) and pd.notna(t.STANCE.iloc[0]) else None,
                 "rec": [W, L, D], "ko": ko, "sub": sub, "dec": dec, "last": str(last["d"].date()) if pd.notna(last["d"]) else None,
                 "nf": len(fights), "fin": [list(x) for x in fins.most_common(5)], "p": old_p.get(name), **s})

# profil de style des nouveaux : centre de profil le plus proche
FEAT = ["slpm", "sapm", "acc", "head", "body", "leg", "dist", "clinch", "ground", "td15", "tdacc", "tdd", "ctrl", "sub15", "kd15"]
df = pd.DataFrame(rows)
mu = df[FEAT].mean(); sd = df[FEAT].std().replace(0, 1)
cent = df[df.p.notna()].groupby("p")[FEAT].mean()
for r in rows:
    if r["p"]: continue
    z = ((pd.Series({k: r[k] for k in FEAT}).astype(float).fillna(mu) - mu) / sd)
    r["p"] = ((((cent - mu) / sd).sub(z, axis=1)) ** 2).sum(axis=1).idxmin()

df = pd.DataFrame(rows)
avg = {wc: {k: round(float(g[k].dropna().mean()), 3) for k in FEAT + ["tdl15"] if g[k].notna().any()} for wc, g in df.groupby("wc")}
out = {"source": "ufcstats.com, combats UFC jusqu'au " + str(res.d.max().date()), "avg": avg, "f": sorted(rows, key=lambda x: x["n"])}
json.dump(out, open(OUT, "w"), ensure_ascii=False, separators=(",", ":"))
print(f"{len(rows)} combattants, {sum(1 for r in rows if r['n'] not in old_p)} nouveaux, dernier combat {res.d.max().date()}")
