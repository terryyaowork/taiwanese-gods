/**
 * 線上廟宇的計數器（Cloudflare Durable Object）。
 *
 * GET  /stats   → { total, today, sittingNow, sitToday, others, bowedToYou }
 * POST /incense → { ...stats, counted }
 * POST /sit     → { ...stats, seated }   body: { minutes, name }
 * POST /stand   → { ...stats }
 * POST /bow     → { ...stats, bowed }    向現在一起坐的人合十
 *
 * others：其他在坐的人的香客名編號（最多 OTHERS_MAX 個）；bowedToYou：這次坐下後有幾個人向你合十。
 * 香客名只是頁面隨機給的編號，不是個人資料。
 *
 * 不做即時連線。香：同一個 IP 每分鐘只算一炷。
 * 靜坐：坐下時記下結束時間，還沒結束的就是「現在在坐的人」，不用一直回報。
 * 同一個 IP 同時只算一個座位。IP 只存加鹽雜湊；鹽是每天重新產生的隨機值，猜不到鹽就無法反推 IP。
 * 「今天」以台北時間換日。
 */
import { DurableObject } from 'cloudflare:workers';

const RATE_MS = 60_000;
const MAX_TRACKED_IPS = 5000;
const SIT_MINUTES = [1, 3, 5];
// 座位名單整份存在一個 key 裡，設上限避免太大
const MAX_SITTERS = 3000;
// 畫面上畫得出名字的人數（前排 6 個＋後排 8 個）
const OTHERS_MAX = 14;
const NAME_MAX = 63;
const ALLOWED_ORIGINS = ['https://taiwanese-gods.org', 'https://www.taiwanese-gods.org'];
const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const taipeiDay = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });

const toHex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');

export class TempleHall extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    // 只放記憶體：物件被回收時清空，最多讓同一個 IP 提早一分鐘再算一次
    this.lastByIp = new Map();
  }

  // 每天換一次隨機鹽：日期變了就重新產生
  async salt() {
    const day = taipeiDay();
    if (this.saltCache?.day === day) return this.saltCache.value;
    let stored = await this.ctx.storage.get('salt');
    if (stored?.day !== day) {
      stored = { day, value: toHex(crypto.getRandomValues(new Uint8Array(16))) };
      await this.ctx.storage.put('salt', stored);
    }
    this.saltCache = stored;
    return stored.value;
  }

  async seatKey(ip) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${await this.salt()}:${ip}`));
    return toHex(new Uint8Array(digest).slice(0, 8));
  }

  async load() {
    const s = await this.ctx.storage.get(['total', 'day', 'today', 'sitDay', 'sitToday', 'sitters']);
    const now = Date.now();
    const sitters = s.get('sitters') || {};
    for (const key of Object.keys(sitters)) {
      // 舊格式只存結束時間
      if (typeof sitters[key] === 'number') sitters[key] = { e: sitters[key], n: 0, b: 0 };
      if (sitters[key].e <= now) delete sitters[key];
    }
    const day = taipeiDay();
    return {
      total: s.get('total') || 0,
      today: s.get('day') === day ? s.get('today') || 0 : 0,
      sitToday: s.get('sitDay') === day ? s.get('sitToday') || 0 : 0,
      sitters,
      // 免費方案每天只能寫 10 萬列：日期只在換日時才寫
      newDay: s.get('day') !== day,
      newSitDay: s.get('sitDay') !== day,
    };
  }

  view({ total, today, sitToday, sitters }, key) {
    const others = Object.keys(sitters)
      .filter((k) => k !== key)
      .slice(0, OTHERS_MAX)
      .map((k) => sitters[k].n);
    return {
      total,
      today,
      sittingNow: Object.keys(sitters).length,
      sitToday,
      others,
      bowedToYou: sitters[key]?.b || 0,
    };
  }

  async stats(ip) {
    return this.view(await this.load(), await this.seatKey(ip));
  }

  async incense(ip) {
    const now = Date.now();
    const state = await this.load();
    if (now - (this.lastByIp.get(ip) || 0) < RATE_MS) return { ...this.view(state), counted: false };
    this.lastByIp.set(ip, now);
    if (this.lastByIp.size > MAX_TRACKED_IPS) {
      for (const [key, at] of this.lastByIp) if (now - at >= RATE_MS) this.lastByIp.delete(key);
    }
    state.total += 1;
    state.today += 1;
    await this.ctx.storage.put({ total: state.total, today: state.today, ...(state.newDay && { day: taipeiDay() }) });
    return { ...this.view(state), counted: true };
  }

  async sit(ip, minutes, name) {
    const key = await this.seatKey(ip);
    const state = await this.load();
    const seated = key in state.sitters || Object.keys(state.sitters).length < MAX_SITTERS;
    if (!seated) return { ...this.view(state, key), seated: false };
    // 同一個 IP 已經坐著：只延長時間，不重複算「今天坐過」
    if (!(key in state.sitters)) state.sitToday += 1;
    // 重新坐下就重新算合十
    state.sitters[key] = { e: Date.now() + minutes * 60_000, n: name, b: 0 };
    await this.ctx.storage.put({
      sitters: state.sitters,
      sitToday: state.sitToday,
      ...(state.newSitDay && { sitDay: taipeiDay() }),
    });
    return { ...this.view(state, key), seated: true };
  }

  async stand(ip) {
    const key = await this.seatKey(ip);
    const state = await this.load();
    if (key in state.sitters) {
      delete state.sitters[key];
      await this.ctx.storage.put('sitters', state.sitters);
    }
    return this.view(state, key);
  }

  // 向現在一起坐的人合十：每次坐下只能一次，別人的 b 加一
  async bow(ip) {
    const key = await this.seatKey(ip);
    const state = await this.load();
    const me = state.sitters[key];
    const others = Object.keys(state.sitters).filter((k) => k !== key);
    if (!me || me.g || others.length === 0) return { ...this.view(state, key), bowed: 0 };
    me.g = 1;
    for (const k of others) state.sitters[k].b += 1;
    await this.ctx.storage.put('sitters', state.sitters);
    return { ...this.view(state, key), bowed: others.length };
  }
}

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin',
});

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    if (!ALLOWED_ORIGINS.includes(origin) && !LOCAL_ORIGIN.test(origin)) {
      return new Response('forbidden', { status: 403 });
    }
    const headers = corsHeaders(origin);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });

    const hall = env.TEMPLE_HALL.get(env.TEMPLE_HALL.idFromName('main'));
    const ip = request.headers.get('CF-Connecting-IP') || 'local';
    const json = (data) =>
      new Response(JSON.stringify(data), {
        headers: { ...headers, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });

    if (request.method === 'GET' && url.pathname === '/stats') return json(await hall.stats(ip));
    if (request.method === 'POST') {
      if (url.pathname === '/incense') return json(await hall.incense(ip));
      if (url.pathname === '/stand') return json(await hall.stand(ip));
      if (url.pathname === '/bow') return json(await hall.bow(ip));
      if (url.pathname === '/sit') {
        const body = await request.json().catch(() => ({}));
        const minutes = SIT_MINUTES.includes(body.minutes) ? body.minutes : 1;
        const name = Number.isInteger(body.name) && body.name >= 0 && body.name <= NAME_MAX ? body.name : 0;
        return json(await hall.sit(ip, minutes, name));
      }
    }
    return new Response('not found', { status: 404, headers });
  },
};
