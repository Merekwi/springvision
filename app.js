(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const themeToggle = $('#themeToggle');
  const themeColorMeta = $('meta[name="theme-color"]');
  const applyTheme = (theme, persist = true) => {
    const dark = theme === 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'spring';
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(dark));
      themeToggle.setAttribute('aria-label', dark ? 'Включить весеннюю тему' : 'Включить тёмную тему');
      themeToggle.setAttribute('title', dark ? 'Переключить на весеннюю тему' : 'Переключить на тёмную тему');
      const icon = $('.theme-toggle-icon', themeToggle);
      const label = $('.theme-toggle-label', themeToggle);
      if (icon) icon.textContent = dark ? '☀' : '☾';
      if (label) label.textContent = dark ? 'Весенняя тема' : 'Тёмная тема';
    }
    if (themeColorMeta) themeColorMeta.setAttribute('content', dark ? '#18251f' : '#a8c5aa');
    const telegramApp = window.Telegram?.WebApp;
    try {
      telegramApp?.setHeaderColor?.(dark ? '#18251f' : '#a8c5aa');
      telegramApp?.setBackgroundColor?.(dark ? '#18251f' : '#a8c5aa');
    } catch (_) {}
    if (persist) {
      try { localStorage.setItem('springvision-theme', dark ? 'dark' : 'spring'); } catch (_) {}
    }
  };
  let savedTheme = 'spring';
  try { savedTheme = localStorage.getItem('springvision-theme') === 'dark' ? 'dark' : 'spring'; } catch (_) {}
  applyTheme(savedTheme, false);
  themeToggle?.addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'spring' : 'dark');
  });
  let currentSeason = null;
  let currentProfile = null;
  let currentIsAdmin = false;
  let reservedCountryCodes = new Set();
  let currentCountryReservation = null;
  let stateLoading = false;
  let lastStateLoadedAt = 0;
  let lastArchiveLoadedAt = 0;
  let archiveLoading = false;
  const POINTS = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1];
  const countries = [
    ['🇦🇱','Албания'],['🇦🇩','Андорра'],['🇦🇲','Армения'],['🇦🇹','Австрия'],['🇦🇿','Азербайджан'],['🇧🇾','Беларусь'],['🇧🇪','Бельгия'],['🇧🇦','Босния и Герцеговина'],['🇧🇬','Болгария'],['🇭🇷','Хорватия'],['🇨🇾','Кипр'],['🇨🇿','Чехия'],['🇩🇰','Дания'],['🇪🇪','Эстония'],['🇫🇮','Финляндия'],['🇫🇷','Франция'],['🇬🇪','Грузия'],['🇩🇪','Германия'],['🇬🇷','Греция'],['🇭🇺','Венгрия'],['🇮🇸','Исландия'],['🇮🇪','Ирландия'],['🇮🇱','Израиль'],['🇮🇹','Италия'],['🇰🇿','Казахстан'],['🇽🇰','Косово'],['🇱🇻','Латвия'],['🇱🇹','Литва'],['🇱🇺','Люксембург'],['🇲🇹','Мальта'],['🇲🇩','Молдова'],['🇲🇨','Монако'],['🇲🇪','Черногория'],['🇲🇦','Марокко'],['🇳🇱','Нидерланды'],['🇲🇰','Северная Македония'],['🇳🇴','Норвегия'],['🇵🇱','Польша'],['🇵🇹','Португалия'],['🇷🇴','Румыния'],['🇷🇺','Россия'],['🇸🇲','Сан-Марино'],['🇷🇸','Сербия'],['🇸🇰','Словакия'],['🇸🇮','Словения'],['🇪🇸','Испания'],['🇸🇪','Швеция'],['🇨🇭','Швейцария'],['🇹🇷','Турция'],['🇺🇦','Украина'],['🇬🇧','Великобритания'],['🇺🇸','США'],['🇨🇦','Канада'],['🇦🇺','Австралия'],['🇳🇿','Новая Зеландия'],['🇯🇵','Япония'],['🇰🇷','Южная Корея'],['🇨🇳','Китай'],['🇮🇳','Индия'],['🇧🇷','Бразилия'],['🇦🇷','Аргентина'],['🇲🇽','Мексика'],['🇨🇱','Чили'],['🇿🇦','ЮАР'],['🇪🇬','Египет'],['🇹🇳','Тунис'],['🇩🇿','Алжир'],['🇲🇦','Марокко'],['🇹🇭','Таиланд'],['🇻🇳','Вьетнам'],['🇮🇩','Индонезия'],['🇵🇭','Филиппины'],['🇸🇬','Сингапур'],['🇲🇾','Малайзия'],['🇸🇦','Саудовская Аравия'],['🇦🇪','ОАЭ'],['🇶🇦','Катар'],['🇯🇴','Иордания'],['🇱🇧','Ливан'],['🇵🇰','Пакистан'],['🇧🇩','Бангладеш'],['🇳🇵','Непал'],['🇱🇰','Шри-Ланка'],['🇮🇷','Иран'],['🇮🇶','Ирак'],['🇦🇫','Афганистан'],['🇺🇿','Узбекистан'],['🇰🇬','Кыргызстан'],['🇹🇯','Таджикистан'],['🇹🇲','Туркменистан'],['🇲🇳','Монголия'],['🇰🇪','Кения'],['🇳🇬','Нигерия'],['🇬🇭','Гана'],['🇪🇹','Эфиопия'],['🇹🇿','Танзания'],['🇺🇬','Уганда'],['🇸🇳','Сенегал'],['🇨🇮','Кот-д’Ивуар'],['🇨🇲','Камерун'],['🇨🇩','ДР Конго'],['🇦🇴','Ангола'],['🇲🇿','Мозамбик'],['🇿🇼','Зимбабве'],['🇿🇲','Замбия'],['🇧🇼','Ботсвана'],['🇳🇦','Намибия'],['🇲🇬','Мадагаскар'],['🇲🇺','Маврикий'],['🇸🇨','Сейшелы'],['🇫🇯','Фиджи'],['🇵🇬','Папуа — Новая Гвинея'],['🇸🇧','Соломоновы Острова'],['🇼🇸','Самоа'],['🇹🇴','Тонга'],['🇻🇺','Вануату'],['🇵🇼','Палау'],['🇲🇭','Маршалловы Острова'],['🇰🇮','Кирибати'],['🇹🇻','Тувалу'],['🇳🇷','Науру'],['🇲🇻','Мальдивы'],['🇧🇹','Бутан'],['🇧🇳','Бруней'],['🇰🇭','Камбоджа'],['🇱🇦','Лаос'],['🇲🇲','Мьянма'],['🇹🇱','Восточный Тимор'],['🇧🇴','Боливия'],['🇵🇪','Перу'],['🇪🇨','Эквадор'],['🇨🇴','Колумбия'],['🇻🇪','Венесуэла'],['🇺🇾','Уругвай'],['🇵🇾','Парагвай'],['🇬🇾','Гайана'],['🇸🇷','Суринам'],['🇨🇷','Коста-Рика'],['🇵🇦','Панама'],['🇬🇹','Гватемала'],['🇧🇿','Белиз'],['🇭🇳','Гондурас'],['🇸🇻','Сальвадор'],['🇳🇮','Никарагуа'],['🇨🇺','Куба'],['🇯🇲','Ямайка'],['🇭🇹','Гаити'],['🇩🇴','Доминиканская Республика'],['🇧🇸','Багамы'],['🇧🇧','Барбадос'],['🇹🇹','Тринидад и Тобаго'],['🇬🇩','Гренада'],['🇱🇨','Сент-Люсия'],['🇻🇨','Сент-Винсент и Гренадины'],['🇦🇬','Антигуа и Барбуда'],['🇩🇲','Доминика'],['🇰🇳','Сент-Китс и Невис']
  ];
  const countrySelect = $('#countrySelect');
  const countryPicker = $('#countryPicker');
  const countryPickerTrigger = $('#countryPickerTrigger');
  const countryPickerPanel = $('#countryPickerPanel');
  const countryPickerOptions = $('#countryPickerOptions');
  const countryPickerCurrentFlag = $('#countryPickerCurrentFlag');
  const countryPickerCurrentName = $('#countryPickerCurrentName');
  const countrySearch = $('#countrySearch');
  const countryCodeFromEmoji = (flag) => Array.from(flag).map(char => {
    const point = char.codePointAt(0);
    return point >= 0x1F1E6 && point <= 0x1F1FF ? String.fromCharCode(point - 0x1F1E6 + 97) : '';
  }).join('');
  const flagPath = (flag) => {
    const code = countryCodeFromEmoji(flag);
    return `assets/flags/heart/${code === 'xk' ? 'xk' : code}.svg`;
  };
  const uniqueCountries = [...new Map(countries.map(([flag, name]) => {
    const code = countryCodeFromEmoji(flag);
    return [code, { flag, name, code }];
  })).values()];
  const sortedCountries = uniqueCountries.sort((a,b) => a.name.localeCompare(b.name, 'ru'));
  const countryCountLabel = $('#countryCount');
  if (countryCountLabel) countryCountLabel.textContent = String(uniqueCountries.length);
  sortedCountries.forEach(({name,code}) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = name;
    countrySelect.append(option);
  });
  const setCountry = (country) => {
    countrySelect.value = country.code;
    countryPickerCurrentName.textContent = country.name;
    countryPickerCurrentFlag.innerHTML = '';
    const img = document.createElement('img');
    img.src = flagPath(country.flag);
    img.alt = '';
    img.className = 'heart-flag';
    img.onerror = () => { countryPickerCurrentFlag.textContent = country.flag; };
    countryPickerCurrentFlag.append(img);
    countryPickerTrigger.setAttribute('aria-expanded', 'false');
    countryPickerPanel.hidden = true;
    countryPickerOptions.querySelectorAll('[role="option"]').forEach(el => {
      el.setAttribute('aria-selected', String(el.dataset.country === country.code));
    });
  };
  const renderCountryOptions = (query = '') => {
    const normalized = query.trim().toLocaleLowerCase('ru');
    const available = sortedCountries.filter(country => country.name.toLocaleLowerCase('ru').includes(normalized));
    countryPickerOptions.replaceChildren();
    if (!available.length) {
      const empty = document.createElement('p');
      empty.className = 'country-picker-empty';
      empty.textContent = 'Страна не найдена';
      countryPickerOptions.append(empty);
      return;
    }
    available.forEach(country => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'country-picker-option';
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', String(countrySelect.value === country.code));
      button.dataset.country = country.code;
      const isReserved = reservedCountryCodes.has(country.code);
      button.disabled = isReserved && countrySelect.value !== country.code;
      if (isReserved) button.classList.add('country-reserved');
      const img = document.createElement('img');
      img.src = flagPath(country.flag);
      img.alt = '';
      img.className = 'heart-flag';
      img.loading = 'lazy';
      img.onerror = () => { img.hidden = true; };
      const label = document.createElement('span');
      label.textContent = isReserved ? `${country.name} — занята` : country.name;
      button.append(img, label);
      if (!button.disabled) button.addEventListener('click', () => setCountry(country));
      countryPickerOptions.append(button);
    });
  };
  const closeCountryPicker = () => {
    countryPickerPanel.hidden = true;
    countryPickerTrigger.setAttribute('aria-expanded', 'false');
  };
  countryPickerTrigger.addEventListener('click', () => {
    const open = countryPickerPanel.hidden;
    countryPickerPanel.hidden = !open;
    countryPickerTrigger.setAttribute('aria-expanded', String(open));
    if (open) {
      countrySearch.value = '';
      renderCountryOptions();
      countrySearch.focus();
    }
  });
  countrySearch.addEventListener('input', () => renderCountryOptions(countrySearch.value));
  document.addEventListener('click', event => {
    if (!countryPicker.contains(event.target)) closeCountryPicker();
  });
  countryPicker.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeCountryPicker();
  });
  $('#countryCount').textContent = `${countries.length}+`;
  renderCountryOptions();

  const toast = (message) => {
    const el = $('#toast'); el.textContent = message; el.classList.add('show');
    window.clearTimeout(toast.timer); toast.timer = window.setTimeout(() => el.classList.remove('show'), 3600);
  };
  const openDialog = (id) => { const dialog = document.getElementById(id); if (dialog && !dialog.open) dialog.showModal(); };
  $$('[data-close]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.close)?.close()));
  $('#accountButton').addEventListener('click', () => { openDialog('accountDialog'); loadAccount().catch(error => { $('#accountContent').textContent = error.message || 'Не получилось открыть профиль. Попробуй ещё раз.'; }); });
  const formatMoscowDateTime = (value) => value
    ? new Date(value).toLocaleString('ru-RU', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit', timeZone:'Europe/Moscow' })
    : '';
  const openApplicationDialog = () => {
    $('#applicationMessage').textContent = '';
    $('#applicationForm').reset();
    countrySelect.disabled = false;
    countryPickerTrigger.disabled = false;
    const hint = $('#countryReservationHint');
    hint.hidden = true;
    hint.textContent = '';
    countryPickerCurrentName.textContent = 'Выбери страну';
    countryPickerCurrentFlag.textContent = '♡';
    renderCountryOptions();

    const reservation = currentCountryReservation;
    if (reservation && currentSeason?.id === reservation.target_season_id && reservation.status === 'reserved') {
      const country = sortedCountries.find(item => item.code === reservation.country_code);
      if (country) {
        setCountry(country);
        countrySelect.disabled = true;
        countryPickerTrigger.disabled = true;
        hint.textContent = reservation.expires_at
          ? `Страна зарезервирована за вами. Отправьте полную заявку не позднее ${formatMoscowDateTime(reservation.expires_at)} (МСК), иначе резервация освободится.`
          : 'Страна зарезервирована за вами. Крайний срок отправки заявки появится после установки даты окончания регистрации.';
        hint.hidden = false;
      }
    }
    openDialog('applicationDialog');
  };
  $('#applyButton').addEventListener('click', openApplicationDialog);
  $('#menuToggle').addEventListener('click', () => $('#mainNav').classList.toggle('nav-open'));
  $$('#mainNav a').forEach(link => link.addEventListener('click', () => $('#mainNav').classList.remove('nav-open')));
  const adminContent = () => $('#adminDialogContent');
  const fillSeasonSelect = async (select, placeholder = 'Выбери сезон') => {
    const result = await window.SpringVisionAPI.request('admin_list_seasons');
    select.replaceChildren();
    const first = document.createElement('option');
    first.value = '';
    first.textContent = placeholder;
    select.append(first);
    (result.seasons || []).forEach(season => {
      const option = document.createElement('option');
      option.value = season.id;
      option.textContent = `#${season.season_number} — ${season.title}`;
      select.append(option);
    });
    return result.seasons || [];
  };
  const selectedSeason = async (selectId) => {
    const select = $(selectId);
    if (!select.value) throw new Error('Сначала выбери сезон.');
    return select.value;
  };
  const showAdminDialog = (title, markup) => {
    $('#adminDialogTitle').textContent = title;
    adminContent().innerHTML = markup;
    openDialog('adminDialog');
  };
  const adminError = (error) => toast(error instanceof Error ? error.message : 'Не получилось. Попробуй ещё раз.');
  const loadAdminApplications = async () => {
    const seasonId = await selectedSeason('#adminAppSeason');
    const result = await window.SpringVisionAPI.request('admin_list_submissions', { seasonId });
    const list = $('#adminApplicationsList');
    list.replaceChildren();
    if (!(result.submissions || []).length) {
      const empty = document.createElement('p');
      empty.className = 'admin-empty';
      empty.textContent = 'Заявок пока нет.';
      list.append(empty);
      return;
    }
    result.submissions.forEach(row => {
      const card = document.createElement('article');
      card.className = 'admin-submission';
      const title = document.createElement('strong');
      const country = sortedCountries.find(c => c.code === row.country_code);
      title.textContent = `${country?.name || row.country_code.toUpperCase()} — ${row.artist} / ${row.song_title}`;
      const applicant = row.profiles || {};
      let portrait = null;
      if (row.performer_photo_url) {
        portrait = document.createElement('img');
        portrait.className = 'admin-performer-photo';
        portrait.src = row.performer_photo_url;
        portrait.alt = `Фото представителя ${country?.name || row.country_code.toUpperCase()}`;
        portrait.loading = 'lazy';
        portrait.onerror = () => { portrait.hidden = true; };
      }
      const applicantInfo = document.createElement('p');
      applicantInfo.className = 'admin-applicant';
      const applicantName = applicant.display_name || 'Пользователь Telegram';
      const applicantHandle = applicant.telegram_username ? `@${applicant.telegram_username}` : 'username не указан';
      applicantInfo.textContent = `Заявитель: ${applicantName} · ${applicantHandle}${applicant.telegram_id ? ` · ID: ${applicant.telegram_id}` : ''}`;
      const status = document.createElement('span');
      status.className = 'admin-submission-status';
      status.textContent = ({pending:'На рассмотрении',approved:'Одобрена',rejected:'Отклонена',withdrawn:'Отозвана'})[row.status] || row.status;
      const comment = document.createElement('textarea');
      comment.placeholder = 'Комментарий (обязателен по желанию при отклонении)';
      comment.value = row.moderation_comment || '';
      comment.rows = 2;
      const feedback = document.createElement('p');
      feedback.className = 'admin-review-feedback';
      feedback.setAttribute('role','status');
      const actions = document.createElement('div');
      actions.className = 'admin-inline-actions';
      const photoInput = document.createElement('input');
      photoInput.type = 'file';
      photoInput.accept = 'image/jpeg,image/png,image/webp';
      photoInput.hidden = true;
      const photoButton = document.createElement('button');
      photoButton.type = 'button';
      photoButton.className = 'button button-ghost button-small';
      photoButton.textContent = row.performer_photo_url ? 'Заменить фото' : 'Добавить фото';
      photoButton.addEventListener('click', () => photoInput.click());
      photoInput.addEventListener('change', async () => {
        const file = photoInput.files?.[0];
        if (!file) return;
        photoButton.disabled = true;
        feedback.textContent = 'Сохраняем фото…';
        try {
          await window.SpringVisionAPI.requestForm('admin_upload_performer_photo', { seasonId, submissionId: row.id }, 'file', file);
          feedback.textContent = 'Фото сохранено и привязано к заявке.';
          await loadAdminApplications();
        } catch (error) {
          feedback.textContent = error instanceof Error ? error.message : 'Не удалось загрузить фото.';
          photoButton.disabled = false;
          photoInput.value = '';
        }
      });
      actions.append(photoButton, photoInput);
      if (row.recap_storage_path) {
        const recap = document.createElement('button');
        recap.type = 'button'; recap.className = 'button button-ghost button-small'; recap.textContent = 'Рекап';
        recap.addEventListener('click', async () => {
          const recapWindow = window.open('about:blank', '_blank');
          if (recapWindow) recapWindow.opener = null;
          try {
            const response = await window.SpringVisionAPI.request('admin_recap_downloads',{seasonId});
            const item = (response.recaps || []).find(x => x.id === row.id);
            if (item?.recap_url) {
              if (recapWindow) recapWindow.location.href = item.recap_url;
              else window.location.href = item.recap_url;
            } else {
              recapWindow?.close();
              toast('Не удалось получить ссылку на рекап.');
            }
          } catch (error) {
            recapWindow?.close();
            adminError(error);
          }
        });
        actions.append(recap);
      }
      if (row.status === 'pending') {
        for (const [statusValue,label] of [['approved','Одобрить'],['rejected','Отклонить']]) {
          const button = document.createElement('button');
          button.type = 'button'; button.className = statusValue === 'approved' ? 'button button-small' : 'button button-small button-ghost';
          button.textContent = label;
          button.addEventListener('click', async () => {
            button.disabled = true;
            feedback.textContent = 'Сохраняем решение…';
            try {
              await window.SpringVisionAPI.request('admin_review_submission',{submissionId:row.id,status:statusValue,comment:comment.value.trim()});
              row.status = statusValue;
              status.textContent = statusValue === 'approved' ? 'Одобрена' : 'Отклонена';
              feedback.textContent = statusValue === 'approved'
                ? 'Заявка одобрена. Право жюри выдано на этот сезон.'
                : 'Заявка отклонена.';
              comment.disabled = true;
              actions.querySelectorAll('button').forEach(item => {
                if (item !== button && item.textContent !== 'Рекап') item.remove();
              });
              button.textContent = statusValue === 'approved' ? 'Одобрено' : 'Отклонено';
              button.disabled = true;
              button.className = 'button button-small';
              try { await loadAppState(); } catch (refreshError) { console.error(refreshError); }
            } catch (error) {
              feedback.textContent = error instanceof Error ? error.message : 'Не удалось сохранить решение.';
              button.disabled = false;
            }
          });
          actions.append(button);
        }
      } else {
        comment.disabled = true;
        if (row.status === 'approved' || row.status === 'rejected') {
          const decided = document.createElement('button');
          decided.type = 'button';
          decided.className = 'button button-small';
          decided.textContent = row.status === 'approved' ? 'Одобрено' : 'Отклонено';
          decided.disabled = true;
          actions.append(decided);
        }
        feedback.textContent = row.status === 'approved'
          ? 'Право жюри выдано для этого сезона.'
          : row.status === 'rejected' ? 'Заявка уже отклонена.' : 'Эта заявка больше не рассматривается.';
      }
      card.append(title);
      if (portrait) card.append(portrait);
      card.append(applicantInfo,status,comment,feedback,actions);
      list.append(card);
    });
  };
  const downloadRecapsZip = async () => {
    if (!window.JSZip) throw new Error('Не удалось загрузить библиотеку ZIP. Обнови страницу.');
    const seasonId = await selectedSeason('#adminAppSeason');
    const result = await window.SpringVisionAPI.request('admin_recap_downloads',{seasonId});
    const files = (result.recaps || []).filter(x=>x.recap_url);
    if (!files.length) throw new Error('В этом сезоне пока нет загруженных рекапов.');
    const zip = new JSZip();
    let index = 0;
    for (const item of files) {
      index++;
      const response = await fetch(item.recap_url);
      if (!response.ok) throw new Error('Не удалось скачать рекап: ' + item.country_code);
      const blob = await response.blob();
      const ext = (item.recap_storage_path || '').split('.').pop().replace(/[^a-z0-9]/gi,'').toLowerCase() || 'mp4';
      const artist = String(item.artist || '').replace(/[^a-z0-9а-яё_-]/gi,'_').slice(0,45);
      const filename = `${String(item.performance_order || index).padStart(2,'0')}_${item.country_code.toUpperCase()}_${artist}.${ext}`;
      zip.file(filename,blob);
    }
    const blob = await zip.generateAsync({type:'blob'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `SpringVision_Recaps_${seasonId}.zip`;
    document.body.append(link); link.click(); link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    toast(`ZIP готов: ${files.length} рекапов`);
  };
  const openAdminSection = async (section) => {
    if (!window.SpringVisionAPI?.configured()) { toast('Сервис сейчас недоступен. Попробуй позже.'); return; }
    if (!currentIsAdmin) { toast('Нет доступа к этому разделу.'); return; }
    try {

      if (section === 'archive') {
        showAdminDialog('Архив и история сезонов', '<p class="admin-message">Здесь хранятся снимки всех заявок. При завершении сезона и публикации итогов места фиксируются автоматически. Перед удалением сезона данные и загруженные медиа тоже сохраняются.</p><div class="admin-form-row"><label>Сезон для сохранения<select id="archiveSeason"></select></label><button type="button" class="button button-small" id="saveArchiveSeason">Сохранить снимок</button></div><div class="archive-admin-actions"><button type="button" class="button button-ghost button-small" id="refreshArchiveList">Обновить список</button><button type="button" class="button button-ghost button-small" id="exportArchiveCsv">Скачать CSV</button></div><p id="archiveAdminMessage" class="admin-message" role="status"></p><div id="archiveAdminList" class="archive-admin-list"></div>');
        const seasons = await fillSeasonSelect($('#archiveSeason'), 'Выбери сезон');
        let archives = [];
        const statusLabels = { approved: 'Одобрена', pending: 'На проверке', rejected: 'Отклонена', withdrawn: 'Отозвана' };
        const renderArchiveList = async () => {
          const list = $('#archiveAdminList');
          const message = $('#archiveAdminMessage');
          list.replaceChildren();
          message.textContent = 'Загружаем архив…';
          const result = await window.SpringVisionAPI.request('admin_archive_list');
          archives = result.archives || [];
          message.textContent = archives.length ? 'Сохранено сезонов: ' + archives.length + '.' : 'Снимков пока нет. Выбери сезон и сохрани первый снимок.';
          if (!archives.length) return;
          archives.forEach(archive => {
            const card = document.createElement('article');
            card.className = 'archive-admin-season';
            const header = document.createElement('div');
            header.className = 'archive-admin-season-header';
            const text = document.createElement('div');
            const title = document.createElement('h3');
            title.textContent = '№' + archive.season_number + ' · ' + archive.season_title;
            const meta = document.createElement('p');
            meta.textContent = 'Заявок: ' + archive.entry_count + ' · Одобрено: ' + archive.participant_count + ' · Снимок: ' + new Date(archive.archived_at).toLocaleString('ru-RU');
            text.append(title, meta);
            const status = document.createElement('span');
            status.className = 'archive-status';
            status.textContent = archive.is_public ? 'Опубликован' : 'Только организаторам';
            header.append(text, status);
            card.append(header);
            const details = document.createElement('details');
            const summary = document.createElement('summary');
            summary.textContent = 'Показать заявки (' + (archive.entries || []).length + ')';
            const entries = document.createElement('div');
            entries.className = 'archive-admin-entries';
            (archive.entries || []).forEach(entry => {
              const line = document.createElement('div');
              line.className = 'archive-admin-entry';
              const rank = document.createElement('strong');
              rank.textContent = entry.placement ? String(entry.placement) + ' место' : '—';
              const description = document.createElement('span');
              description.textContent = (entry.country_name || entry.country_code || 'Страна') + ' · ' + (entry.artist || 'Без исполнителя') + ' — ' + (entry.song_title || 'Без названия');
              const label = document.createElement('small');
              label.textContent = statusLabels[entry.status] || entry.status || 'Неизвестно';
              line.append(rank, description, label);
              entries.append(line);
            });
            details.append(summary, entries);
            card.append(details);
            list.append(card);
          });
        };
        const downloadCsv = () => {
          const headers = ['Номер сезона','Название сезона','Код страны','Страна','Исполнитель','Песня','Статус заявки','Место','Баллы жюри','Баллы зрителей','Всего баллов','Порядок выступления','Ссылка на выступление'];
          const rows = [headers];
          archives.forEach(archive => (archive.entries || []).forEach(entry => {
            rows.push([
              archive.season_number, archive.season_title, entry.country_code, entry.country_name,
              entry.artist, entry.song_title, statusLabels[entry.status] || entry.status,
              entry.placement ?? '', entry.jury_points ?? 0, entry.televote_points ?? 0,
              entry.total_points ?? 0, entry.performance_order ?? '', entry.performance_url || ''
            ]);
          }));
          const quote = value => '"' + String(value ?? '').replaceAll('"', '""') + '"';
          const csv = '\uFEFF' + rows.map(row => row.map(quote).join(';')).join('\r\n');
          const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
          const link = document.createElement('a');
          link.href = url;
          link.download = 'SpringVision_archive_' + new Date().toISOString().slice(0,10) + '.csv';
          document.body.append(link);
          link.click();
          link.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        };
        $('#saveArchiveSeason').addEventListener('click', async () => {
          const seasonId = $('#archiveSeason').value;
          const out = $('#archiveAdminMessage');
          if (!seasonId) { out.textContent = 'Сначала выбери сезон.'; return; }
          const button = $('#saveArchiveSeason');
          button.disabled = true;
          out.textContent = 'Сохраняем заявки и результаты…';
          try {
            const saved = await window.SpringVisionAPI.request('admin_archive_save', { seasonId });
            out.textContent = 'Снимок сохранён: ' + saved.archive.entry_count + ' заявок, ' + saved.archive.participant_count + ' одобренных участников. ' + (saved.archive.is_public ? 'Итоги уже доступны в публичном архиве.' : 'Пока виден только организаторам.');
            await renderArchiveList();
            await loadPublicArchive();
          } catch (error) {
            out.textContent = error.message || 'Не удалось сохранить архив.';
          } finally {
            button.disabled = false;
          }
        });
        $('#refreshArchiveList').addEventListener('click', () => renderArchiveList().catch(adminError));
        $('#exportArchiveCsv').addEventListener('click', downloadCsv);
        await renderArchiveList();
      } else if (section === 'applications') {

        showAdminDialog('Модерация заявок',`<div class="admin-form-row"><label>Сезон<div class="season-select-wrap"><button type="button" id="adminAppSeasonTrigger" class="season-select-trigger" aria-expanded="false">Список сезонов… <span>⌄</span></button><div id="adminAppSeasonMenu" class="season-select-menu" hidden></div><select id="adminAppSeason" class="season-select-native" required aria-hidden="true" tabindex="-1"></select></div></label><button type="button" class="button button-small" id="loadAdminApps">Обновить</button></div><div class="admin-inline-actions"><button type="button" class="button button-ghost button-small" id="downloadRecaps">Скачать все рекапы ZIP</button></div><div id="adminApplicationsList" class="admin-applications-list"></div>`);
        const appSeasons = await fillSeasonSelect($('#adminAppSeason'));
        const seasonTrigger = $('#adminAppSeasonTrigger');
        const seasonMenu = $('#adminAppSeasonMenu');
        const seasonSelect = $('#adminAppSeason');
        const closeSeasonMenu = () => { seasonMenu.hidden = true; seasonTrigger.setAttribute('aria-expanded','false'); };
        seasonTrigger.addEventListener('click', () => {
          const open = seasonMenu.hidden;
          seasonMenu.hidden = !open;
          seasonTrigger.setAttribute('aria-expanded',String(open));
        });
        appSeasons.forEach(season => {
          const option = document.createElement('button');
          option.type = 'button';
          option.className = 'season-select-option';
          option.textContent = `#${season.season_number} — ${season.title}`;
          option.addEventListener('click', () => {
            seasonSelect.value = season.id;
            seasonTrigger.innerHTML = '';
            seasonTrigger.append(document.createTextNode(option.textContent));
            const chevron = document.createElement('span'); chevron.textContent = '⌄'; seasonTrigger.append(chevron);
            closeSeasonMenu();
            seasonSelect.dispatchEvent(new Event('change',{bubbles:true}));
          });
          seasonMenu.append(option);
        });
        $('#loadAdminApps').addEventListener('click',()=>loadAdminApplications().catch(adminError));
        $('#downloadRecaps').addEventListener('click',()=>downloadRecapsZip().catch(adminError));
        seasonSelect.addEventListener('change',()=>loadAdminApplications().catch(adminError));
        if (appSeasons.length) {
          seasonSelect.value = appSeasons[0].id;
          seasonTrigger.innerHTML = '';
          seasonTrigger.append(document.createTextNode(`#${appSeasons[0].season_number} — ${appSeasons[0].title}`));
          const chevron = document.createElement('span'); chevron.textContent = '⌄'; seasonTrigger.append(chevron);
          await loadAdminApplications();
        } else {
          seasonTrigger.textContent = 'Сезонов пока нет';
          seasonTrigger.disabled = true;
          const empty = document.createElement('p');
          empty.className = 'admin-empty';
          empty.textContent = 'Сезонов пока нет. Сначала создай сезон в разделе «Сезоны».';
          $('#adminApplicationsList').append(empty);
        }
      } else if (section === 'voting-status') {
        showAdminDialog('Статус голосования', `<div class="admin-form-row"><label>Сезон<select id="voteStatusSeason"></select></label><button type="button" class="button button-small" id="refreshVoteStatus">Обновить</button></div><p id="voteStatusSummary" class="admin-message" role="status">Выбери сезон.</p><div id="voteStatusTelevote" class="admin-submission"></div><h3>Голосование жюри по странам</h3><div id="voteStatusJury" class="admin-applications-list"></div>`);
        const seasonSelect = $('#voteStatusSeason');
        const seasons = await fillSeasonSelect(seasonSelect);
        const renderVoteStatus = async () => {
          const seasonId = await selectedSeason('#voteStatusSeason');
          const out = $('#voteStatusSummary');
          const juryList = $('#voteStatusJury');
          const televote = $('#voteStatusTelevote');
          out.textContent = 'Получаем статус…';
          juryList.replaceChildren();
          televote.replaceChildren();
          const result = await window.SpringVisionAPI.request('admin_vote_status', { seasonId });
          out.textContent = `Жюри проголосовало: ${result.juryVoted} из ${result.juryTotal} стран.`;
          const tvTitle = document.createElement('strong');
          tvTitle.textContent = `Телеголосование: ${result.televoteCount} голосов`;
          const tvNote = document.createElement('p');
          tvNote.textContent = 'Телеголоса анонимны и доступны зрителям на равных условиях, поэтому здесь отображается только общее количество принятых голосов.';
          televote.append(tvTitle, tvNote);
          if (!result.juryCountries?.length) {
            const empty = document.createElement('p'); empty.className = 'admin-empty'; empty.textContent = 'В этом сезоне пока нет назначенного жюри.';
            juryList.append(empty);
          } else {
            result.juryCountries.forEach(country => {
              const card = document.createElement('article'); card.className = 'admin-submission';
              const info = document.createElement('div'); info.className = 'admin-submission-main';
              const heading = document.createElement('strong');
              heading.textContent = country.country_name;
              info.append(heading);
              if (country.voted_at) {
                const time = document.createElement('small');
                time.textContent = 'Голос принят: ' + new Date(country.voted_at).toLocaleString('ru-RU');
                info.append(time);
              }
              const status = document.createElement('span'); status.className = 'admin-submission-status';
              status.textContent = country.voted ? 'Проголосовала' : country.autoAssigned ? 'Оценки назначены автоматически' : 'Ожидается';
              status.dataset.status = country.voted ? 'approved' : 'pending';
              card.append(info, status);
              juryList.append(card);
            });
          }
        };
        if (seasons.length) {
          seasonSelect.value = seasons[0].id;
          await renderVoteStatus();
        } else {
          $('#voteStatusSummary').textContent = 'Сезонов пока нет.';
        }
        $('#refreshVoteStatus').addEventListener('click', () => renderVoteStatus().catch(adminError));
        seasonSelect.addEventListener('change', () => renderVoteStatus().catch(adminError));
      } else if (section === 'results') {
        showAdminDialog('Результаты сезона', `<div class="admin-form-row"><label>Сезон<select id="adminResultsSeason"></select></label><button type="button" class="button button-small" id="refreshAdminResults">Обновить</button></div><div class="admin-results-tabs" role="tablist" aria-label="Режим просмотра результатов"><button type="button" class="admin-results-tab is-active" data-results-view="interim" aria-selected="true">Промежуточные</button><button type="button" class="admin-results-tab" data-results-view="final" aria-selected="false">Итоговые</button></div><p id="adminResultsNote" class="admin-message" role="status">Выбери сезон.</p><div id="adminResultsSummary" class="admin-results-summary"></div><section class="admin-results-section"><h3 id="adminResultsRankingTitle">Таблица результатов</h3><div id="adminResultsRanking" class="admin-results-table-wrap"></div></section><section class="admin-results-section"><h3>Кому и сколько баллов поставила каждая страна</h3><p class="admin-results-help">Полные бюллетени жюри по каждой стране: 12, 10, 8, 7, 6, 5, 4, 3, 2 и 1 балл с указанием получателя. Автоматически назначенные оценки отмечены отдельно.</p><div id="adminResultsMatrix" class="admin-results-table-wrap"></div></section><section class="admin-results-section"><h3>Телеголосование</h3><div id="adminResultsTelevote" class="admin-results-summary"></div><p class="admin-results-help">Телеголосование анонимно: приложение показывает количество бюллетеней и баллы каждой страны-получателя, но не раскрывает, кто за кого голосовал.</p></section>`);
        const seasonSelect = $('#adminResultsSeason');
        const seasons = await fillSeasonSelect(seasonSelect);
        let activeView = 'interim';
        const renderAdminResults = async () => {
          const seasonId = await selectedSeason('#adminResultsSeason');
          const note = $('#adminResultsNote');
          const summary = $('#adminResultsSummary');
          const ranking = $('#adminResultsRanking');
          const matrix = $('#adminResultsMatrix');
          const televote = $('#adminResultsTelevote');
          const rankingTitle = $('#adminResultsRankingTitle');
          note.textContent = 'Получаем результаты…';
          summary.replaceChildren();
          ranking.replaceChildren();
          matrix.replaceChildren();
          televote.replaceChildren();
          const result = await window.SpringVisionAPI.request('admin_results', { seasonId });
          const finalReady = Boolean(result.finalAvailable);
          if (activeView === 'final') {
            note.textContent = finalReady
              ? 'Финальные результаты рассчитаны. Их публикация для зрителей по-прежнему управляется отдельно в настройках сезона.'
              : 'Сезон ещё не завершён. Здесь показан текущий предварительный рейтинг, а не зафиксированный финал.';
            rankingTitle.textContent = finalReady ? 'Финальная таблица' : 'Предварительная таблица';
          } else {
            note.textContent = 'Промежуточный срез: отображаются все оценки, уже сохранённые в системе. Пока голосование открыто, суммы могут изменяться.';
            rankingTitle.textContent = 'Текущий рейтинг';
          }

          const addStat = (parent, label, value, detail) => {
            const card = document.createElement('article');
            card.className = 'admin-results-stat';
            const caption = document.createElement('span'); caption.textContent = label;
            const number = document.createElement('strong'); number.textContent = value;
            const small = document.createElement('small'); small.textContent = detail;
            card.append(caption, number, small);
            parent.append(card);
          };
          addStat(summary, 'Бюллетени жюри', `${result.jury?.voted || 0} / ${result.jury?.assigned || 0}`, `Автоматически назначено: ${result.jury?.automatic || 0}`);
          addStat(summary, 'Телеголосование', String(result.televote?.ballots || 0), `Бюллетеней · ${result.televote?.point_rows || 0} оценок`);
          addStat(summary, 'Всего баллов', String((result.jury?.total_points || 0) + (result.televote?.total_points || 0)), `Жюри: ${result.jury?.total_points || 0} · зрители: ${result.televote?.total_points || 0}`);

          const createTable = (headers, className = '') => {
            const table = document.createElement('table');
            table.className = `admin-results-table ${className}`.trim();
            const thead = document.createElement('thead');
            const headRow = document.createElement('tr');
            headers.forEach(label => {
              const th = document.createElement('th');
              th.textContent = label;
              headRow.append(th);
            });
            thead.append(headRow);
            table.append(thead, document.createElement('tbody'));
            return table;
          };
          const rankingRows = result.standings || [];
          if (!rankingRows.length) {
            const empty = document.createElement('p'); empty.className = 'admin-empty'; empty.textContent = 'В этом сезоне пока нет одобренных участников.';
            ranking.append(empty);
          } else {
            const table = createTable(['Место', 'Страна', 'Исполнитель / песня', 'Жюри', 'Телеголосование', 'Всего']);
            const body = $('tbody', table);
            rankingRows.forEach((entry, index) => {
              const tr = document.createElement('tr');
              const rank = document.createElement('td'); rank.className = 'admin-results-rank'; rank.textContent = String(index + 1);
              const country = document.createElement('td'); country.className = 'admin-results-country';
              const name = document.createElement('strong'); name.textContent = entry.country_name;
              country.append(name);
              const song = document.createElement('td');
              const artist = document.createElement('strong'); artist.textContent = entry.artist;
              const title = document.createElement('small'); title.textContent = entry.song_title;
              song.append(artist, title);
              const jury = document.createElement('td'); jury.textContent = String(entry.jury_points);
              const tv = document.createElement('td'); tv.textContent = String(entry.televote_points);
              const total = document.createElement('td'); total.className = 'admin-results-total'; total.textContent = String(entry.total_points);
              tr.append(rank, country, song, jury, tv, total);
              body.append(tr);
            });
            ranking.append(table);
          }

          const juryBallots = result.jury_ballots || [];
          if (!juryBallots.length) {
            const empty = document.createElement('p');
            empty.className = 'admin-empty';
            empty.textContent = 'В этом сезоне пока нет назначенного жюри.';
            matrix.append(empty);
          } else {
            juryBallots.forEach(ballot => {
              const card = document.createElement('article');
              card.className = 'admin-jury-ballot';
              const header = document.createElement('div');
              header.className = 'admin-jury-ballot-header';
              if (ballot.country_code) {
                const flag = document.createElement('img');
                flag.className = 'admin-jury-ballot-flag';
                flag.src = `assets/flags/heart/${ballot.country_code}.svg`;
                flag.alt = '';
                flag.onerror = () => { flag.hidden = true; };
                header.append(flag);
              }
              const heading = document.createElement('strong');
              heading.textContent = ballot.country_name;
              const status = document.createElement('span');
              status.className = ballot.automatic ? 'admin-jury-ballot-status is-auto' : ballot.voted ? 'admin-jury-ballot-status is-voted' : 'admin-jury-ballot-status';
              status.textContent = !ballot.voted ? 'Ожидается' : ballot.automatic ? 'Назначено автоматически' : 'Голос сохранён';
              header.append(heading, status);
              card.append(header);
              const awards = document.createElement('div');
              awards.className = 'admin-jury-awards';
              if (!ballot.votes?.length) {
                const empty = document.createElement('p');
                empty.className = 'admin-jury-ballot-empty';
                empty.textContent = 'Эта страна ещё не отправила оценки.';
                awards.append(empty);
              } else {
                ballot.votes.forEach(vote => {
                  const line = document.createElement('div');
                  line.className = 'admin-jury-award-row';
                  const points = document.createElement('strong');
                  points.className = 'admin-jury-award-points';
                  points.textContent = String(vote.points);
                  const arrow = document.createElement('span');
                  arrow.className = 'admin-jury-award-arrow';
                  arrow.textContent = '→';
                  const target = document.createElement('div');
                  target.className = 'admin-jury-award-target';
                  const targetCountry = document.createElement('strong');
                  targetCountry.textContent = vote.target_country_name;
                  const song = document.createElement('small');
                  song.textContent = vote.artist ? `${vote.artist} — ${vote.song_title}` : '';
                  target.append(targetCountry);
                  if (song.textContent) target.append(song);
                  line.append(points, arrow, target);
                  if (vote.is_random_fallback) {
                    const auto = document.createElement('span');
                    auto.className = 'admin-jury-award-auto';
                    auto.textContent = 'авто';
                    line.append(auto);
                  }
                  awards.append(line);
                });
              }
              const count = document.createElement('small');
              count.className = 'admin-jury-ballot-count';
              count.textContent = `${ballot.vote_count || 0} из 10 оценок`;
              card.append(awards, count);
              matrix.append(card);
            });
          }

          addStat(televote, 'Бюллетени зрителей', String(result.televote?.ballots || 0), 'Анонимные голоса');
          addStat(televote, 'Баллы телеголосования', String(result.televote?.total_points || 0), 'Сумма всех полученных баллов');
          const tabs = $$('.admin-results-tab');
          tabs.forEach(tab => {
            const selected = tab.dataset.resultsView === activeView;
            tab.classList.toggle('is-active', selected);
            tab.setAttribute('aria-selected', String(selected));
          });
        };
        if (seasons.length) {
          seasonSelect.value = seasons[0].id;
          await renderAdminResults();
        } else {
          $('#adminResultsNote').textContent = 'Сезонов пока нет.';
        }
        $$('.admin-results-tab').forEach(tab => tab.addEventListener('click', () => {
          activeView = tab.dataset.resultsView;
          renderAdminResults().catch(adminError);
        }));
        $('#refreshAdminResults').addEventListener('click', () => renderAdminResults().catch(adminError));
        seasonSelect.addEventListener('change', () => renderAdminResults().catch(adminError));
      } else if (section === 'seasons') {
        showAdminDialog('Управление сезонами',`<form id="createSeasonForm" class="admin-form"><h3>Создать сезон</h3><div class="admin-form-grid"><label>Номер нового сезона<input id="newSeasonNumber" type="number" min="1" readonly required><small>Назначается автоматически по порядку.</small></label><label>Название<input id="newSeasonTitle" maxlength="160" required></label></div><label>Описание<textarea id="newSeasonDescription" rows="2"></textarea></label><label>Ссылка на изображение (необязательно)<input id="newSeasonLogo" type="url" placeholder="https://…"></label><label>Или загрузить изображение сезона<input id="newSeasonImage" type="file" accept="image/png,image/jpeg,image/webp"><small>PNG, JPG или WebP, до 10 МБ.</small></label><div class="admin-form-grid"><label>Начало регистрации<input id="newRegOpen" type="datetime-local"></label><label>Дедлайн регистрации<input id="newRegClose" type="datetime-local"></label><label>Дедлайн жюри<input id="newJuryDeadline" type="datetime-local"></label><label>Дедлайн телеголосования<input id="newTelevoteDeadline" type="datetime-local"></label><label>Дата конкурса<input id="newContestAt" type="datetime-local"></label></div><button class="button" type="submit">Создать сезон</button><p id="createSeasonMessage" class="admin-message" role="status"></p></form><hr class="admin-divider"><h3>Управление этапами и публикацией</h3><label>Сезон<select id="adminControlSeason"></select></label><form id="seasonControlsForm" class="admin-form"><label>Статус<select id="controlStatus"><option value="draft">Подготовка</option><option value="registration">Регистрация</option><option value="moderation">Модерация</option><option value="drawn">Жеребьёвка проведена</option><option value="jury_voting">Голосование жюри</option><option value="televoting">Телеголосование</option><option value="finished">Завершён</option><option value="archived">Архив</option></select></label><div class="admin-form-grid"><label>Начало регистрации<input id="controlRegOpen" type="datetime-local"></label><label>Дедлайн регистрации<input id="controlRegClose" type="datetime-local"></label><label>Дедлайн жюри<input id="controlJuryDeadline" type="datetime-local"></label><label>Дедлайн телеголосования<input id="controlTelevoteDeadline" type="datetime-local"></label><label>Дата конкурса<input id="controlContestAt" type="datetime-local"></label></div><div class="admin-checks"><label><input type="checkbox" id="controlParticipants"> Опубликовать участников</label><label><input type="checkbox" id="controlDraw"> Опубликовать жеребьёвку</label><label><input type="checkbox" id="controlJuryOpen"> Открыть голосование жюри</label><label><input type="checkbox" id="controlJuryResults"> Показать результаты жюри</label><label><input type="checkbox" id="controlTelevoteOpen"> Открыть телеголосование</label><label><input type="checkbox" id="controlTelevoteResults"> Показать результаты телеголосования</label><label><input type="checkbox" id="controlOverallResults"> Показать общий результат</label></div><label>Ссылка на Twitch<input type="url" id="controlTwitch" placeholder="https://www.twitch.tv/…"></label><div class="admin-checks"><label><input type="checkbox" id="controlTwitchPublished"> Показывать трансляцию на сайте</label><label><input type="checkbox" id="controlRecordingPublished"> Опубликовать запись финала</label></div><div class="admin-inline-actions"><button type="submit" class="button button-small">Сохранить настройки</button><button type="button" id="adminDrawButton" class="button button-ghost button-small">Провести жеребьёвку</button><button type="button" id="adminCloseJuryButton" class="button button-ghost button-small">Завершить жюривойт</button></div><p id="seasonControlsMessage" class="admin-message" role="status"></p></form><hr class="admin-divider"><div class="admin-form"><h3>Изображение сезона</h3><label>Новое изображение (PNG, JPG или WebP, до 10 МБ)<input id="replaceSeasonImage" type="file" accept="image/png,image/jpeg,image/webp"></label><button type="button" id="uploadSeasonImageButton" class="button button-ghost button-small">Загрузить новое изображение</button><p id="seasonImageMessage" class="admin-message" role="status"></p></div><hr class="admin-divider"><form id="deleteSeasonForm" class="admin-form"><h3>Удаление сезона</h3><p>Удалит сезон из рабочих списков. Перед удалением заявки и результаты попадут в архив, а фотографии и рекапы останутся доступны для истории.</p><label>Для подтверждения введи точное название выбранного сезона<input id="deleteSeasonConfirm" autocomplete="off" placeholder="Название сезона" required></label><button type="submit" class="button button-ghost button-small">Удалить сезон навсегда</button><p id="deleteSeasonMessage" class="admin-message" role="status"></p></form><hr class="admin-divider"><form id="recordingForm" class="admin-form"><h3>Запись финала</h3><label>Видео (до 50 МБ)<input id="recordingFile" type="file" accept="video/mp4,video/webm,video/quicktime" required></label><button class="button button-small" type="submit">Загрузить запись</button><p id="recordingMessage" class="admin-message" role="status"></p></form>`);
        const seasons = await fillSeasonSelect($('#adminControlSeason'));
        const nextSeasonNumber = () => Math.max(0, ...seasons.map(season => Number(season.season_number) || 0)) + 1;
        $('#newSeasonNumber').value = String(nextSeasonNumber());
        const toLocal = value => { if (!value) return ''; const d = new Date(value); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); return d.toISOString().slice(0,16); };
        const fillControls = () => {
          const selected = seasons.find(s=>s.id===$('#adminControlSeason').value);
          if (!selected) return;
          $('#controlStatus').value = selected.status;
          $('#controlRegOpen').value = toLocal(selected.registration_opens_at);
          $('#controlRegClose').value = toLocal(selected.registration_closes_at);
          $('#controlJuryDeadline').value = toLocal(selected.jury_deadline);
          $('#controlTelevoteDeadline').value = toLocal(selected.televote_deadline);
          $('#controlContestAt').value = toLocal(selected.contest_at);
          $('#deleteSeasonConfirm').value = '';
          $('#deleteSeasonMessage').textContent = '';
          $('#controlParticipants').checked = selected.participant_list_published;
          $('#controlDraw').checked = selected.draw_published;
          $('#controlJuryOpen').checked = selected.jury_voting_open;
          $('#controlJuryResults').checked = selected.jury_results_published;
          $('#controlTelevoteOpen').checked = selected.televote_open;
          $('#controlTelevoteResults').checked = selected.televote_results_published;
          $('#controlOverallResults').checked = selected.overall_results_published;
          $('#controlTwitch').value = selected.twitch_url || '';
          $('#controlTwitchPublished').checked = Boolean(selected.twitch_published);
          $('#controlRecordingPublished').checked = Boolean(selected.recording_published);
        };
        $('#adminControlSeason').addEventListener('change',fillControls);
        // Opening jury voting is a phase change, not just a visual toggle.
        $('#controlJuryOpen').addEventListener('change', () => {
          if ($('#controlJuryOpen').checked) {
            $('#controlStatus').value = 'jury_voting';
            $('#controlTelevoteOpen').checked = false;
          }
        });
        // Keep the phase and voting switches synchronized in both directions.
        $('#controlTelevoteOpen').addEventListener('change', () => {
          if ($('#controlTelevoteOpen').checked) {
            $('#controlStatus').value = 'televoting';
            $('#controlJuryOpen').checked = false;
          }
        });
        $('#controlStatus').addEventListener('change', () => {
          if ($('#controlStatus').value === 'jury_voting') {
            $('#controlJuryOpen').checked = true;
            $('#controlTelevoteOpen').checked = false;
          } else if ($('#controlStatus').value === 'televoting') {
            $('#controlJuryOpen').checked = false;
          }
        });
        $('#uploadSeasonImageButton').addEventListener('click',async()=>{
          const out=$('#seasonImageMessage');
          try {
            const seasonId=await selectedSeason('#adminControlSeason');
            const file=$('#replaceSeasonImage').files[0];
            if(!file) throw new Error('Сначала выбери изображение.');
            await window.SpringVisionAPI.requestForm('admin_upload_season_image',{seasonId},'file',file);
            out.textContent='Изображение сезона обновлено.';
            $('#replaceSeasonImage').value='';
            toast('Изображение обновлено');
            await loadAppState();
          } catch(error) { out.textContent=error.message||'Не удалось загрузить изображение.'; }
        });
        if (seasons.length) { $('#adminControlSeason').value = seasons[0].id; fillControls(); }
        const iso = id => { const v=$(id).value; return v ? new Date(v).toISOString() : null; };
        $('#createSeasonForm').addEventListener('submit',async event=>{
          event.preventDefault();
          const out=$('#createSeasonMessage');
          try {
            const created = await window.SpringVisionAPI.request('admin_create_season',{
              seasonNumber:Number($('#newSeasonNumber').value),title:$('#newSeasonTitle').value.trim(),
              description:$('#newSeasonDescription').value.trim(),logoUrl:$('#newSeasonLogo').value.trim()||null,
              registrationOpensAt:iso('#newRegOpen'),registrationClosesAt:iso('#newRegClose'),
              juryDeadline:iso('#newJuryDeadline'),televoteDeadline:iso('#newTelevoteDeadline'),contestAt:iso('#newContestAt')
            });
            const imageFile = $('#newSeasonImage').files[0];
            if (imageFile) {
              try {
                await window.SpringVisionAPI.requestForm('admin_upload_season_image',{seasonId:created.season.id},'file',imageFile);
              } catch(imageError) {
                out.textContent='Сезон создан, но изображение не загрузилось: '+(imageError.message||'ошибка загрузки.');
                toast('Изображение не загружено');
                await loadAppState();
                return;
              }
            }
            out.textContent='Сезон создан'+(imageFile?' и изображение загружено.':'.');
            toast('Сезон создан');
            const updated=await fillSeasonSelect($('#adminControlSeason'));
            seasons.splice(0,seasons.length,...updated);
            $('#newSeasonNumber').value = String(nextSeasonNumber());
            if(updated.length){$('#adminControlSeason').value=updated[0].id;fillControls();}
            await loadAppState();
          } catch(error){out.textContent=error.message||'Ошибка создания сезона.';}
        });
        $('#seasonControlsForm').addEventListener('submit',async event=>{
          event.preventDefault();
          const out=$('#seasonControlsMessage');
          try {
            const seasonId=await selectedSeason('#adminControlSeason');
            if ($('#controlTwitchPublished').checked && !$('#controlTwitch').value.trim()) throw new Error('Укажи ссылку на Twitch перед публикацией трансляции.');
            const seasonSaveResult = await window.SpringVisionAPI.request('admin_set_season',{
              seasonId,status:$('#controlStatus').value,
              registration_opens_at:iso('#controlRegOpen'),registration_closes_at:iso('#controlRegClose'),
              jury_deadline:iso('#controlJuryDeadline'),televote_deadline:iso('#controlTelevoteDeadline'),contest_at:iso('#controlContestAt'),
              participant_list_published:$('#controlParticipants').checked,
              draw_published:$('#controlDraw').checked,jury_voting_open:$('#controlJuryOpen').checked,
              jury_results_published:$('#controlJuryResults').checked,televote_open:$('#controlTelevoteOpen').checked,
              televote_results_published:$('#controlTelevoteResults').checked,overall_results_published:$('#controlOverallResults').checked,
              twitch_url:$('#controlTwitch').value.trim()||null,
              twitch_published:$('#controlTwitchPublished').checked,
              recording_published:$('#controlRecordingPublished').checked
            });
            out.textContent = seasonSaveResult.archiveWarning
              ? 'Настройки сохранены, но снимок архива не обновился: ' + seasonSaveResult.archiveWarning
              : seasonSaveResult.archiveSaved
                ? 'Настройки сохранены. Снимок сезона обновлён в архиве.'
                : 'Настройки и дедлайны сохранены.';
            const currentId=$('#adminControlSeason').value;
            const refreshed=await fillSeasonSelect($('#adminControlSeason'));
            seasons.splice(0,seasons.length,...refreshed);
            $('#adminControlSeason').value=currentId;
            fillControls();
            await loadAppState();
          } catch(error){out.textContent=error.message||'Не удалось сохранить настройки.';}
        });
        $('#adminCloseJuryButton').addEventListener('click',async()=>{
          const selected=seasons.find(s=>s.id===$('#adminControlSeason').value);
          if(!selected) return;
          if(!window.confirm('Завершить жюривойт сезона «'+selected.title+'»? Не проголосовавшим странам будут назначены случайные баллы. Уже поданные голоса сохранятся.')) return;
          const out=$('#seasonControlsMessage');
          try {
            $('#adminCloseJuryButton').disabled=true;
            const result=await window.SpringVisionAPI.request('admin_close_jury',{seasonId:selected.id});
            out.textContent='Жюривойт завершён. Случайные оценки назначены для '+result.randomBallots+' стран.'+(result.unableToAssign ? ' Не удалось назначить оценки: '+result.unableToAssign+'.' : '');
            const refreshed=await fillSeasonSelect($('#adminControlSeason'));
            seasons.splice(0,seasons.length,...refreshed);
            $('#adminControlSeason').value=selected.id;
            fillControls();
            await loadAppState();
          } catch(error){out.textContent=error.message||'Не удалось завершить жюривойт.';}
          finally { $('#adminCloseJuryButton').disabled=false; }
        });
        $('#deleteSeasonForm').addEventListener('submit',async event=>{
          event.preventDefault();
          const selected=seasons.find(s=>s.id===$('#adminControlSeason').value);
          const out=$('#deleteSeasonMessage');
          if(!selected){out.textContent='Сначала выбери сезон.';return;}
          if($('#deleteSeasonConfirm').value.trim()!==selected.title){out.textContent='Название не совпадает. Сезон не удалён.';return;}
          if(!window.confirm('Удалить сезон «'+selected.title+'» из рабочих данных? Заявки и голоса предварительно сохранятся в архиве, медиафайлы останутся на месте.')) return;
          try {
            const result=await window.SpringVisionAPI.request('admin_delete_season',{seasonId:selected.id,confirmTitle:$('#deleteSeasonConfirm').value.trim()});
            out.textContent='Сезон удалён. Архив сохранён; медиафайлов оставлено: '+(result.storageRetained || 0)+'.';
            toast('Сезон удалён');
            const refreshed=await fillSeasonSelect($('#adminControlSeason'));
            seasons.splice(0,seasons.length,...refreshed);
            if(refreshed.length){$('#adminControlSeason').value=refreshed[0].id;fillControls();}
            else {$('#adminControlSeason').replaceChildren();$('#deleteSeasonConfirm').value='';}
            await loadAppState();
          } catch(error){out.textContent=error.message||'Не удалось удалить сезон.';}
        });
        $('#adminDrawButton').addEventListener('click',async()=>{
          try { const seasonId=await selectedSeason('#adminControlSeason'); const result=await window.SpringVisionAPI.request('admin_draw',{seasonId}); $('#seasonControlsMessage').textContent=`Жеребьёвка создана: ${result.count} участников. Публикация выключена.`; await loadAppState(); }
          catch(error){adminError(error);}
        });
        $('#recordingForm').addEventListener('submit',async event=>{
          event.preventDefault(); const out=$('#recordingMessage');
          try { const seasonId=await selectedSeason('#adminControlSeason'); const file=$('#recordingFile').files[0]; if(!file) throw new Error('Выбери видеофайл.'); await window.SpringVisionAPI.requestForm('admin_upload_recording',{seasonId},'file',file); out.textContent='Запись загружена в приватное хранилище. Чтобы показать её посетителям, включи «Опубликовать запись финала» и сохрани настройки сезона.'; }
          catch(error){out.textContent=error.message||'Ошибка загрузки.';}
        });
      } else if (section === 'roles') {
        showAdminDialog('Права доступа',`<form id="adminRoleForm" class="admin-form"><p>Назначить или снять роль администратора можно по числовому Telegram ID пользователя. Пользователь должен хотя бы раз открыть мини-приложение.</p><label>Telegram ID<input id="roleTelegramId" inputmode="numeric" pattern="[0-9]+" required></label><label>Роль<select id="roleValue"><option value="admin">Администратор</option><option value="user">Обычный пользователь (снять админку)</option></select></label><button type="submit" class="button">Сохранить роль</button><p id="roleMessage" class="admin-message" role="status"></p></form>`);
        $('#adminRoleForm').addEventListener('submit',async event=>{
          event.preventDefault(); const out=$('#roleMessage');
          try { await window.SpringVisionAPI.request('admin_set_role',{telegramId:Number($('#roleTelegramId').value),role:$('#roleValue').value}); out.textContent='Роль изменена.'; }
          catch(error){out.textContent=error.message||'Не удалось изменить роль.';}
        });
      } else if (section === 'archive') {
        showAdminDialog('Исторический архив', '<p class="admin-message">Снимок сохраняет все заявки выбранного сезона, включая отозванные и отклонённые. Итоговые места появятся после завершения сезона и публикации результатов. Снимки обновляются автоматически при завершении или удалении сезона.</p><div class="admin-form-row"><label>Сезон для сохранения<select id="archiveSeasonSelect"></select></label><button type="button" class="button button-small" id="saveArchiveSnapshot">Сохранить снимок</button></div><div class="archive-admin-actions"><button type="button" class="button button-ghost button-small" id="downloadArchiveJSON">Скачать архив JSON</button><button type="button" class="button button-ghost button-small" id="refreshArchiveAdmin">Обновить список</button></div><p id="archiveAdminMessage" class="admin-message" role="status"></p><div id="archiveAdminList" class="archive-admin-list"></div>');
        const seasonSelect = $('#archiveSeasonSelect');
        const status = $('#archiveAdminMessage');
        const saveButton = $('#saveArchiveSnapshot');
        const downloadButton = $('#downloadArchiveJSON');
        const refreshButton = $('#refreshArchiveAdmin');
        const seasons = await fillSeasonSelect(seasonSelect);
        if (seasons.length) seasonSelect.value = seasons[0].id;
        else {
          saveButton.disabled = true;
          status.textContent = 'В базе пока нет сезонов для сохранения.';
        }

        const renderArchiveAdminList = (archives) => {
          const list = $('#archiveAdminList');
          list.replaceChildren();
          if (!archives.length) {
            const empty = document.createElement('p');
            empty.className = 'archive-empty';
            empty.textContent = 'Сохранённых снимков пока нет. Выбери сезон и нажми «Сохранить снимок».';
            list.append(empty);
            return;
          }
          const labels = { approved:'Одобрена', pending:'На проверке', rejected:'Отклонена', withdrawn:'Отозвана' };
          archives.forEach(archive => {
            const card = document.createElement('article');
            card.className = 'archive-admin-season';

            const header = document.createElement('div');
            header.className = 'archive-admin-season-header';
            const title = document.createElement('h3');
            title.textContent = '№' + archive.season_number + ' · ' + archive.season_title;
            const badge = document.createElement('span');
            badge.className = 'archive-status';
            badge.textContent = archive.is_public ? 'Опубликован' : 'Служебный снимок';
            header.append(title, badge);

            const meta = document.createElement('p');
            const savedAt = archive.archived_at && Number.isFinite(Date.parse(archive.archived_at))
              ? new Date(archive.archived_at).toLocaleString('ru-RU')
              : 'дата неизвестна';
            meta.textContent = 'Заявок: ' + Number(archive.entry_count || 0)
              + ' · Одобрено: ' + Number(archive.participant_count || 0)
              + ' · Снимок: ' + savedAt;
            card.append(header, meta);

            const entries = Array.isArray(archive.entries) ? archive.entries.slice() : [];
            entries.sort((a, b) => {
              const orderA = Number(a.performance_order || 9999);
              const orderB = Number(b.performance_order || 9999);
              return orderA - orderB || String(a.country_name || '').localeCompare(String(b.country_name || ''), 'ru');
            });

            const details = document.createElement('details');
            const summary = document.createElement('summary');
            summary.textContent = 'Все заявки (' + entries.length + ')';
            details.append(summary);
            const entryList = document.createElement('div');
            entryList.className = 'archive-admin-entries';
            entries.forEach(entry => {
              const row = document.createElement('div');
              row.className = 'archive-admin-entry';
              const rank = document.createElement('span');
              rank.textContent = entry.placement ? String(entry.placement) : '—';
              const copy = document.createElement('div');
              const name = document.createElement('strong');
              name.textContent = (entry.country_name || String(entry.country_code || '').toUpperCase())
                + ' · ' + (entry.artist || 'Исполнитель не указан');
              const song = document.createElement('small');
              song.textContent = entry.song_title || 'Название песни не указано';
              copy.append(name, song);
              const state = document.createElement('span');
              state.className = 'archive-status';
              state.textContent = labels[entry.status] || entry.status || 'Неизвестно';
              row.append(rank, copy, state);
              entryList.append(row);
            });
            if (!entries.length) {
              const empty = document.createElement('p');
              empty.className = 'admin-empty';
              empty.textContent = 'В этом сезоне не было заявок.';
              entryList.append(empty);
            }
            details.append(entryList);
            card.append(details);
            list.append(card);
          });
        };

        let archiveCache = [];
        const refreshArchiveList = async () => {
          status.textContent = 'Загружаем снимки…';
          const result = await window.SpringVisionAPI.request('admin_archive_list');
          archiveCache = result.archives || [];
          renderArchiveAdminList(archiveCache);
          status.textContent = archiveCache.length
            ? 'В архиве сохранено сезонов: ' + archiveCache.length + '.'
            : 'Архив пока пуст.';
          return archiveCache;
        };

        saveButton.addEventListener('click', async () => {
          if (!seasonSelect.value) {
            status.textContent = 'Сначала выбери сезон.';
            return;
          }
          saveButton.disabled = true;
          status.textContent = 'Сохраняем заявки и результаты…';
          try {
            const result = await window.SpringVisionAPI.request('admin_archive_save', { seasonId: seasonSelect.value });
            const saved = result.archive || {};
            status.textContent = 'Снимок сохранён: ' + Number(saved.entry_count || 0)
              + ' заявок, ' + Number(saved.participant_count || 0) + ' участников. '
              + (saved.is_public ? 'Он опубликован.' : 'Пока доступен только организаторам.');
            await refreshArchiveList();
          } catch (error) {
            status.textContent = error instanceof Error ? error.message : 'Не удалось сохранить снимок.';
          } finally {
            saveButton.disabled = !seasons.length;
          }
        });

        refreshButton.addEventListener('click', () => refreshArchiveList().catch(adminError));
        downloadButton.addEventListener('click', async () => {
          downloadButton.disabled = true;
          try {
            const result = await window.SpringVisionAPI.request('admin_archive_list');
            const payload = {
              exported_at: new Date().toISOString(),
              format: 'springvision-archive-v1',
              archives: result.archives || [],
            };
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type:'application/json;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'SpringVision_archive_' + new Date().toISOString().slice(0, 10) + '.json';
            document.body.append(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            status.textContent = 'Экспорт готов: сезонов ' + payload.archives.length + '.';
          } catch (error) {
            status.textContent = error instanceof Error ? error.message : 'Не удалось подготовить экспорт.';
          } finally {
            downloadButton.disabled = false;
          }
        });

        await refreshArchiveList();
      } else if (section === 'notifications') {
        showAdminDialog('Центр уведомлений',`<form id="adminNotificationForm" class="admin-form"><label>Аудитория<select id="notifyAudience"><option value="all">Все пользователи</option><option value="participants">Участники сезона</option><option value="jury">Жюри сезона</option><option value="unvoted_jury">Жюри, которое ещё не голосовало</option></select></label><label>Сезон<select id="notifySeason"></select></label><label>Заголовок<input id="notifyTitle" maxlength="120" required></label><label>Сообщение<textarea id="notifyMessage" maxlength="4000" rows="4" required></textarea></label><button type="submit" class="button">Отправить уведомление</button><p id="notifyStatus" class="admin-message" role="status"></p><small>Telegram не позволяет написать пользователям, которые никогда не запускали бота.</small></form>`);
        await fillSeasonSelect($('#notifySeason'),'Выбери сезон (если нужен)');
        $('#adminNotificationForm').addEventListener('submit',async event=>{
          event.preventDefault(); const out=$('#notifyStatus');
          try { const result=await window.SpringVisionAPI.request('admin_notify',{audience:$('#notifyAudience').value,seasonId:$('#notifySeason').value||null,title:$('#notifyTitle').value.trim(),message:$('#notifyMessage').value.trim()}); out.textContent=`Отправлено: ${result.sent}; ошибок доставки: ${result.failed}.`; }
          catch(error){out.textContent=error.message||'Ошибка отправки.';}
        });


      }
    } catch(error) { adminError(error); }
  };
  $$('.admin-tile').forEach(tile => tile.addEventListener('click', () => openAdminSection(tile.dataset.admin)));

  $('#applicationForm').addEventListener('submit', async event => {
    event.preventDefault();
    const countryCode = $('#countrySelect').value;
    const artist = $('#artistInput').value.trim();
    const songTitle = $('#songInput').value.trim();
    const performanceUrl = $('#youtubeInput').value.trim();
    const file = $('#videoInput').files[0];
    const performerPhoto = $('#performerPhotoInput').files[0];
    const message = $('#applicationMessage');
    if (!countryCode || !artist || !songTitle || !performanceUrl || !file || !performerPhoto) { message.textContent = 'Заполни все поля и обязательно загрузи фото исполнителя.'; return; }
    if (!performerPhoto.size || !['image/jpeg','image/png','image/webp'].includes(performerPhoto.type)) {
      message.textContent = 'Фото: JPG, PNG или WebP, до 10 МБ.';
      return;
    }
    if (performerPhoto.size > 10 * 1024 * 1024) { message.textContent = 'Фото больше 10 МБ.'; return; }
    let parsed;
    try { parsed = new URL(performanceUrl); } catch { message.textContent = 'Проверь ссылку: она должна быть корректным URL.'; return; }
    if (!['http:','https:'].includes(parsed.protocol)) { message.textContent = 'Разрешены только ссылки http:// и https://.'; return; }
    if (!file.size) { message.textContent = 'Видеофайл пустой.'; return; }
    if (file.size > 50 * 1024 * 1024) { message.textContent = 'Видео больше 50 МБ.'; return; }
    if (!['video/mp4','video/webm','video/quicktime'].includes(file.type)) {
      message.textContent = 'Подходит видео в формате MP4, WebM или MOV.';
      return;
    }
    if (!window.SpringVisionAPI?.configured()) {
      message.textContent = 'Система временно недоступна: сервер конкурса ещё не настроен. Заявка не отправлена.';
      toast('Заявка не отправлена');
      return;
    }
    if (!currentSeason?.id || currentSeason.status !== 'registration') {
      message.textContent = 'Сейчас регистрация закрыта.';
      return;
    }
    const submitButton = $('#applicationForm button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Отправляем…';
    message.textContent = '';
    try {
      await window.SpringVisionAPI.requestForm('submit_application', {
        seasonId: currentSeason.id, countryCode, artist, songTitle, performanceUrl
      }, [{ name: 'recap', file }, { name: 'performerPhoto', file: performerPhoto }]);
      message.textContent = 'Готово! Заявка отправлена. Её статус можно проверить в личном кабинете.';
      toast('Заявка отправлена');
      $('#applicationForm').reset();
      loadAppState();
    } catch (error) {
      message.textContent = error instanceof Error ? error.message : 'Не удалось отправить заявку.';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Отправить заявку →';
    }
  });

  async function loadAccount() {
    const content = $('#accountContent');
    content.replaceChildren();
    const loading = document.createElement('p');
    loading.textContent = 'Открываем профиль…';
    content.append(loading);
    const [me, mine, reservationState] = await Promise.all([
      window.SpringVisionAPI.request('me'),
      window.SpringVisionAPI.request('my_submissions'),
      window.SpringVisionAPI.request('my_country_reservations')
    ]);
    content.replaceChildren();
    const profile = me.profile || {};
    const heading = document.createElement('h3');
    heading.textContent = profile.display_name || 'Участник SpringVision';
    const details = document.createElement('p');
    details.textContent = profile.telegram_username ? '@' + profile.telegram_username : 'Аккаунт Telegram подтверждён';
    content.append(heading, details);
    if (me.isAdmin) {
      const admin = document.createElement('p');
      admin.className = 'account-role';
      admin.textContent = 'Доступ администратора';
      content.append(admin);
    }

    const activeReservation = reservationState.reservation || null;
    currentCountryReservation = activeReservation && currentSeason?.id === activeReservation.target_season_id
      ? activeReservation
      : null;
    const reservationPanel = document.createElement('section');
    reservationPanel.className = 'account-reservation';
    const reservationHeading = document.createElement('h3');
    reservationHeading.textContent = 'Резервация страны на следующий сезон';
    reservationPanel.append(reservationHeading);

    if (activeReservation) {
      const countryLabel = activeReservation.country_name || sortedCountries.find(c => c.code === activeReservation.country_code)?.name || activeReservation.country_code.toUpperCase();
      const summary = document.createElement('p');
      if (activeReservation.targetSeason) {
        summary.textContent = `Вы зарезервировали ${countryLabel} для SpringVision #${String(activeReservation.targetSeason.season_number).padStart(2,'0')}.`;
      } else {
        summary.textContent = `Вы зарезервировали ${countryLabel}. Резервация автоматически перейдёт на следующий сезон после его создания.`;
      }
      reservationPanel.append(summary);
      if (activeReservation.expires_at) {
        const deadline = document.createElement('p');
        deadline.textContent = `Заявку с песней необходимо отправить до ${formatMoscowDateTime(activeReservation.expires_at)} (МСК). После этого срока страна освободится.`;
        reservationPanel.append(deadline);
      } else if (activeReservation.targetSeason) {
        const note = document.createElement('p');
        note.textContent = 'Крайний срок будет установлен автоматически, когда организатор задаст дату окончания регистрации.';
        reservationPanel.append(note);
      }
      if (activeReservation.targetSeason && currentSeason?.id === activeReservation.target_season_id && currentSeason.status === 'registration') {
        const applyReserved = document.createElement('button');
        applyReserved.type = 'button';
        applyReserved.className = 'button button-small reservation-action';
        applyReserved.textContent = 'Подать заявку с этой страной →';
        applyReserved.addEventListener('click', () => {
          $('#accountDialog').close();
          openApplicationDialog();
        });
        reservationPanel.append(applyReserved);
      }
    } else if (reservationState.eligibleSeason) {
      const eligible = reservationState.eligibleSeason;
      const summary = document.createElement('p');
      summary.textContent = `Вы состояли в жюри завершённого сезона #${String(eligible.season_number).padStart(2,'0')} и можете зарезервировать ${eligible.country_name} для следующего сезона.`;
      reservationPanel.append(summary);
      if (eligible.targetSeason) {
        const target = document.createElement('p');
        target.textContent = `Следующий сезон: #${String(eligible.targetSeason.season_number).padStart(2,'0')} — ${eligible.targetSeason.title}.`;
        reservationPanel.append(target);
      }
      if (eligible.canReserve) {
        const reserveButton = document.createElement('button');
        reserveButton.type = 'button';
        reserveButton.className = 'button button-small reservation-action';
        reserveButton.textContent = 'Зарезервировать страну';
        reserveButton.addEventListener('click', async () => {
          reserveButton.disabled = true;
          reserveButton.textContent = 'Резервируем…';
          try {
            await window.SpringVisionAPI.request('reserve_country', { sourceSeasonId: eligible.id });
            toast(`${eligible.country_name} зарезервирована для следующего сезона`);
            await Promise.all([loadAccount(), loadAppState()]);
          } catch (error) {
            toast(error instanceof Error ? error.message : 'Не удалось зарезервировать страну.');
            reserveButton.disabled = false;
            reserveButton.textContent = 'Зарезервировать страну';
          }
        });
        reservationPanel.append(reserveButton);
      } else {
        const reason = document.createElement('p');
        const existing = eligible.existingReservation;
        reason.textContent = existing?.status === 'submitted'
          ? 'Вы уже использовали это право и отправили заявку.'
          : eligible.blockedReason || 'Сейчас резервация недоступна.';
        reservationPanel.append(reason);
      }
    } else {
      const explanation = document.createElement('p');
      explanation.textContent = 'Право на резервацию появляется после завершения сезона, в жюри которого вы состояли.';
      reservationPanel.append(explanation);
    }
    content.append(reservationPanel);

    const title = document.createElement('h3');
    title.textContent = 'Мои заявки';
    content.append(title);
    const submissions = mine.submissions || [];
    if (!submissions.length) {
      const empty = document.createElement('p');
      empty.textContent = 'У тебя пока нет заявок на участие.';
      content.append(empty);
      return;
    }
    const labels = {pending:'На рассмотрении',approved:'Одобрена',rejected:'Отклонена',withdrawn:'Отозвана'};
    submissions.forEach(item => {
      const card = document.createElement('article');
      card.className = 'account-submission';
      const country = sortedCountries.find(c => c.code === item.country_code);
      const name = document.createElement('strong');
      name.textContent = `${country?.name || item.country_code.toUpperCase()} — ${item.artist} / ${item.song_title}`;
      const season = document.createElement('p');
      const seasonData = item.seasons;
      season.textContent = seasonData ? `Сезон #${seasonData.season_number}: ${seasonData.title}` : 'Сезон SpringVision';
      const status = document.createElement('p');
      status.className = 'account-submission-status';
      status.textContent = labels[item.status] || item.status;
      card.append(name,season,status);
      if (item.status === 'rejected' && item.moderation_comment) {
        const comment = document.createElement('p');
        comment.className = 'account-rejection-comment';
        comment.textContent = 'Комментарий организатора: ' + item.moderation_comment;
        card.append(comment);
      }
      content.append(card);
    });
  }

  const statusLabels = {
    draft: 'Подготовка сезона', registration: 'Регистрация открыта', moderation: 'Модерация заявок',
    drawn: 'Жеребьёвка проведена', jury_voting: 'Голосование жюри', televoting: 'Телеголосование',
    finished: 'Сезон завершён', archived: 'Архив'
  };
  const renderRecaps = (submissions, season) => {
    const list = $('#recapList');
    const approved = submissions || [];
    const drawOnly = Boolean(season?.draw_published && season?.status === 'drawn');
    const section = $('#recaps');
    const heading = section.querySelector('.section-heading h2');
    const subtitle = section.querySelector('.section-subtitle');
    if (drawOnly) {
      heading.textContent = 'Результаты жеребьёвки';
      subtitle.textContent = 'Порядок выступлений уже опубликован.';
      $('#recapCount').textContent = `${approved.length} стран`;
    } else {
      heading.textContent = 'Рекапы конкурса';
      subtitle.textContent = 'Выступления участников по порядку жеребьёвки.';
      $('#recapCount').textContent = `${approved.length} роликов`;
    }
    list.replaceChildren();
    if (!approved.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = drawOnly ? '<div class="empty-icon">♡</div><h3>Участники пока не опубликованы</h3><p>Список появится после публикации жеребьёвки.</p>' : '<div class="empty-icon">▷</div><h3>Выступлений пока нет</h3><p>Видео появятся после публикации жеребьёвки.</p>';
      list.append(empty);
      return;
    }
    approved.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'recap-item';
      const flag = document.createElement('img');
      flag.className = 'heart-flag recap-flag';
      flag.src = `assets/flags/heart/${item.country_code}.svg`;
      flag.alt = '';
      const found = sortedCountries.find(c => c.code === item.country_code);
      const countryName = found ? found.name : item.country_code.toUpperCase();
      const identity = document.createElement('div');
      identity.className = 'recap-identity';
      identity.append(flag);
      if (item.performer_photo_url) {
        const portrait = document.createElement('img');
        portrait.className = 'recap-portrait';
        portrait.src = item.performer_photo_url;
        portrait.alt = `Фото представителя ${countryName}`;
        portrait.loading = 'lazy';
        portrait.onerror = () => {
          portrait.hidden = true;
          identity.classList.add('has-photo-error');
        };
        identity.append(portrait);
      } else if (currentIsAdmin) {
        const missing = document.createElement('span');
        missing.className = 'recap-photo-missing';
        missing.textContent = 'Фото не загружено';
        identity.append(missing);
      }
      const details = document.createElement('div');
      details.className = 'recap-item-details';
      const title = document.createElement('strong');
      title.textContent = drawOnly
        ? `${item.performance_order ? String(item.performance_order).padStart(2,'0') + '. ' : ''}${countryName}`
        : `${item.performance_order ? String(item.performance_order).padStart(2,'0') + '. ' : ''}${item.artist} — ${item.song_title}`;
      details.append(title);
      if (!drawOnly) {
        const country = document.createElement('span');
        country.textContent = countryName;
        details.append(country);
      }
      // Keep the representative portrait beside the country flag in every recap stage.
      card.append(identity,details);
      if (!drawOnly && item.recap_storage_path) {
        const link = document.createElement('button');
        link.type = 'button';
        link.className = 'button button-small recap-play';
        link.textContent = 'Смотреть рекап ↗';
        link.addEventListener('click', async () => {
          const popup = window.open('about:blank', '_blank');
          if (popup) popup.opener = null;
          link.disabled = true;
          try {
            const fresh = await window.SpringVisionAPI.request('recap_download', {
              seasonId: currentSeason.id, submissionId: item.id
            });
            if (!fresh.recap_url) throw new Error('Сервер не вернул ссылку на рекап.');
            if (popup) popup.location.href = fresh.recap_url;
            else window.location.href = fresh.recap_url;
          } catch (error) {
            popup?.close();
            toast(error instanceof Error ? error.message : 'Не удалось открыть рекап.');
          } finally {
            link.disabled = false;
          }
        });
        card.append(link);
      }
      list.append(card);
    });
  };
  const renderVoting = (state) => {
    const section = $('#voting');
    const content = $('#votingContent');
    const results = $('#resultsContent');
    content.replaceChildren();
    results.replaceChildren();
    const submissions = state.submissions || [];
    const countryName = code => sortedCountries.find(c=>c.code===code)?.name || String(code).toUpperCase();
    const buildBallot = (title, action, allowOwn, isJury) => {
      const panel = document.createElement('article');
      panel.className = 'vote-panel';
      const heading = document.createElement('h3');
      heading.textContent = title;
      const intro = document.createElement('p');
      intro.textContent = isJury
        ? 'Распредели 12, 10 и 8–1 баллов между десятью разными странами. Своей стране нельзя поставить баллы.'
        : 'Распредели 12, 10 и 8–1 баллов между десятью разными странами. Один голос на аккаунт.';
      panel.append(heading,intro);
      if (submissions.length < 10) {
        const notice = document.createElement('p');
        notice.className = 'vote-notice';
        notice.textContent = 'Для голосования нужны минимум 10 утверждённых участников.';
        panel.append(notice);
        content.append(panel);
        return;
      }

      const gallery = document.createElement('section');
      gallery.className = 'vote-participants';
      const galleryHeading = document.createElement('div');
      galleryHeading.className = 'vote-participants-heading';
      const galleryTitle = document.createElement('strong');
      galleryTitle.textContent = 'Представители стран';
      const photoCount = submissions.filter(item => item.performer_photo_url).length;
      const galleryCount = document.createElement('small');
      galleryCount.textContent = `Фото загружено: ${photoCount} из ${submissions.length}`;
      galleryHeading.append(galleryTitle,galleryCount);
      const galleryGrid = document.createElement('div');
      galleryGrid.className = 'vote-participants-grid';
      submissions.forEach(item => {
        const person = document.createElement('article');
        person.className = 'vote-participant';
        const identity = document.createElement('div');
        identity.className = 'vote-participant-identity';
        const flag = document.createElement('img');
        flag.className = 'vote-participant-flag';
        flag.src = `assets/flags/heart/${item.country_code}.svg`;
        flag.alt = '';
        const photoBox = document.createElement('span');
        photoBox.className = 'vote-participant-photo-box';
        const placeholder = document.createElement('span');
        placeholder.className = 'vote-participant-photo-placeholder';
        placeholder.textContent = 'Фото';
        photoBox.append(placeholder);
        if (item.performer_photo_url) {
          const portrait = document.createElement('img');
          portrait.className = 'vote-participant-photo';
          portrait.src = item.performer_photo_url;
          portrait.alt = `Представитель: ${countryName(item.country_code)}`;
          portrait.loading = 'lazy';
          portrait.onload = () => { placeholder.hidden = true; };
          portrait.onerror = () => { portrait.hidden = true; placeholder.hidden = false; };
          photoBox.append(portrait);
        } else {
          placeholder.textContent = 'Нет фото';
        }
        identity.append(flag,photoBox);
        const info = document.createElement('div');
        info.className = 'vote-participant-info';
        const country = document.createElement('strong');
        country.textContent = countryName(item.country_code);
        const artist = document.createElement('small');
        artist.textContent = `${item.artist} — ${item.song_title}`;
        info.append(country,artist);
        person.append(identity,info);
        galleryGrid.append(person);
      });
      gallery.append(galleryHeading,galleryGrid);
      panel.append(gallery);

      const form = document.createElement('form');
      form.className = 'vote-form';
      const selects = [];
      POINTS.forEach(points => {
        const label = document.createElement('label');
        label.className = 'vote-row';
        const pointLabel = document.createElement('strong');
        pointLabel.textContent = `${points} баллов`;
        const preview = document.createElement('span');
        preview.className = 'vote-performer-preview';
        preview.hidden = true;
        const heart = document.createElement('img');
        heart.className = 'heart-flag vote-heart-flag';
        heart.alt = '';
        const portrait = document.createElement('img');
        portrait.className = 'vote-performer-photo';
        portrait.alt = 'Фото представителя';
        portrait.loading = 'lazy';
        portrait.onerror = () => { portrait.hidden = true; };
        preview.append(heart, portrait);
        const select = document.createElement('select');
        select.required = true;
        select.dataset.points = String(points);
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Выбери страну';
        select.append(placeholder);
        submissions.forEach(item => {
          const option = document.createElement('option');
          option.value = item.id;
          option.textContent = `${countryName(item.country_code)} — ${item.artist} / ${item.song_title}`;
          if (isJury && item.id === state.ownSubmissionId) option.disabled = true;
          select.append(option);
        });
        const updatePreview = () => {
          const item = submissions.find(s => s.id === select.value);
          preview.hidden = !item;
          if (!item) {
            heart.removeAttribute('src');
            portrait.removeAttribute('src');
            return;
          }
          heart.src = `assets/flags/heart/${item.country_code}.svg`;
          heart.alt = countryName(item.country_code);
          if (item.performer_photo_url) {
            portrait.src = item.performer_photo_url;
            portrait.hidden = false;
          } else {
            portrait.removeAttribute('src');
            portrait.hidden = true;
          }
        };
        select.addEventListener('change', updatePreview);
        selects.push(select);
        label.append(pointLabel,preview,select);
        form.append(label);
      });
      const refreshOptions = () => {
        const selected = new Set(selects.map(s=>s.value).filter(Boolean));
        selects.forEach(select => [...select.options].forEach(option => {
          if (!option.value) return;
          const selectedElsewhere = selected.has(option.value) && select.value !== option.value;
          option.disabled = selectedElsewhere || (isJury && option.value===state.ownSubmissionId);
        }));
      };
      selects.forEach(select => select.addEventListener('change',refreshOptions));
      const button = document.createElement('button');
      button.type = 'submit';
      button.className = 'button';
      button.textContent = isJury ? 'Сохранить оценки жюри' : 'Отправить телеголосование';
      const status = document.createElement('p');
      status.className = 'admin-message';
      status.setAttribute('role','status');
      form.append(button,status);
      form.addEventListener('submit',async event=>{
        event.preventDefault();
        const chosen = selects.map(select=>({submissionId:select.value,points:Number(select.dataset.points)}));
        if (chosen.some(v=>!v.submissionId) || new Set(chosen.map(v=>v.submissionId)).size!==10) {
          status.textContent='Выбери десять разных стран.';
          return;
        }
        button.disabled=true;
        status.textContent='Сохраняем…';
        try {
          await window.SpringVisionAPI.request(action,{seasonId:currentSeason.id,votes:chosen});
          status.textContent=isJury?'Оценки сохранены. До публикации результаты другим жюри не видны.':'Телеголосование принято. Повторно проголосовать нельзя.';
          if(!isJury) button.disabled=true;
          toast('Голос сохранён');
        } catch(error) {
          status.textContent=error.message||'Не удалось сохранить голос.';
          button.disabled=false;
        }
      });
      panel.append(form);
      content.append(panel);
    };
    let shown = false;
    if (state.juryEligible && currentSeason?.status==='jury_voting' && currentSeason.jury_voting_open) {
      buildBallot('Голосование жюри','jury_submit',false,true);
      shown = true;
    }
    if (currentSeason?.status==='televoting' && currentSeason.televote_open) {
      buildBallot('Телеголосование','televote_submit',true,false);
      shown = true;
    }
    const buildResults = (title, rows) => {
      const panel = document.createElement('article');
      panel.className='results-panel';
      const heading=document.createElement('h3'); heading.textContent=title; panel.append(heading);
      if (!rows?.length) {
        const empty=document.createElement('p'); empty.textContent='Нет опубликованных данных.'; panel.append(empty);
      } else {
        const table=document.createElement('div'); table.className='results-list';
        rows.forEach((row,index)=>{
          const item=submissions.find(s=>s.id===row.submission_id);
          if(!item) return;
          const line=document.createElement('div'); line.className='results-row';
          const rank=document.createElement('strong'); rank.textContent=String(index+1).padStart(2,'0');
          const name=document.createElement('span'); name.textContent=`${countryName(item.country_code)} — ${item.artist} / ${item.song_title}`;
          const score=document.createElement('b'); score.textContent=String(row.points);
          line.append(rank,name,score); table.append(line);
        });
        panel.append(table);
      }
      results.append(panel);
    };
    if (state.juryResults) { buildResults('Результаты жюри',state.juryResults); shown=true; }
    if (state.televoteResults) { buildResults('Результаты телеголосования',state.televoteResults); shown=true; }
    if (state.overallResults) { buildResults('Итоговая таблица',state.overallResults); shown=true; }
    section.hidden=!shown;
  };


  async function loadPublicArchive() {
    const list = $('#archiveList');
    if (!list) return;
    try {
      const result = await window.SpringVisionAPI.request('public_archive');
      const archives = result.archives || [];
      list.replaceChildren();
      if (!archives.length) {
        const empty = document.createElement('div');
        empty.className = 'archive-empty';
        empty.textContent = 'Завершённые сезоны появятся здесь после публикации итоговых результатов.';
        list.append(empty);
        return;
      }
      archives.forEach(season => {
        const card = document.createElement('article');
        card.className = 'archive-season';
        const header = document.createElement('div');
        header.className = 'archive-season-header';
        if (season.logo_url) {
          const logo = document.createElement('img');
          logo.className = 'archive-season-logo';
          logo.src = season.logo_url;
          logo.alt = '';
          logo.loading = 'lazy';
          logo.onerror = () => { logo.hidden = true; };
          header.append(logo);
        }
        const heading = document.createElement('div');
        heading.className = 'archive-season-heading';
        const eyebrow = document.createElement('div');
        eyebrow.className = 'eyebrow';
        eyebrow.textContent = 'СЕЗОН №' + season.season_number;
        const title = document.createElement('h3');
        title.textContent = season.season_title;
        const meta = document.createElement('p');
        const date = season.contest_at ? new Date(season.contest_at).toLocaleDateString('ru-RU') : '';
        meta.textContent = [date ? 'Финал: ' + date : '', (season.participant_count || 0) + ' участников'].filter(Boolean).join(' · ');
        heading.append(eyebrow, title, meta);
        const total = document.createElement('div');
        total.className = 'archive-season-total';
        const totalNumber = document.createElement('strong');
        totalNumber.textContent = String(season.standings?.length || 0);
        const totalLabel = document.createElement('span');
        totalLabel.textContent = 'стран';
        total.append(totalNumber, totalLabel);
        header.append(heading, total);
        card.append(header);
        const standings = document.createElement('div');
        standings.className = 'archive-standings';
        const entries = Array.isArray(season.standings) ? season.standings : [];
        if (!entries.length) {
          const empty = document.createElement('p');
          empty.className = 'archive-empty';
          empty.textContent = 'В этом сезоне не сохранена итоговая таблица.';
          standings.append(empty);
        }
        entries.forEach(entry => {
          const row = document.createElement('article');
          row.className = 'archive-entry';
          const rank = document.createElement('strong');
          rank.className = 'archive-entry-rank';
          rank.textContent = entry.placement ? String(entry.placement).padStart(2, '0') : '—';
          const main = document.createElement('div');
          main.className = 'archive-entry-main';
          if (entry.performer_photo_url) {
            const photo = document.createElement('img');
            photo.className = 'archive-entry-photo';
            photo.src = entry.performer_photo_url;
            photo.alt = '';
            photo.loading = 'lazy';
            photo.onerror = () => { photo.hidden = true; };
            main.append(photo);
          }
          const flag = document.createElement('img');
          flag.className = 'archive-entry-flag';
          flag.src = 'assets/flags/heart/' + String(entry.country_code || '').toLowerCase() + '.svg';
          flag.alt = '';
          flag.onerror = () => { flag.hidden = true; };
          const copy = document.createElement('div');
          copy.className = 'archive-entry-copy';
          const country = document.createElement('span');
          country.className = 'archive-entry-country';
          country.textContent = entry.country_name || String(entry.country_code || '').toUpperCase();
          const artist = document.createElement('strong');
          artist.textContent = entry.artist || 'Исполнитель не указан';
          const song = document.createElement('small');
          song.textContent = '«' + (entry.song_title || 'Без названия') + '»';
          copy.append(country, artist, song);
          main.append(flag, copy);
          const points = document.createElement('div');
          points.className = 'archive-entry-points';
          const score = document.createElement('strong');
          score.textContent = String(entry.total_points || 0);
          const scoreLabel = document.createElement('small');
          scoreLabel.textContent = 'баллов';
          points.append(score, scoreLabel);
          row.append(rank, main, points);
          standings.append(row);
          const actions = document.createElement('div');
          actions.className = 'archive-entry-actions';
          if (entry.recap_url) {
            const recap = document.createElement('a');
            recap.href = entry.recap_url;
            recap.target = '_blank';
            recap.rel = 'noopener noreferrer';
            recap.textContent = 'Смотреть рекап ↗';
            actions.append(recap);
          }
          if (entry.performance_url) {
            const performance = document.createElement('a');
            performance.href = entry.performance_url;
            performance.target = '_blank';
            performance.rel = 'noopener noreferrer';
            performance.textContent = 'Выступление / клип ↗';
            actions.append(performance);
          }
          if (actions.childElementCount) standings.append(actions);
        });
        card.append(standings);
        const media = document.createElement('div');
        media.className = 'archive-season-media';
        if (season.recording_url) {
          const recording = document.createElement('a');
          recording.href = season.recording_url;
          recording.target = '_blank';
          recording.rel = 'noopener noreferrer';
          recording.textContent = 'Запись финала ↗';
          media.append(recording);
        }
        if (season.combined_recap_url) {
          const combined = document.createElement('a');
          combined.href = season.combined_recap_url;
          combined.target = '_blank';
          combined.rel = 'noopener noreferrer';
          combined.textContent = 'Общий рекап сезона ↗';
          media.append(combined);
        }
        if (season.twitch_url) {
          const twitch = document.createElement('a');
          twitch.href = season.twitch_url;
          twitch.target = '_blank';
          twitch.rel = 'noopener noreferrer';
          twitch.textContent = 'Трансляция на Twitch ↗';
          media.append(twitch);
        }
        if (media.childElementCount) card.append(media);
        list.append(card);
      });
    } catch (error) {
      list.replaceChildren();
      const empty = document.createElement('div');
      empty.className = 'archive-empty';
      empty.textContent = 'Не удалось загрузить архив. Открой приложение через Telegram и попробуй обновить страницу.';
      list.append(empty);
      console.warn('SpringVision archive could not be loaded:', error);
    }
  }

  const renderFinalMedia = (season) => {
    const section = $('#finalMedia');
    const content = $('#finalMediaContent');
    content.replaceChildren();
    if (!season || (!(season.twitch_published && season.twitch_url) && !season.recording_url)) {
      section.hidden = true;
      return;
    }
    section.hidden = false;
    if (season.twitch_published && season.twitch_url) {
      const panel = document.createElement('article');
      panel.className = 'final-media-panel';
      const title = document.createElement('h3');
      title.textContent = 'Прямая трансляция';
      panel.append(title);
      try {
        const parsed = new URL(season.twitch_url);
        const parts = parsed.pathname.split('/').filter(Boolean);
        const player = document.createElement('iframe');
        player.className = 'twitch-player';
        player.title = 'Трансляция SpringVision на Twitch';
        player.allow = 'autoplay; fullscreen';
        player.allowFullscreen = true;
        player.loading = 'lazy';
        const parent = encodeURIComponent(window.location.hostname);
        if (parsed.hostname.toLowerCase() === 'www.twitch.tv' || parsed.hostname.toLowerCase() === 'twitch.tv') {
          if (parts[0] === 'videos' && parts[1]) player.src = `https://player.twitch.tv/?video=${encodeURIComponent(parts[1])}&parent=${parent}`;
          else if (parts[0] && !parts[0].startsWith('clip')) player.src = `https://player.twitch.tv/?channel=${encodeURIComponent(parts[0])}&parent=${parent}`;
        }
        if (player.src) {
          panel.append(player);
          const fullscreenRow = document.createElement('div');
          fullscreenRow.className = 'final-media-actions';
          const fullscreenButton = document.createElement('button');
          fullscreenButton.type = 'button';
          fullscreenButton.className = 'button';
          fullscreenButton.textContent = 'Открыть на весь экран ⛶';
          fullscreenButton.addEventListener('click', async () => {
            try {
              const requestFullscreen = player.requestFullscreen || player.webkitRequestFullscreen;
              if (requestFullscreen) {
                await requestFullscreen.call(player);
                return;
              }
            } catch (error) {
              console.warn('Полноэкранный режим недоступен во встроенном браузере:', error);
            }
            const openTwitch = () => {
              if (window.Telegram?.WebApp?.openLink) {
                window.Telegram.WebApp.openLink(season.twitch_url);
              } else {
                window.open(season.twitch_url, '_blank', 'noopener,noreferrer');
              }
            };
            openTwitch();
          });
          fullscreenRow.append(fullscreenButton);
          panel.append(fullscreenRow);
        } else {
          const link = document.createElement('a');
          link.href = season.twitch_url; link.target = '_blank'; link.rel = 'noopener noreferrer';
          link.className = 'button'; link.textContent = 'Открыть трансляцию на Twitch ↗';
          panel.append(link);
        }
      } catch {}
      content.append(panel);
    }
    if (season.recording_url) {
      const panel = document.createElement('article');
      panel.className = 'final-media-panel';
      const title = document.createElement('h3');
      title.textContent = 'Запись финала';
      const video = document.createElement('video');
      video.className = 'final-recording';
      video.controls = true;
      video.preload = 'metadata';
      video.src = season.recording_url;
      panel.append(title,video);
      content.append(panel);
    }
  };


  const renderPublicArchive = (archives) => {
    const root = $('#archiveList');
    if (!root) return;
    root.replaceChildren();
    if (!Array.isArray(archives) || !archives.length) {
      const empty = document.createElement('div');
      empty.className = 'archive-empty';
      empty.textContent = 'Архив пока пуст. Итоги сезона появятся здесь после завершения конкурса и публикации результатов.';
      root.append(empty);
      return;
    }

    const addLink = (parent, label, url) => {
      if (typeof url !== 'string' || !url.trim()) return;
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = label;
      parent.append(link);
    };

    archives.forEach(season => {
      const card = document.createElement('article');
      card.className = 'archive-season';

      const header = document.createElement('div');
      header.className = 'archive-season-header';

      if (season.logo_url) {
        const logo = document.createElement('img');
        logo.className = 'archive-season-logo';
        logo.src = season.logo_url;
        logo.alt = 'Логотип ' + (season.season_title || 'сезона');
        logo.loading = 'lazy';
        logo.onerror = () => { logo.hidden = true; };
        header.append(logo);
      }

      const heading = document.createElement('div');
      heading.className = 'archive-season-heading';

      const eyebrow = document.createElement('div');
      eyebrow.className = 'eyebrow';
      eyebrow.textContent = 'SPRINGVISION · СЕЗОН №' + String(season.season_number).padStart(2, '0');

      const title = document.createElement('h3');
      title.textContent = season.season_title || ('Сезон №' + season.season_number);

      const description = document.createElement('p');
      const dateText = season.contest_at && Number.isFinite(Date.parse(season.contest_at))
        ? new Date(season.contest_at).toLocaleDateString('ru-RU', { day:'numeric', month:'long', year:'numeric' })
        : 'Дата финала не указана';
      description.textContent = dateText + ' · ' + Number(season.participant_count || 0) + ' участников';

      heading.append(eyebrow, title, description);
      header.append(heading);

      const total = document.createElement('div');
      total.className = 'archive-season-total';
      const totalNumber = document.createElement('strong');
      totalNumber.textContent = String(Number(season.participant_count || 0));
      const totalLabel = document.createElement('span');
      totalLabel.textContent = 'участников';
      total.append(totalNumber, totalLabel);
      header.append(total);
      card.append(header);

      if (season.description) {
        const note = document.createElement('p');
        note.className = 'archive-season-description';
        note.textContent = season.description;
        card.append(note);
      }

      const standings = Array.isArray(season.standings) ? season.standings : [];
      const list = document.createElement('div');
      list.className = 'archive-standings';

      if (!standings.length) {
        const empty = document.createElement('p');
        empty.className = 'archive-empty';
        empty.textContent = 'Итоговая таблица для этого сезона не сохранена.';
        list.append(empty);
      } else {
        standings.forEach(entry => {
          const row = document.createElement('article');
          row.className = 'archive-entry';

          const rank = document.createElement('div');
          rank.className = 'archive-entry-rank';
          rank.textContent = entry.placement ? String(entry.placement) + ' место' : '—';

          const main = document.createElement('div');
          main.className = 'archive-entry-main';

          const flag = document.createElement('img');
          flag.className = 'archive-entry-flag';
          flag.src = 'assets/flags/heart/' + String(entry.country_code || '').toLowerCase() + '.svg';
          flag.alt = '';
          flag.loading = 'lazy';
          flag.onerror = () => { flag.hidden = true; };
          main.append(flag);

          if (entry.performer_photo_url) {
            const photo = document.createElement('img');
            photo.className = 'archive-entry-photo';
            photo.src = entry.performer_photo_url;
            photo.alt = 'Фото представителя ' + (entry.country_name || '');
            photo.loading = 'lazy';
            photo.onerror = () => { photo.hidden = true; };
            main.append(photo);
          }

          const copy = document.createElement('div');
          copy.className = 'archive-entry-copy';
          const country = document.createElement('span');
          country.className = 'archive-entry-country';
          country.textContent = entry.country_name || String(entry.country_code || '').toUpperCase();
          const artist = document.createElement('strong');
          artist.textContent = entry.artist || 'Исполнитель не указан';
          const song = document.createElement('small');
          song.textContent = entry.song_title || 'Название песни не указано';
          copy.append(country, artist, song);
          main.append(copy);

          const points = document.createElement('div');
          points.className = 'archive-entry-points';
          const pointsTotal = document.createElement('strong');
          pointsTotal.textContent = String(Number(entry.total_points || 0));
          const pointsLabel = document.createElement('small');
          pointsLabel.textContent = 'баллов';
          const split = document.createElement('small');
          split.textContent = 'Жюри ' + Number(entry.jury_points || 0) + ' · зрители ' + Number(entry.televote_points || 0);
          points.append(pointsTotal, pointsLabel, split);

          row.append(rank, main, points);

          const actions = document.createElement('div');
          actions.className = 'archive-entry-actions';
          addLink(actions, 'Песня / выступление ↗', entry.performance_url);
          addLink(actions, '30-секундный рекап ↗', entry.recap_url);
          if (actions.childElementCount) row.append(actions);

          list.append(row);
        });
      }
      card.append(list);

      const media = document.createElement('div');
      media.className = 'archive-season-media';
      addLink(media, 'Общий рекап сезона ↗', season.combined_recap_url);
      addLink(media, 'Запись финала ↗', season.recording_url);
      addLink(media, 'Трансляция на Twitch ↗', season.twitch_url);
      if (media.childElementCount) card.append(media);

      root.append(card);
    });
  };

  const loadPublicArchive = async () => {
    if (archiveLoading || !window.SpringVisionAPI?.configured()) return;
    archiveLoading = true;
    try {
      const result = await window.SpringVisionAPI.request('public_archive');
      renderPublicArchive(result.archives || []);
      lastArchiveLoadedAt = Date.now();
    } catch (error) {
      const root = $('#archiveList');
      if (root) {
        root.replaceChildren();
        const empty = document.createElement('div');
        empty.className = 'archive-empty';
        empty.textContent = 'Не удалось загрузить архив. Обнови страницу чуть позже.';
        root.append(empty);
      }
    } finally {
      archiveLoading = false;
    }
  };

  async function loadAppState() {
    if (stateLoading) return;
    if (!window.SpringVisionAPI?.configured()) {
      $('#seasonStatus').textContent = 'Нет связи';
      $('#seasonTitle').textContent = 'SpringVision';
      $('#seasonCardName').textContent = 'Сезон временно недоступен';
      $('#seasonDescription').textContent = 'Не получилось подключиться к серверу. Попробуй обновить приложение.';
      $('#seasonProgressLabel').textContent = 'Нет соединения';
      $('#applyButton').disabled = true;
      $('#voting').hidden = true;
      renderRecaps([]);
      renderFinalMedia(null);
      return;
    }
    stateLoading = true;
    try {
      const state = await window.SpringVisionAPI.request('public_state');
      await loadPublicArchive();
      lastStateLoadedAt = Date.now();
      currentProfile = state.profile || null;
      currentIsAdmin = Boolean(state.isAdmin);
      $('#admin').hidden = !currentIsAdmin;
      if (!state.season) {
        $('#seasonStatus').textContent = 'Сезон ещё не создан';
        $('#seasonTitle').textContent = 'SpringVision';
        $('#seasonCardName').textContent = 'Ожидаем новый сезон';
        $('#applyButton').disabled = true;
        $('#voting').hidden = true;
        renderRecaps([]);
        renderFinalMedia(null);
        return;
      }
      currentSeason = state.season;
      reservedCountryCodes = new Set(state.reservedCountryCodes || []);
      currentCountryReservation = state.countryReservation || null;
      const registrationStartsAt = currentSeason.registration_opens_at ? Date.parse(currentSeason.registration_opens_at) : NaN;
      const registrationEndsAt = currentSeason.registration_closes_at ? Date.parse(currentSeason.registration_closes_at) : NaN;
      const hasRegistrationWindow = Number.isFinite(registrationStartsAt) &&
        Number.isFinite(registrationEndsAt) && registrationEndsAt > registrationStartsAt;
      const now = Date.now();
      const canApplyNow = currentSeason.status === 'registration' && hasRegistrationWindow &&
        now >= registrationStartsAt && now <= registrationEndsAt;
      const registrationUpcoming = currentSeason.status === 'registration' && hasRegistrationWindow &&
        now < registrationStartsAt;
      const currentStatusLabel = currentSeason.status === 'registration'
        ? (canApplyNow ? 'Приём заявок открыт' : registrationUpcoming ? 'Скоро откроется' : 'Приём заявок закрыт')
        : (statusLabels[currentSeason.status] || currentSeason.status);
      $('#seasonStatus').textContent = currentStatusLabel;
      const progress = ({draft:5,registration:20,moderation:35,drawn:50,jury_voting:65,televoting:80,finished:100,archived:100})[currentSeason.status] || 0;
      $('#seasonProgressLabel').textContent = currentStatusLabel;
      $('#seasonProgressBar').style.width = `${progress}%`;
      $('#seasonTitle').textContent = currentSeason.title;
      const seasonLogo = $('#seasonLogo');
      seasonLogo.onerror = () => { seasonLogo.hidden = true; seasonLogo.removeAttribute('src'); };
      if (typeof currentSeason.logo_url === 'string' && currentSeason.logo_url.trim()) {
        seasonLogo.src = currentSeason.logo_url.trim();
        seasonLogo.hidden = false;
      } else {
        seasonLogo.hidden = true;
        seasonLogo.removeAttribute('src');
      }
      $('#seasonCardName').textContent = currentSeason.title || `SpringVision ${String(currentSeason.season_number).padStart(2,'0')}`;
      const stageDescriptions = {
        draft: 'Организаторы готовят конкурс. Следи за обновлениями.',
        moderation: 'Организаторы проверяют заявки. Следующий этап появится здесь.',
        drawn: 'Жеребьёвка опубликована. Смотри порядок выступлений ниже.',
        jury_voting: 'Идёт голосование жюри. Выставь баллы в разделе голосования.',
        televoting: 'Открыто телеголосование. Поддержи участников.',
        finished: 'Конкурс завершён. Выступления и результаты собраны ниже.',
        archived: 'Архив сезона: выступления и результаты.'
      };
      const registrationDescription = canApplyNow
        ? `Приём заявок до ${formatMoscowDateTime(currentSeason.registration_closes_at)} МСК. Подготовь песню, ссылку, фото исполнителя и 30-секундный рекап.`
        : registrationUpcoming
          ? `Регистрация откроется ${formatMoscowDateTime(currentSeason.registration_opens_at)} МСК.`
          : 'Приём заявок закрыт. Следи здесь за жеребьёвкой, выступлениями и голосованием.';
      $('#seasonDescription').textContent = currentSeason.description ||
        (currentSeason.status === 'registration' ? registrationDescription : (stageDescriptions[currentSeason.status] || 'Все новости и этапы конкурса будут здесь.'));
      const deadlineRows = [
        [registrationUpcoming ? 'Регистрация откроется' : 'Заявки до', registrationUpcoming ? currentSeason.registration_opens_at : currentSeason.registration_closes_at],
        ['Голосование жюри до', currentSeason.jury_deadline],
        ['Телеголосование до', currentSeason.televote_deadline],
        ['Дата финала', currentSeason.contest_at],
      ].filter(([,value]) => value && Number.isFinite(Date.parse(value)));
      const deadlinesBox = $('#seasonDeadlines');
      deadlinesBox.replaceChildren();
      if (deadlineRows.length) {
        const heading = document.createElement('strong');
        heading.textContent = 'Важные даты';
        deadlinesBox.append(heading);
        const list = document.createElement('div');
        list.className = 'season-deadlines-list';
        deadlineRows.forEach(([label,value]) => {
          const row = document.createElement('div');
          row.className = 'season-deadline-row';
          const name = document.createElement('span');
          name.textContent = label;
          const date = document.createElement('time');
          date.dateTime = new Date(value).toISOString();
          date.textContent = new Date(value).toLocaleString('ru-RU',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit',timeZone:'Europe/Moscow'});
          row.append(name,date);
          list.append(row);
        });
        deadlinesBox.append(list);
        deadlinesBox.hidden = false;
      } else deadlinesBox.hidden = true;
      $('#applyButton').disabled = !canApplyNow;
      $('#applyButton').textContent = canApplyNow ? 'Подать заявку →' : registrationUpcoming ? 'Скоро откроется' : 'Приём заявок закрыт';
      renderCountryOptions(countrySearch.value);
      renderRecaps(state.submissions || [], currentSeason);
      renderVoting(state);
      renderFinalMedia(currentSeason);
      if (state.isAdmin) $('#admin').hidden = false;
    } catch (error) {
      $('#seasonStatus').textContent = 'Нет соединения с сервером';
      toast(error instanceof Error ? error.message : 'Не получилось загрузить конкурс. Обнови приложение.');
    } finally {
      stateLoading = false;
    }
  }

  // Private Storage image links expire. Refresh app state when the Mini App returns after a while.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && Date.now() - lastStateLoadedAt > 45 * 60 * 1000) loadAppState();
    if (!document.hidden && Date.now() - lastArchiveLoadedAt > 45 * 60 * 1000) loadPublicArchive();
  });
  window.addEventListener('pageshow', () => {
    if (Date.now() - lastStateLoadedAt > 45 * 60 * 1000) loadAppState();
    if (Date.now() - lastArchiveLoadedAt > 45 * 60 * 1000) loadPublicArchive();
  });

  if (window.SpringVisionAPI?.configured()) {
    $('#seasonStatus').textContent = 'Открываем сезон…';
    loadAppState();
    loadPublicArchive();
  } else {
    $('#seasonStatus').textContent = 'Сервер не подключён';
  }
})();
