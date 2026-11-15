/* ==========================================================================
   Pulse Label — api.js
   Accès aux données. Utilise l'API REST de Supabase (PostgREST) directement,
   sans bibliothèque externe.
     - lecture   : GET  /rest/v1/attractions_public
     - note      : POST /rest/v1/rpc/submit_rating
   Sans configuration, bascule sur PULSE_DEMO_DATA (demo-data.js).
   ========================================================================== */
window.PulseAPI = (function () {
  const cfg = window.PULSE_CONFIG || {};
  const live = Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  // Les données de démonstration ne s'affichent qu'en aperçu (fichier local, localhost,
  // adresse de prévisualisation *.vercel.app), jamais sur le site public.
  const host = location.hostname;
  const demoAllowed = location.protocol === 'file:' || host === 'localhost' || host === '127.0.0.1' || host.endsWith('.vercel.app');
  const base = live ? cfg.SUPABASE_URL.replace(/\/+$/, '') + '/rest/v1/' : '';

  /* ── Stockage local (identifiant visiteur + notes déjà données) ── */
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } },
  };
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0; return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
  // Identifiant anonyme : sert uniquement à empêcher qu'un même navigateur vote plusieurs fois.
  function visitorId() {
    let id = store.get('pl_visitor_id', null);
    if (!id) { id = uuid(); store.set('pl_visitor_id', id); }
    return id;
  }
  const myRatings = () => store.get('pl_my_ratings', {});
  const myRating = id => (id in myRatings() ? myRatings()[id] : null);

  async function rest(path, options = {}) {
    const res = await fetch(base + path, {
      ...options,
      headers: {
        apikey: cfg.SUPABASE_ANON_KEY,
        Authorization: 'Bearer ' + cfg.SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      let msg = 'Erreur ' + res.status;
      try { const j = await res.json(); msg = j.message || msg; } catch (e) { /* corps vide */ }
      throw new Error(msg);
    }
    return res.status === 204 ? null : res.json();
  }

  /* ── Normalisation : une attraction a toujours la même forme côté interface ── */
  function normalize(r) {
    return {
      id: String(r.id ?? r.slug),
      slug: r.slug || '',
      name: r.name || 'Sans nom',
      park: r.park || '',
      city: r.city || '',
      country: r.country || '',
      region: r.region || '',
      type: r.type || '',
      model: r.model || '',
      model_en: r.model_en || '',
      manufacturer: r.manufacturer || '',
      year: r.year ? Number(r.year) : null,
      official_score: Number(r.official_score) || 0,
      evaluated_on: r.evaluated_on || '',
      disclosure: r.disclosure || '',
      disclosure_en: r.disclosure_en || '',
      photo_url: r.photo_url || '',
      photo_credit: r.photo_credit || '',
      visitor_avg: r.visitor_avg == null ? null : Number(r.visitor_avg),
      visitor_count: Number(r.visitor_count) || 0,
    };
  }

  // Rang : ordre décroissant du Pulse Score Attraction, ex aequo = même rang.
  function withRanks(list) {
    const sorted = [...list].sort((a, b) => b.official_score - a.official_score || a.name.localeCompare(b.name, 'fr'));
    let prev = null, rank = 0;
    sorted.forEach((a, i) => { if (a.official_score !== prev) { rank = i + 1; prev = a.official_score; } a.rank = rank; });
    return sorted;
  }

  /* ── Lecture ── */
  async function getAttractions() {
    if (!live && !demoAllowed) return { items: [], demo: false, pending: true };
    if (!live) {
      const extra = store.get('pl_demo_votes', {});
      const rows = (window.PULSE_DEMO_DATA || []).map(r => {
        const a = normalize(r);
        const v = extra[a.id];
        if (v) { a.visitor_avg = v.avg; a.visitor_count = v.count; }
        return a;
      });
      return { items: withRanks(rows), demo: true };
    }
    const rows = await rest((cfg.VIEW || 'attractions_public') + '?select=*');
    return { items: withRanks(rows.map(normalize)), demo: false };
  }

  /* ── Note visiteur (0 à 20). Une note par visiteur et par attraction, modifiable. ── */
  async function submitRating(attraction, score) {
    score = Math.round(Number(score));
    if (!(score >= 0 && score <= 20)) throw new Error('score must be between 0 and 20');
    const previous = myRating(attraction.id);  // null si jamais noté
    let result;

    if (live) {
      const out = await rest('rpc/' + (cfg.RATING_RPC || 'submit_rating'), {
        method: 'POST',
        body: JSON.stringify({ p_attraction_id: attraction.id, p_visitor_id: visitorId(), p_score: score }),
      });
      const row = Array.isArray(out) ? out[0] : out;
      result = { avg: Number(row.visitor_avg), count: Number(row.visitor_count) };
    } else {
      // Démo : moyenne recalculée localement, comme le ferait la base.
      const count0 = attraction.visitor_count, avg0 = attraction.visitor_avg || 0;
      const had = previous !== null;
      const total = avg0 * count0 - (had ? previous : 0) + score;
      const count = had ? count0 : count0 + 1;
      result = { avg: Math.round((total / count) * 10) / 10, count };
      const extra = store.get('pl_demo_votes', {}); extra[attraction.id] = result; store.set('pl_demo_votes', extra);
    }

    const mine = myRatings(); mine[attraction.id] = score; store.set('pl_my_ratings', mine);
    return result;
  }

  return { live, demoAllowed, getAttractions, submitRating, myRating };
})();
