(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const config = window.SPRINGVISION_CONFIG || { demoMode: true };
  let currentSeason = null;
  let reservedCountryCodes = new Set();
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
  const sortedCountries = countries
    .map(([flag, name]) => ({ flag, name, code: countryCodeFromEmoji(flag) }))
    .sort((a,b) => a.name.localeCompare(b.name, 'ru'));
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
  $('#accountButton').addEventListener('click', () => openDialog('accountDialog'));
  $('#applyButton').addEventListener('click', () => {
    $('#applicationMessage').textContent = '';
    $('#applicationForm').reset();
    countryPickerCurrentName.textContent = 'Выбери страну';
    countryPickerCurrentFlag.textContent = '♡';
    renderCountryOptions();
    openDialog('applicationDialog');
  });
  $('#menuToggle').addEventListener('click', () => $('#mainNav').classList.toggle('nav-open'));
  $$('#mainNav a').forEach(link => link.addEventListener('click', () => $('#mainNav').classList.remove('nav-open')));
  $$('.admin-tile').forEach(tile => tile.addEventListener('click', () => {
    const data = {
      applications: ['Модерация заявок','Здесь будет список заявок со статусами «на рассмотрении», «одобрена» и «отклонена». При отклонении организатор сможет оставить комментарий.'],
      seasons: ['Управление сезонами','Создание сезона, название, логотип, даты регистрации, дедлайн жюри, дата шоу и настройки жеребьёвки будут управляться здесь.'],
      roles: ['Права доступа','Главный администратор сможет назначать администраторов. Роль жюри будет выдаваться одобренному участнику только на один сезон и сниматься после его завершения.'],
      notifications: ['Центр уведомлений','Можно будет отправлять сообщения всем пользователям, участникам сезона, жюри или только тем, кто ещё не проголосовал. Доставка будет зависеть от того, запускал ли пользователь бота.']
    }[tile.dataset.admin];
    $('#adminDialogTitle').textContent = data[0]; $('#adminDialogText').textContent = data[1]; openDialog('adminDialog');
  }));

  $('#applicationForm').addEventListener('submit', async event => {
    event.preventDefault();
    const countryCode = $('#countrySelect').value;
    const artist = $('#artistInput').value.trim();
    const songTitle = $('#songInput').value.trim();
    const performanceUrl = $('#youtubeInput').value.trim();
    const file = $('#videoInput').files[0];
    const message = $('#applicationMessage');
    if (!countryCode || !artist || !songTitle || !performanceUrl || !file) { message.textContent = 'Заполни все поля.'; return; }
    let parsed;
    try { parsed = new URL(performanceUrl); } catch { message.textContent = 'Проверь ссылку: она должна быть корректным URL.'; return; }
    if (!['http:','https:'].includes(parsed.protocol)) { message.textContent = 'Разрешены только ссылки http:// и https://.'; return; }
    if (file.size > 50 * 1024 * 1024) { message.textContent = 'Файл больше 50 МБ.'; return; }
    if (!file.type.startsWith('video/')) { message.textContent = 'Выбери видеофайл.'; return; }
    if (!window.SpringVisionAPI?.configured()) {
      message.textContent = 'Проверка пройдена. Это демонстрационный режим: заявка и файл не отправлены.';
      toast('Демо: данные не отправлены');
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
      }, 'recap', file);
      message.textContent = 'Заявка отправлена на модерацию. Страна зарезервирована за вашей заявкой.';
      toast('Заявка отправлена');
      $('#applicationForm').reset();
      loadAppState();
    } catch (error) {
      message.textContent = error instanceof Error ? error.message : 'Не удалось отправить заявку.';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Проверить заявку →';
    }
  });

  const statusLabels = {
    draft: 'Подготовка сезона', registration: 'Регистрация открыта', moderation: 'Модерация заявок',
    drawn: 'Жеребьёвка проведена', jury_voting: 'Голосование жюри', televoting: 'Телеголосование',
    finished: 'Сезон завершён', archived: 'Архив'
  };
  const renderRecaps = (submissions) => {
    const list = $('#recapList');
    const approved = submissions || [];
    $('#recapCount').textContent = `${approved.length} роликов`;
    list.replaceChildren();
    if (!approved.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = '<div class="empty-icon">▷</div><h3>Рекапы появятся здесь</h3><p>Утверждённые рекапы будут показаны по порядку жеребьёвки после публикации.</p>';
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
      const details = document.createElement('div');
      details.className = 'recap-item-details';
      const title = document.createElement('strong');
      title.textContent = `${item.performance_order ? String(item.performance_order).padStart(2,'0') + '. ' : ''}${item.artist} — ${item.song_title}`;
      const country = document.createElement('span');
      const found = sortedCountries.find(c => c.code === item.country_code);
      country.textContent = found ? found.name : item.country_code.toUpperCase();
      details.append(title,country);
      card.append(flag,details);
      if (item.recap_url) {
        const link = document.createElement('a');
        link.href = item.recap_url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'button button-small recap-play';
        link.textContent = 'Смотреть рекап ↗';
        card.append(link);
      }
      list.append(card);
    });
  };
  async function loadAppState() {
    if (!window.SpringVisionAPI?.configured()) {
      $('#seasonStatus').textContent = 'Демонстрационный режим';
      return;
    }
    try {
      const state = await window.SpringVisionAPI.request('public_state');
      if (!state.season) {
        $('#seasonStatus').textContent = 'Сезон ещё не создан';
        $('#seasonTitle').textContent = 'SpringVision';
        $('#seasonCardName').textContent = 'Ожидаем новый сезон';
        $('#applyButton').disabled = true;
        renderRecaps([]);
        return;
      }
      currentSeason = state.season;
      reservedCountryCodes = new Set(state.reservedCountryCodes || []);
      $('#seasonStatus').textContent = statusLabels[currentSeason.status] || currentSeason.status;
      $('#seasonTitle').textContent = currentSeason.title;
      $('#seasonCardName').textContent = `SpringVision ${String(currentSeason.season_number).padStart(2,'0')}`;
      $('#seasonDescription').textContent = currentSeason.description || 'Участвуй в сезоне SpringVision: заявка, рекапы, жюри и результаты.';
      $('#applyButton').disabled = currentSeason.status !== 'registration';
      $('#applyButton').textContent = currentSeason.status === 'registration' ? 'Подать заявку →' : 'Регистрация закрыта';
      renderCountryOptions(countrySearch.value);
      renderRecaps(state.submissions || []);
      if (state.isAdmin) $('#admin .status-pill').textContent = 'Администратор';
    } catch (error) {
      $('#seasonStatus').textContent = 'Нет соединения с сервером';
      toast(error instanceof Error ? error.message : 'Не удалось загрузить SpringVision.');
    }
  }

  if (window.SpringVisionAPI?.configured()) {
    $('#seasonStatus').textContent = 'Подключаемся…';
    loadAppState();
  } else {
    $('#seasonStatus').textContent = 'Демонстрационный режим';
  }
})();
