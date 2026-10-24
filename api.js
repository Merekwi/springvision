(() => {
  'use strict';
  const config = window.SPRINGVISION_CONFIG || {};
  const telegram = window.Telegram && window.Telegram.WebApp;
  if (telegram) {
    telegram.ready();
    telegram.expand();
  }
  const getInitData = () => telegram && typeof telegram.initData === 'string' ? telegram.initData : '';
  const configured = () => Boolean(config.supabaseUrl && config.supabaseAnonKey);
  async function request(action, payload = {}) {
    if (!configured()) throw new Error('Сервер конкурса не настроен: требуется подключить Supabase.');
    const initData = getInitData();
    if (!initData) throw new Error('Откройте SpringVision внутри Telegram, чтобы подтвердить аккаунт.');
    const response = await fetch(config.supabaseUrl.replace(/\/$/, '') + '/functions/v1/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.supabaseAnonKey,
        'x-telegram-init-data': initData
      },
      body: JSON.stringify({ action, ...payload })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Ошибка сервера SpringVision.');
    return result;
  }
  async function requestForm(action, payload, fileField, file) {
    if (!configured()) throw new Error('Сервер конкурса не настроен: требуется подключить Supabase.');
    const initData = getInitData();
    if (!initData) throw new Error('Откройте SpringVision внутри Telegram, чтобы подтвердить аккаунт.');
    const form = new FormData();
    form.append('action', action);
    form.append('initData', initData);
    Object.entries(payload || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) form.append(key, String(value));
    });
    if (Array.isArray(fileField)) {
      fileField.forEach(item => { if (item?.file && item?.name) form.append(item.name, item.file, item.file.name); });
    } else if (file && fileField) {
      form.append(fileField, file, file.name);
    }
    const response = await fetch(config.supabaseUrl.replace(/\/$/, '') + '/functions/v1/api', {
      method: 'POST',
      headers: { 'apikey': config.supabaseAnonKey, 'x-telegram-init-data': initData },
      body: form
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Ошибка сервера SpringVision.');
    return result;
  }
  window.SpringVisionAPI = { configured, request, requestForm, telegram };
})();