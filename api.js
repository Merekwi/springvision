(() => {
  'use strict';

  const config = window.SPRINGVISION_CONFIG || {};
  const telegram = window.Telegram?.WebApp || null;

  if (telegram) {
    try {
      telegram.ready();
      telegram.expand();
    } catch (_) {}
  }

  const getInitData = () => telegram && typeof telegram.initData === 'string' ? telegram.initData : '';
  const configured = () => Boolean(config.supabaseUrl && config.supabaseAnonKey);
  const apiUrl = () => config.supabaseUrl.replace(/\/$/, '') + '/functions/v1/api';

  function friendlyError(message, status) {
    const text = String(message || '');
    if (status === 401 || /подпись telegram не прошла|сессия telegram устарела|invalid jwt/i.test(text)) {
      return 'Сессия устарела. Закрой мини-приложение и открой его заново через Telegram.';
    }
    if (status === 503) return 'Сервис временно недоступен. Попробуй ещё раз чуть позже.';
    if (/failed to fetch|networkerror|load failed|network request failed|fetch failed/i.test(text)) {
      return 'Нет связи с сервером. Проверь интернет и попробуй ещё раз.';
    }
    if (/postgrest|postgres|sqlstate|duplicate key|violates .*constraint|permission denied|relation .* does not exist|column .* does not exist|pgrst\d+|internal server error/i.test(text)) {
      return 'Не получилось сохранить данные. Попробуй ещё раз. Если ошибка повторится, напиши @merekwi.';
    }
    return text || 'Что-то пошло не так. Попробуй ещё раз.';
  }

  function requireTelegramSession() {
    if (!configured()) throw new Error('Сервис сейчас недоступен. Попробуй позже.');
    const initData = getInitData();
    if (!initData) throw new Error('Открой SpringVision через Telegram, чтобы войти.');
    return initData;
  }

  async function readResponse(response) {
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(friendlyError(result.error || result.message, response.status));
    return result;
  }

  async function request(action, payload = {}) {
    const initData = requireTelegramSession();
    let response;
    try {
      response = await fetch(apiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.supabaseAnonKey,
          'x-telegram-init-data': initData
        },
        body: JSON.stringify({ ...(payload || {}), action })
      });
    } catch (error) {
      throw new Error(friendlyError(error?.message || 'Failed to fetch'));
    }
    return readResponse(response);
  }

  async function requestForm(action, payload = {}, fileField, file) {
    const initData = requireTelegramSession();
    const form = new FormData();

    Object.entries(payload || {}).forEach(([key, value]) => {
      if (key !== 'action' && key !== 'initData' && value !== undefined && value !== null) {
        form.append(key, String(value));
      }
    });
    form.append('action', action);
    form.append('initData', initData);

    if (Array.isArray(fileField)) {
      fileField.forEach(item => {
        if (item?.file && item?.name) form.append(item.name, item.file, item.file.name);
      });
    } else if (file && fileField) {
      form.append(fileField, file, file.name);
    }

    let response;
    try {
      response = await fetch(apiUrl(), {
        method: 'POST',
        headers: {
          'apikey': config.supabaseAnonKey,
          'x-telegram-init-data': initData
        },
        body: form
      });
    } catch (error) {
      throw new Error(friendlyError(error?.message || 'Failed to fetch'));
    }
    return readResponse(response);
  }

  window.SpringVisionAPI = { configured, request, requestForm, telegram };
})();
