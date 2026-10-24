import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-telegram-init-data",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const POINTS = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1];
const BUCKET = "springvision-private";
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });

function equalHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
function toHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyTelegramInitData(initData: string, botToken: string) {
  const params = new URLSearchParams(initData);
  const receivedHash = params.get("hash");
  const authDate = Number(params.get("auth_date") || 0);
  const userRaw = params.get("user");
  if (!receivedHash || !userRaw || !Number.isFinite(authDate)) throw new Error("Не удалось проверить Telegram initData.");
  if (Math.abs(Date.now() / 1000 - authDate) > 86400) throw new Error("Сессия Telegram устарела. Откройте мини-приложение заново.");

  const checkString = [...params.entries()]
    .filter(([key]) => key !== "hash")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const encoder = new TextEncoder();
  const botTokenKey = await crypto.subtle.importKey(
    "raw", encoder.encode(botToken), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const secret = await crypto.subtle.sign("HMAC", botTokenKey, encoder.encode("WebAppData"));
  const signingKey = await crypto.subtle.importKey(
    "raw", secret, { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const calculatedHash = toHex(await crypto.subtle.sign("HMAC", signingKey, encoder.encode(checkString)));
  if (!equalHex(calculatedHash, receivedHash)) throw new Error("Подпись Telegram не прошла проверку.");

  const user = JSON.parse(userRaw);
  if (!user?.id || !Number.isSafeInteger(Number(user.id))) throw new Error("В данных Telegram нет корректного ID пользователя.");
  return {
    telegramId: Number(user.id),
    username: typeof user.username === "string" ? user.username : null,
    displayName: [user.first_name, user.last_name].filter((x) => typeof x === "string" && x.trim()).join(" ").slice(0, 160) || "Участник",
  };
}

async function sendTelegram(botToken: string, telegramId: number, text: string) {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: telegramId, text, disable_web_page_preview: true }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) throw new Error(data.description || "Telegram sendMessage failed");
}

async function runJuryCron(db: any, botToken: string) {
  const now = Date.now();
  const seasonsResult = await db.from("seasons").select("id,title,jury_deadline").eq("status","jury_voting").eq("jury_voting_open",true);
  if (seasonsResult.error) throw new Error(seasonsResult.error.message);
  let remindersSent = 0, remindersFailed = 0, randomBallots = 0, closedSeasons = 0;
  for (const season of seasonsResult.data || []) {
    const juriesResult = await db.from("season_jury").select("user_id,submission_id").eq("season_id",season.id).is("revoked_at",null);
    const submissionsResult = await db.from("submissions").select("id,user_id").eq("season_id",season.id).eq("status","approved");
    const votesResult = await db.from("jury_votes").select("juror_id").eq("season_id",season.id);
    if (juriesResult.error || submissionsResult.error || votesResult.error) throw new Error("Не удалось проверить состояние жюри.");
    const juries = juriesResult.data || [];
    const submissions = submissionsResult.data || [];
    const voted = new Set((votesResult.data || []).map((row: any) => row.juror_id));
    const deadlinePassed = Boolean(season.jury_deadline && now >= Date.parse(season.jury_deadline));
    for (const juror of juries) {
      if (voted.has(juror.user_id)) continue;
      if (deadlinePassed) {
        const ownId = juror.submission_id || submissions.find((row: any) => row.user_id === juror.user_id)?.id || null;
        const eligible = submissions.filter((row: any) => row.id !== ownId);
        for (let i=eligible.length-1;i>0;i--) {
          const j=crypto.getRandomValues(new Uint32Array(1))[0]%(i+1);
          [eligible[i],eligible[j]]=[eligible[j],eligible[i]];
        }
        if (eligible.length < 10) continue;
        const ballot = await db.from("jury_votes").insert(POINTS.map((points,index)=>({
          season_id:season.id,juror_id:juror.user_id,target_submission_id:eligible[index].id,points,is_random_fallback:true
        })));
        if (!ballot.error) randomBallots++;
        else if (ballot.error.code !== "23505") throw new Error("Не удалось создать резервный голос жюри: "+ballot.error.message);
      } else {
        const profileResult=await db.from("profiles").select("telegram_id").eq("id",juror.user_id).maybeSingle();
        if (!profileResult.data?.telegram_id) continue;
        try {
          await sendTelegram(botToken,Number(profileResult.data.telegram_id),`Напоминание SpringVision: вы ещё не отправили оценки жюри для сезона «${season.title}». Дедлайн: ${season.jury_deadline ? new Date(season.jury_deadline).toLocaleString("ru-RU",{timeZone:"Europe/Moscow"}) : "не установлен"}.`);
          remindersSent++;
        } catch { remindersFailed++; }
      }
    }
    if (deadlinePassed) {
      await db.from("seasons").update({jury_voting_open:false}).eq("id",season.id);
      await db.from("audit_log").insert({actor_id:null,action:"jury_deadline_closed",entity_type:"season",entity_id:season.id,details:{random_ballots:randomBallots}});
      closedSeasons++;
    }
  }
  return json({ok:true,remindersSent,remindersFailed,randomBallots,closedSeasons});
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Используйте POST." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const ownerIdRaw = Deno.env.get("SPRINGVISION_OWNER_TELEGRAM_ID");
  if (!supabaseUrl || !serviceRoleKey || !botToken || !ownerIdRaw) {
    return json({ error: "Сервер не настроен: проверьте переменные окружения Edge Function." }, 503);
  }

  let form: FormData | null = null;
  let body: Record<string, unknown> = {};
  try {
    if ((request.headers.get("content-type") || "").includes("multipart/form-data")) {
      form = await request.formData();
      body = Object.fromEntries([...form.entries()].filter(([, value]) => typeof value === "string")) as Record<string, unknown>;
    } else {
      body = await request.json();
    }
  } catch {
    return json({ error: "Некорректное тело запроса." }, 400);
  }

  const action = String(body.action || "");
  const db = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  if (action === "cron_jury_reminders") {
    const cronSecret = Deno.env.get("SPRINGVISION_CRON_SECRET") || "";
    const supplied = request.headers.get("x-cron-secret") || "";
    if (!cronSecret || !supplied || !equalHex(supplied, cronSecret)) return json({ error: "Unauthorized cron request." }, 401);
    try { return await runJuryCron(db, botToken); }
    catch (error) { return json({ error: error instanceof Error ? error.message : "Ошибка фоновой задачи." }, 500); }
  }

  const initData = String(request.headers.get("x-telegram-init-data") || body.initData || "");
  let telegramUser;
  try {
    telegramUser = await verifyTelegramInitData(initData, botToken);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Ошибка авторизации Telegram." }, 401);
  }

  const isOwner = String(telegramUser.telegramId) === ownerIdRaw.trim();
  const profilePayload: Record<string, unknown> = {
    telegram_id: telegramUser.telegramId,
    telegram_username: telegramUser.username,
    display_name: telegramUser.displayName,
  };
  if (isOwner) profilePayload.role = "super_admin";

  const profileResult = await db.from("profiles")
    .upsert(profilePayload, { onConflict: "telegram_id" })
    .select("id,telegram_id,telegram_username,display_name,role")
    .single();
  if (profileResult.error || !profileResult.data) {
    return json({ error: "Не удалось создать профиль пользователя.", detail: profileResult.error?.message }, 500);
  }
  const profile = profileResult.data;
  const isAdmin = profile.role === "admin" || profile.role === "super_admin";

  const requireAdmin = () => {
    if (!isAdmin) throw new Error("Недостаточно прав: требуется администратор.");
  };
  const writeAudit = async (name: string, entityType: string, entityId?: string, details: Record<string, unknown> = {}) => {
    await db.from("audit_log").insert({ actor_id: profile.id, action: name, entity_type: entityType, entity_id: entityId || null, details });
  };
  const seasonById = async (id: string) => {
    const result = await db.from("seasons").select("*").eq("id", id).maybeSingle();
    if (result.error || !result.data) throw new Error("Сезон не найден.");
    return result.data;
  };
  const uploadFile = async (file: File, path: string) => {
    if (!file.size) throw new Error("Файл пустой.");
    if (file.size > 50 * 1024 * 1024) throw new Error("Файл превышает лимит 50 МБ.");
    const allowed = ["video/mp4", "video/webm", "video/quicktime", "image/png", "image/jpeg"];
    if (!allowed.includes(file.type)) throw new Error("Недопустимый тип файла.");
    const result = await db.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
    if (result.error) throw new Error("Не удалось загрузить файл: " + result.error.message);
    return path;
  };

  try {
    switch (action) {
      case "me":
        return json({ profile, isAdmin });

      case "public_state": {
        const seasonResult = await db.from("seasons").select("*").not("status", "eq", "archived").order("season_number", { ascending: false }).limit(1).maybeSingle();
        if (seasonResult.error) throw new Error(seasonResult.error.message);
        const season = seasonResult.data;
        if (!season) return json({ profile, isAdmin, season: null, submissions: [], countries: [], reservedCountryCodes: [], ownSubmissionId: null, juryResults: null, televoteResults: null, overallResults: null });
        const juryRole = await db.from("season_jury").select("user_id").eq("season_id", season.id).eq("user_id", profile.id).is("revoked_at", null).maybeSingle();
        const canSeeParticipants = isAdmin || season.participant_list_published || Boolean(juryRole.data);
        let submissions: Record<string, unknown>[] = [];
        if (canSeeParticipants) {
          const result = await db.from("submissions")
            .select("id,country_code,artist,song_title,performance_url,recap_storage_path,performance_order,status")
            .eq("season_id", season.id).eq("status", "approved").order(season.draw_published || isAdmin ? "performance_order" : "created_at", { ascending: true, nullsFirst: false });
          if (result.error) throw new Error(result.error.message);
          submissions = result.data || [];
        }
        const ownSubmissionResult = await db.from("submissions").select("id").eq("season_id",season.id).eq("user_id",profile.id).eq("status","approved").maybeSingle();
        if (ownSubmissionResult.error) throw new Error(ownSubmissionResult.error.message);
        const ownSubmissionId = ownSubmissionResult.data?.id || null;
        const publicSeason = {
          id: season.id, season_number: season.season_number, title: season.title, logo_url: season.logo_url,
          description: season.description, status: season.status, registration_opens_at: season.registration_opens_at,
          registration_closes_at: season.registration_closes_at, jury_deadline: season.jury_deadline, contest_at: season.contest_at,
          participant_list_published: season.participant_list_published, draw_published: season.draw_published,
          jury_voting_open: season.jury_voting_open && Boolean(juryRole.data), jury_results_published: season.jury_results_published,
          televote_open: season.televote_open, televote_results_published: season.televote_results_published,
          overall_results_published: season.overall_results_published,
          twitch_published: Boolean(season.twitch_published),
          recording_url: null as string | null,
          twitch_url: season.twitch_published ? season.twitch_url : null,
        };
        const totals = async (table: "jury_votes" | "televote_points") => {
          if (table === "jury_votes") {
            const { data, error } = await db.from("jury_votes").select("target_submission_id,points").eq("season_id", season.id);
            if (error) throw new Error(error.message);
            return data || [];
          }
          const { data: ballots, error: ballotError } = await db.from("televote_ballots").select("id").eq("season_id", season.id);
          if (ballotError) throw new Error(ballotError.message);
          if (!ballots?.length) return [];
          const { data, error } = await db.from("televote_points").select("target_submission_id,points").in("ballot_id", ballots.map(b => b.id));
          if (error) throw new Error(error.message);
          return data || [];
        };
        const aggregate = (rows: Array<{target_submission_id:string;points:number}>) => {
          const map = new Map<string, number>();
          rows.forEach(row => map.set(row.target_submission_id, (map.get(row.target_submission_id) || 0) + row.points));
          return submissions.map(s => ({ submission_id: String(s.id), points: map.get(String(s.id)) || 0 })).sort((a,b) => b.points - a.points);
        };
        let juryResults = null, televoteResults = null, overallResults = null;
        if (season.jury_results_published) juryResults = aggregate(await totals("jury_votes"));
        if (season.televote_results_published) televoteResults = aggregate(await totals("televote_points"));
        if (season.overall_results_published) {
          const jury = aggregate(await totals("jury_votes"));
          const televote = aggregate(await totals("televote_points"));
          const sum = new Map<string, number>();
          [...jury, ...televote].forEach((row: { submission_id: string; points: number }) => sum.set(String(row.submission_id), (sum.get(String(row.submission_id)) || 0) + row.points));
          overallResults = [...sum.entries()].map(([submission_id, points]) => ({ submission_id, points })).sort((a,b) => b.points - a.points);
        }
        const reservedResult = await db.from("submissions").select("country_code").eq("season_id", season.id).in("status", ["pending","approved"]);
        if (reservedResult.error) throw new Error(reservedResult.error.message);
        const reservedCountryCodes = [...new Set((reservedResult.data || []).map(row => row.country_code))];
        const countriesResult = await db.from("countries").select("code,name,flag_path").eq("enabled", true).order("name");
        if (countriesResult.error) throw new Error(countriesResult.error.message);
        if (season.recording_published && season.recording_storage_path) {
          const recording = await db.storage.from(BUCKET).createSignedUrl(season.recording_storage_path, 3600);
          publicSeason.recording_url = recording.data?.signedUrl || null;
        }
        const submissionsWithUrls = await Promise.all(submissions.map(async (row) => {
          const path = typeof row.recap_storage_path === "string" ? row.recap_storage_path : "";
          const publicOrder = isAdmin || season.draw_published;
          const safeRow = { ...row, performance_order: publicOrder ? row.performance_order : null };
          if (!path) return { ...safeRow, recap_url: null };
          const signed = await db.storage.from(BUCKET).createSignedUrl(path, 3600);
          return { ...safeRow, recap_url: signed.data?.signedUrl || null };
        }));
        return json({ profile, isAdmin, season: publicSeason, submissions: submissionsWithUrls, countries: countriesResult.data || [], reservedCountryCodes, ownSubmissionId, juryResults, televoteResults, overallResults, juryEligible: Boolean(juryRole.data) });
      }

      case "submit_application": {
        if (!form) throw new Error("Для заявки нужен multipart/form-data с файлом рекапа.");
        const seasonId = String(body.seasonId || "");
        const countryCode = String(body.countryCode || "");
        const artist = String(body.artist || "").trim();
        const songTitle = String(body.songTitle || "").trim();
        const performanceUrl = String(body.performanceUrl || "").trim();
        const recap = form.get("recap");
        if (!(recap instanceof File)) throw new Error("Прикрепите 30-секундный рекап.");
        if (!seasonId || !countryCode || !artist || !songTitle || !/^https?:\/\//i.test(performanceUrl)) throw new Error("Проверьте все поля заявки.");
        const season = await seasonById(seasonId);
        const now = Date.now();
        if (season.status !== "registration" || !season.registration_opens_at || !season.registration_closes_at ||
            now < Date.parse(season.registration_opens_at) || now > Date.parse(season.registration_closes_at)) {
          throw new Error("Регистрация сейчас закрыта.");
        }
        const country = await db.from("countries").select("code").eq("code", countryCode).eq("enabled", true).maybeSingle();
        if (!country.data) throw new Error("Страна не найдена или недоступна.");
        const path = `recaps/${seasonId}/${crypto.randomUUID()}-${recap.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80)}`;
        await uploadFile(recap, path);
        const result = await db.from("submissions").insert({
          season_id: seasonId, user_id: profile.id, country_code: countryCode, artist, song_title: songTitle,
          performance_url: performanceUrl, recap_storage_path: path, status: "pending",
        }).select("id,status").single();
        if (result.error) {
          await db.storage.from(BUCKET).remove([path]);
          if (result.error.code === "23505") throw new Error("Эта страна или ваш аккаунт уже заняты заявкой в текущем сезоне.");
          throw new Error("Не удалось сохранить заявку: " + result.error.message);
        }
        await writeAudit("submission_created", "submission", result.data.id, { season_id: seasonId, country_code: countryCode });
        return json({ ok: true, submission: result.data, message: "Заявка отправлена на модерацию." });
      }

      case "my_submissions": {
        const result = await db.from("submissions").select("id,season_id,country_code,artist,song_title,status,moderation_comment,created_at,seasons(title,season_number)")
          .eq("user_id", profile.id).order("created_at", { ascending: false });
        if (result.error) throw new Error(result.error.message);
        return json({ submissions: result.data || [] });
      }

      case "admin_list_seasons": {
        requireAdmin();
        const result = await db.from("seasons").select("*").order("season_number", { ascending: false });
        if (result.error) throw new Error(result.error.message);
        return json({ seasons: result.data || [] });
      }

      case "admin_set_role": {
        if (profile.role !== "super_admin") throw new Error("Назначать администраторов может только главный администратор.");
        const telegramId = Number(body.telegramId);
        const role = String(body.role || "");
        if (!Number.isSafeInteger(telegramId) || telegramId < 1 || !["user","admin"].includes(role)) throw new Error("Укажите Telegram ID и роль user/admin.");
        if (telegramId === Number(profile.telegram_id)) throw new Error("Нельзя изменить собственную роль главного администратора.");
        const target = await db.from("profiles").select("id,role").eq("telegram_id",telegramId).maybeSingle();
        if (target.error || !target.data) throw new Error("Пользователь не найден. Он должен хотя бы один раз открыть мини-приложение.");
        if (target.data.role === "super_admin") throw new Error("Роль главного администратора нельзя изменить этим действием.");
        const result = await db.from("profiles").update({role}).eq("id",target.data.id).select("telegram_id,telegram_username,display_name,role").single();
        if (result.error) throw new Error(result.error.message);
        await writeAudit("user_role_changed","profile",target.data.id,{role});
        return json({ profile: result.data });
      }

      case "admin_recap_downloads": {
        requireAdmin();
        const seasonId = String(body.seasonId || "");
        if (!seasonId) throw new Error("Не указан сезон.");
        const result = await db.from("submissions").select("id,country_code,artist,song_title,performance_order,recap_storage_path")
          .eq("season_id",seasonId).eq("status","approved").order("performance_order",{ascending:true,nullsFirst:false});
        if (result.error) throw new Error(result.error.message);
        const recaps = await Promise.all((result.data || []).map(async (row) => {
          if (!row.recap_storage_path) return {...row,recap_url:null};
          const signed = await db.storage.from(BUCKET).createSignedUrl(row.recap_storage_path,3600);
          return {...row,recap_url:signed.data?.signedUrl || null};
        }));
        return json({ recaps });
      }

      case "admin_create_season": {
        requireAdmin();
        const seasonNumber = Number(body.seasonNumber);
        const title = String(body.title || "").trim();
        if (!Number.isInteger(seasonNumber) || seasonNumber < 1 || !title) throw new Error("Укажите номер и название сезона.");
        const result = await db.from("seasons").insert({
          season_number: seasonNumber, title, logo_url: body.logoUrl || null, description: body.description || null,
          registration_opens_at: body.registrationOpensAt || null, registration_closes_at: body.registrationClosesAt || null,
          jury_deadline: body.juryDeadline || null, contest_at: body.contestAt || null,
          televote_minutes: Number(body.televoteMinutes || 60), created_by: profile.id,
        }).select("*").single();
        if (result.error) throw new Error("Не удалось создать сезон: " + result.error.message);
        await writeAudit("season_created", "season", result.data.id, { season_number: seasonNumber });
        return json({ season: result.data });
      }

      case "admin_list_submissions": {
        requireAdmin();
        const seasonId = String(body.seasonId || "");
        if (!seasonId) throw new Error("Не указан сезон.");
        const result = await db.from("submissions").select("*,countries(name,flag_path),profiles!submissions_user_id_fkey(telegram_id,telegram_username,display_name)")
          .eq("season_id", seasonId).order("created_at", { ascending: true });
        if (result.error) throw new Error(result.error.message);
        return json({ submissions: result.data || [] });
      }

      case "admin_review_submission": {
        requireAdmin();
        const submissionId = String(body.submissionId || "");
        const status = String(body.status || "");
        const comment = String(body.comment || "").trim();
        if (!submissionId || !["approved","rejected"].includes(status)) throw new Error("Некорректное решение модерации.");
        const current = await db.from("submissions").select("id,season_id,user_id,country_code,artist,song_title,status").eq("id", submissionId).maybeSingle();
        if (current.error || !current.data) throw new Error("Заявка не найдена.");
        const update = await db.from("submissions").update({
          status, moderation_comment: status === "rejected" ? comment : null, reviewed_by: profile.id, reviewed_at: new Date().toISOString(),
        }).eq("id", submissionId).select("*").single();
        if (update.error) throw new Error("Не удалось сохранить решение: " + update.error.message);
        if (status === "approved") {
          const role = await db.from("season_jury").upsert({ season_id: current.data.season_id, user_id: current.data.user_id, submission_id: submissionId, revoked_at: null }, { onConflict: "season_id,user_id" });
          if (role.error) throw new Error("Заявка одобрена, но роль жюри не выдана: " + role.error.message);
        }
        const target = await db.from("profiles").select("telegram_id").eq("id", current.data.user_id).maybeSingle();
        if (target.data?.telegram_id) {
          const message = status === "approved"
            ? `Ваша заявка SpringVision на «${current.data.country_code}» одобрена. Вам выдано право жюри на этот сезон.`
            : `Ваша заявка SpringVision отклонена.${comment ? "\nКомментарий: " + comment : ""}`;
          try { await sendTelegram(botToken, Number(target.data.telegram_id), message); } catch { /* The user may not have started the bot. */ }
        }
        await writeAudit("submission_" + status, "submission", submissionId, { comment });
        return json({ submission: update.data });
      }

      case "admin_set_season": {
        requireAdmin();
        const seasonId = String(body.seasonId || "");
        if (!seasonId) throw new Error("Не указан сезон.");
        const allowed = ["title","logo_url","description","status","registration_opens_at","registration_closes_at","jury_deadline","contest_at","televote_minutes","participant_list_published","draw_published","jury_voting_open","jury_results_published","televote_open","televote_results_published","overall_results_published","twitch_url","twitch_published","recording_published","recording_storage_path","combined_recap_storage_path"];
        const patch: Record<string, unknown> = {};
        for (const key of allowed) if (Object.prototype.hasOwnProperty.call(body, key)) patch[key] = body[key];
        if (!Object.keys(patch).length) throw new Error("Нет параметров для обновления.");
        const result = await db.from("seasons").update(patch).eq("id", seasonId).select("*").single();
        if (result.error) throw new Error("Не удалось обновить сезон: " + result.error.message);
        if (patch.status === "finished" || patch.status === "archived") {
          await db.from("season_jury").update({revoked_at:new Date().toISOString()}).eq("season_id",seasonId).is("revoked_at",null);
        }
        await writeAudit("season_settings_updated", "season", seasonId, patch);
        return json({ season: result.data });
      }

      case "admin_draw": {
        requireAdmin();
        const seasonId = String(body.seasonId || "");
        const result = await db.from("submissions").select("id").eq("season_id", seasonId).eq("status", "approved");
        if (result.error) throw new Error(result.error.message);
        const shuffled = [...(result.data || [])];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        for (let i = 0; i < shuffled.length; i++) {
          const update = await db.from("submissions").update({ performance_order: i + 1 }).eq("id", shuffled[i].id);
          if (update.error) throw new Error("Ошибка жеребьёвки: " + update.error.message);
        }
        await db.from("seasons").update({ status: "drawn", draw_published: false, participant_list_published: false }).eq("id", seasonId);
        await writeAudit("draw_generated", "season", seasonId, { participants: shuffled.length });
        return json({ count: shuffled.length, published: false });
      }

      case "jury_submit": {
        const seasonId = String(body.seasonId || "");
        const votes = body.votes as Array<{ submissionId: string; points: number }>;
        if (!Array.isArray(votes) || votes.length !== 10) throw new Error("Нужно распределить ровно 10 оценок.");
        if ([...votes].map(v => v.points).sort((a,b)=>b-a).join(",") !== POINTS.join(",")) throw new Error("Используйте баллы 12, 10 и от 8 до 1 без повторов.");
        if (new Set(votes.map(v=>v.submissionId)).size !== 10) throw new Error("Нельзя голосовать за одну страну дважды.");
        const season = await seasonById(seasonId);
        if (!season.jury_voting_open || season.status !== "jury_voting") throw new Error("Голосование жюри закрыто.");
        if (season.jury_deadline && Date.now() > Date.parse(season.jury_deadline)) throw new Error("Срок голосования истёк.");
        const jury = await db.from("season_jury").select("submission_id").eq("season_id",seasonId).eq("user_id",profile.id).is("revoked_at",null).maybeSingle();
        if (!jury.data) throw new Error("У вас нет права жюри в этом сезоне.");
        const own = await db.from("submissions").select("id").eq("season_id",seasonId).eq("user_id",profile.id).eq("status","approved").maybeSingle();
        const targets = await db.from("submissions").select("id,user_id,status").eq("season_id",seasonId).in("id",votes.map(v=>v.submissionId)).eq("status","approved");
        if (targets.error || targets.data?.length !== 10) throw new Error("В голосовании есть участник, которого нет в утверждённом списке.");
        const ownSubmissionId = own.data?.id;
        if (ownSubmissionId && votes.some(v=>v.submissionId===ownSubmissionId)) throw new Error("Нельзя голосовать за собственную заявку.");
        await db.from("jury_votes").delete().eq("season_id",seasonId).eq("juror_id",profile.id).eq("is_random_fallback",false);
        const saved = await db.from("jury_votes").insert(votes.map(v=>({season_id:seasonId,juror_id:profile.id,target_submission_id:v.submissionId,points:v.points})));
        if (saved.error) throw new Error("Не удалось сохранить голос жюри: " + saved.error.message);
        await writeAudit("jury_vote_submitted","season",seasonId);
        return json({ ok: true });
      }

      case "televote_submit": {
        const seasonId = String(body.seasonId || "");
        const votes = body.votes as Array<{ submissionId: string; points: number }>;
        if (!Array.isArray(votes) || votes.length !== 10) throw new Error("Нужно распределить ровно 10 оценок.");
        if ([...votes].map(v=>v.points).sort((a,b)=>b-a).join(",") !== POINTS.join(",")) throw new Error("Используйте баллы 12, 10 и от 8 до 1 без повторов.");
        if (new Set(votes.map(v=>v.submissionId)).size !== 10) throw new Error("Нельзя голосовать за одну страну дважды.");
        const season = await seasonById(seasonId);
        if (!season.televote_open || season.status !== "televoting") throw new Error("Телеголосование закрыто.");
        const targets = await db.from("submissions").select("id").eq("season_id",seasonId).eq("status","approved").in("id",votes.map(v=>v.submissionId));
        if (targets.error || targets.data?.length !== 10) throw new Error("В списке есть недоступный участник.");
        const ballot = await db.from("televote_ballots").insert({season_id:seasonId,voter_id:profile.id}).select("id").single();
        if (ballot.error) throw new Error(ballot.error.code === "23505" ? "Вы уже голосовали в этом телеголосовании." : ballot.error.message);
        const points = await db.from("televote_points").insert(votes.map(v=>({ballot_id:ballot.data.id,target_submission_id:v.submissionId,points:v.points})));
        if (points.error) {
          await db.from("televote_ballots").delete().eq("id",ballot.data.id);
          throw new Error("Не удалось сохранить телеголосование: " + points.error.message);
        }
        await writeAudit("televote_submitted","season",seasonId);
        return json({ ok: true });
      }

      case "admin_upload_recording": {
        requireAdmin();
        if (!form) throw new Error("Прикрепите файл записи.");
        const seasonId = String(body.seasonId || "");
        const file = form.get("file");
        if (!(file instanceof File)) throw new Error("Файл записи не найден.");
        const path = `recordings/${seasonId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,"_").slice(-80)}`;
        await uploadFile(file,path);
        const update = await db.from("seasons").update({recording_storage_path:path}).eq("id",seasonId);
        if (update.error) { await db.storage.from(BUCKET).remove([path]); throw new Error(update.error.message); }
        await writeAudit("recording_uploaded","season",seasonId);
        return json({ ok:true, path });
      }

      case "admin_notify": {
        requireAdmin();
        const audience = String(body.audience || "");
        const title = String(body.title || "").trim();
        const message = String(body.message || "").trim();
        const seasonId = body.seasonId ? String(body.seasonId) : null;
        if (!["all","participants","jury","unvoted_jury"].includes(audience) || !title || !message) throw new Error("Проверьте аудиторию, заголовок и текст уведомления.");
        const notification = await db.from("notifications").insert({season_id:seasonId,created_by:profile.id,audience,title,message}).select("id").single();
        if (notification.error) throw new Error(notification.error.message);
        let recipientIds: string[] = [];
        if (audience === "all") {
          const r=await db.from("profiles").select("id"); recipientIds=(r.data||[]).map(x=>x.id);
        } else if (audience === "participants" && seasonId) {
          const r=await db.from("submissions").select("user_id").eq("season_id",seasonId).eq("status","approved"); recipientIds=[...new Set((r.data||[]).map(x=>x.user_id))];
        } else if ((audience === "jury" || audience === "unvoted_jury") && seasonId) {
          const r=await db.from("season_jury").select("user_id").eq("season_id",seasonId).is("revoked_at",null); recipientIds=[...new Set((r.data||[]).map(x=>x.user_id))];
          if (audience==="unvoted_jury") {
            const votes=await db.from("jury_votes").select("juror_id").eq("season_id",seasonId);
            const voted=new Set((votes.data||[]).map(x=>x.juror_id)); recipientIds=recipientIds.filter(id=>!voted.has(id));
          }
        }
        const recipients=recipientIds.length?await db.from("profiles").select("id,telegram_id").in("id",recipientIds):{data:[],error:null};
        let sent=0,failed=0;
        for (const recipient of recipients.data||[]) {
          let status="sent", errorText=null;
          try { await sendTelegram(botToken,Number(recipient.telegram_id),`${title}\n\n${message}`); sent++; }
          catch (e) { status="blocked"; errorText=e instanceof Error?e.message:"Telegram delivery failed"; failed++; }
          await db.from("notification_deliveries").upsert({notification_id:notification.data.id,user_id:recipient.id,status,error_text:errorText,attempted_at:new Date().toISOString()},{onConflict:"notification_id,user_id"});
        }
        await writeAudit("notification_sent","notification",notification.data.id,{audience,sent,failed});
        return json({ok:true,sent,failed,notice:"Telegram не может написать пользователю, который никогда не запускал бота."});
      }

      default:
        return json({ error: "Неизвестное действие API." }, 400);
    }
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Внутренняя ошибка." }, 400);
  }
});
