import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

const REPLY_TEXT =
  "🤖 Это автоматический бот SpringVision.\n" +
  "Бот не принимает сообщения, и ваше сообщение никто не получит.\n\n" +
  "Регистрация и голосование проходят в мини-приложении. Нажмите кнопку OPEN слева внизу.\n\n" +
  "По техническим вопросам: @merekwi";

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

type TelegramApiResponse = {
  httpStatus: number;
  ok?: boolean;
  description?: string;
  [key: string]: unknown;
};

async function telegramCall(token: string, method: string, body: Record<string, unknown> = {}): Promise<TelegramApiResponse> {
  const response = await fetch("https://api.telegram.org/bot" + token + "/" + method, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data: Record<string, unknown> = await response.json().catch((): Record<string, unknown> => ({}));
  return { httpStatus: response.status, ...data } as TelegramApiResponse;
}

function publicWebhookInfo(info: Record<string, any>) {
  let host: string | null = null;
  let path: string | null = null;
  if (typeof info.url === "string" && info.url) {
    try {
      const parsed = new URL(info.url);
      host = parsed.host;
      path = parsed.pathname;
    } catch {
      host = "invalid-url";
    }
  }
  return {
    configured: Boolean(info.url),
    host,
    path,
    pending_update_count: info.pending_update_count ?? null,
    last_error_date: info.last_error_date ?? null,
    last_error_message: info.last_error_message ?? null,
    allowed_updates: info.allowed_updates ?? [],
    max_connections: info.max_connections ?? null,
  };
}

async function checkPollingConflict(token: string) {
  const probe = await telegramCall(token, "getUpdates", { timeout: 1 });
  const description = String(probe.description || "");
  if (!probe.ok && /terminated by other getUpdates request|other getUpdates request/i.test(description)) {
    return { conflict: true, description };
  }
  if (!probe.ok && Number(probe.httpStatus) === 409) {
    return { conflict: true, description: description || "Telegram сообщил о конфликте getUpdates." };
  }
  if (!probe.ok) throw new Error(description || "Не удалось проверить режим получения обновлений Telegram.");
  return { conflict: false, description: "" };
}

async function sendReply(token: string, chatId: number, messageId: number) {
  const sent = await telegramCall(token, "sendMessage", {
    chat_id: chatId,
    text: REPLY_TEXT,
    reply_to_message_id: messageId,
    disable_web_page_preview: true,
  });
  if (!sent.ok) {
    const error = new Error(String(sent.description || "Telegram sendMessage failed"));
    (error as any).telegramStatus = Number(sent.httpStatus || 500);
    throw error;
  }
}

Deno.serve(async (request: Request) => {
  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!token || !supabaseUrl || !serviceRoleKey) {
    return json({ ok: false, error: "Не настроены серверные переменные Telegram/Supabase." }, 503);
  }

  if (request.method === "GET") return json({ ok: true, service: "SpringVision Telegram autoresponder", status: "active" });

  if (request.method !== "POST") return json({ ok: false, error: "Method not allowed." }, 405);

  const expectedSecret = await sha256Hex("SpringVision Telegram webhook v1:" + token);
  const receivedSecret = request.headers.get("x-telegram-bot-api-secret-token") || "";
  if (receivedSecret !== expectedSecret) return json({ ok: false, error: "Forbidden." }, 403);

  let update: Record<string, any>;
  try {
    update = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON." }, 400);
  }

  const updateId = Number(update.update_id);
  if (!Number.isSafeInteger(updateId) || updateId < 0) return json({ ok: false, error: "Invalid update_id." }, 400);
  const message = update.message;
  if (!message || !message.chat || !Number.isSafeInteger(Number(message.chat.id))) return json({ ok: true, ignored: true });
  if (message.from?.is_bot || message.chat.type !== "private") return json({ ok: true, ignored: true });

  const db = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const claim = await db.from("telegram_bot_updates")
    .insert({ update_id: updateId })
    .select("update_id")
    .maybeSingle();

  if (claim.error?.code === "23505") return json({ ok: true, duplicate: true });
  if (claim.error) {
    console.error("Could not claim Telegram update:", updateId, claim.error.message);
    return json({ ok: false, error: "Temporary database error." }, 503);
  }

  try {
    await sendReply(token, Number(message.chat.id), Number(message.message_id));
    if (updateId % 100 === 0) {
      await db.from("telegram_bot_updates").delete()
        .lt("received_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    }
    return json({ ok: true });
  } catch (error) {
    const status = Number((error as any)?.telegramStatus || 500);
    if (status === 429 || status >= 500) {
      await db.from("telegram_bot_updates").delete().eq("update_id", updateId);
      console.error("Temporary Telegram delivery error:", updateId);
      return json({ ok: false, error: "Telegram delivery temporarily failed." }, 503);
    }
    console.error("Telegram could not deliver autoresponse:", updateId, status);
    return json({ ok: true, delivery: "unavailable" });
  }
});