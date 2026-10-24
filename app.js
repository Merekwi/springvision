(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const config = window.SPRINGVISION_CONFIG || { demoMode: true };
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
  sortedCountries.forEach(({flag,name}) => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    countrySelect.append(option);
  });
  const setCountry = (country) => {
    countrySelect.value = country.name;
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
      el.setAttribute('aria-selected', String(el.dataset.country === country.name));
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
      button.setAttribute('aria-selected', String(countrySelect.value === country.name));
      button.dataset.country = country.name;
      const img = document.createElement('img');
      img.src = flagPath(country.flag);
      img.alt = '';
      img.className = 'heart-flag';
      img.loading = 'lazy';
      img.onerror = () => { img.hidden = true; };
      const label = document.createElement('span');
      label.textContent = country.name;
      button.append(img, label);
      button.addEventListener('click', () => setCountry(country));
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

  $('#applicationForm').addEventListener('submit', event => {
    event.preventDefault();
    const country = $('#countrySelect').value;
    const artist = $('#artistInput').value.trim();
    const song = $('#songInput').value.trim();
    const url = $('#youtubeInput').value.trim();
    const file = $('#videoInput').files[0];
    const message = $('#applicationMessage');
    if (!country || !artist || !song || !url || !file) { message.textContent = 'Заполни все поля.'; return; }
    let parsed;
    try { parsed = new URL(url); } catch { message.textContent = 'Проверь ссылку: она должна быть корректным URL.'; return; }
    if (!['http:','https:'].includes(parsed.protocol)) { message.textContent = 'Разрешены только ссылки http:// и https://.'; return; }
    if (file.size > 50 * 1024 * 1024) { message.textContent = 'Файл больше 50 МБ. Выбери файл поменьше для демонстрации.'; return; }
    if (!file.type.startsWith('video/')) { message.textContent = 'Выбери видеофайл.'; return; }
    if (config.demoMode !== false || !config.supabaseUrl || !config.supabaseAnonKey || !window.supabase) {
      message.textContent = 'Проверка пройдена. Это пока демонстрационный режим: заявка не отправлена и файл не загружен. Серверная отправка будет включена после настройки Supabase и проверки Telegram.';
      toast('Демо: данные не отправлены');
      return;
    }
    message.textContent = 'Подключение базы ещё не реализовано в этом стартовом пакете.';
  });

  // Do not silently claim to load data when the backend is not configured.
  if (config.demoMode !== false || !config.supabaseUrl || !config.supabaseAnonKey) {
    $('#seasonStatus').textContent = 'Демонстрационный режим';
  }
})();
