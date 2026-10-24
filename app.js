(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  let currentSeason = null;
  let currentProfile = null;
  let currentIsAdmin = false;
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
  $('#accountButton').addEventListener('click', () => { openDialog('accountDialog'); loadAccount().catch(error => { $('#accountContent').textContent = error.message || 'Не удалось загрузить профиль.'; }); });
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
  const adminError = (error) => toast(error instanceof Error ? error.message : 'Не удалось выполнить действие.');
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
      card.append(title,applicantInfo,status,comment,feedback,actions);
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
    if (!window.SpringVisionAPI?.configured()) { toast('Система ещё не подключена к базе данных.'); return; }
    if (!currentIsAdmin) { toast('Нет доступа к админ-панели.'); return; }
    try {
      if (section === 'applications') {
        showAdminDialog('Модерация заявок',`<div class="admin-form-row"><label>Сезон<div class="season-select-wrap"><button type="button" id="adminAppSeasonTrigger" class="season-select-trigger" aria-expanded="false">Загружаем сезоны… <span>⌄</span></button><div id="adminAppSeasonMenu" class="season-select-menu" hidden></div><select id="adminAppSeason" class="season-select-native" required aria-hidden="true" tabindex="-1"></select></div></label><button type="button" class="button button-small" id="loadAdminApps">Обновить</button></div><div class="admin-inline-actions"><button type="button" class="button button-ghost button-small" id="downloadRecaps">Скачать все рекапы ZIP</button></div><div id="adminApplicationsList" class="admin-applications-list"></div>`);
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
      } else if (section === 'seasons') {
        showAdminDialog('Управление сезонами',`<form id="createSeasonForm" class="admin-form"><h3>Создать сезон</h3><div class="admin-form-grid"><label>Номер сезона<input id="newSeasonNumber" type="number" min="1" required></label><label>Название<input id="newSeasonTitle" maxlength="160" required></label></div><label>Описание<textarea id="newSeasonDescription" rows="2"></textarea></label><label>Ссылка на изображение (необязательно)<input id="newSeasonLogo" type="url" placeholder="https://…"></label><label>Или загрузить изображение сезона<input id="newSeasonImage" type="file" accept="image/png,image/jpeg,image/webp"><small>PNG, JPG или WebP, до 10 МБ.</small></label><div class="admin-form-grid"><label>Начало регистрации<input id="newRegOpen" type="datetime-local"></label><label>Дедлайн регистрации<input id="newRegClose" type="datetime-local"></label><label>Дедлайн жюри<input id="newJuryDeadline" type="datetime-local"></label><label>Дедлайн телеголосования<input id="newTelevoteDeadline" type="datetime-local"></label><label>Дата конкурса<input id="newContestAt" type="datetime-local"></label></div><button class="button" type="submit">Создать сезон</button><p id="createSeasonMessage" class="admin-message" role="status"></p></form><hr class="admin-divider"><h3>Управление этапами и публикацией</h3><label>Сезон<select id="adminControlSeason"></select></label><form id="seasonControlsForm" class="admin-form"><label>Статус<select id="controlStatus"><option value="draft">Подготовка</option><option value="registration">Регистрация</option><option value="moderation">Модерация</option><option value="drawn">Жеребьёвка проведена</option><option value="jury_voting">Голосование жюри</option><option value="televoting">Телеголосование</option><option value="finished">Завершён</option><option value="archived">Архив</option></select></label><div class="admin-form-grid"><label>Начало регистрации<input id="controlRegOpen" type="datetime-local"></label><label>Дедлайн регистрации<input id="controlRegClose" type="datetime-local"></label><label>Дедлайн жюри<input id="controlJuryDeadline" type="datetime-local"></label><label>Дедлайн телеголосования<input id="controlTelevoteDeadline" type="datetime-local"></label><label>Дата конкурса<input id="controlContestAt" type="datetime-local"></label></div><div class="admin-checks"><label><input type="checkbox" id="controlParticipants"> Опубликовать участников</label><label><input type="checkbox" id="controlDraw"> Опубликовать жеребьёвку</label><label><input type="checkbox" id="controlJuryOpen"> Открыть голосование жюри</label><label><input type="checkbox" id="controlJuryResults"> Показать результаты жюри</label><label><input type="checkbox" id="controlTelevoteOpen"> Открыть телеголосование</label><label><input type="checkbox" id="controlTelevoteResults"> Показать результаты телеголосования</label><label><input type="checkbox" id="controlOverallResults"> Показать общий результат</label></div><label>Ссылка на Twitch<input type="url" id="controlTwitch" placeholder="https://www.twitch.tv/…"></label><div class="admin-checks"><label><input type="checkbox" id="controlTwitchPublished"> Показывать трансляцию на сайте</label><label><input type="checkbox" id="controlRecordingPublished"> Опубликовать запись финала</label></div><div class="admin-inline-actions"><button type="submit" class="button button-small">Сохранить настройки</button><button type="button" id="adminDrawButton" class="button button-ghost button-small">Провести жеребьёвку</button><button type="button" id="adminCloseJuryButton" class="button button-ghost button-small">Завершить жюривойт</button></div><p id="seasonControlsMessage" class="admin-message" role="status"></p></form><hr class="admin-divider"><div class="admin-form"><h3>Изображение сезона</h3><label>Новое изображение (PNG, JPG или WebP, до 10 МБ)<input id="replaceSeasonImage" type="file" accept="image/png,image/jpeg,image/webp"></label><button type="button" id="uploadSeasonImageButton" class="button button-ghost button-small">Загрузить новое изображение</button><p id="seasonImageMessage" class="admin-message" role="status"></p></div><hr class="admin-divider"><form id="deleteSeasonForm" class="admin-form"><h3>Удаление сезона</h3><p>Удалит сезон, заявки, голоса и загруженные файлы. Действие необратимо.</p><label>Для подтверждения введи точное название выбранного сезона<input id="deleteSeasonConfirm" autocomplete="off" placeholder="Название сезона" required></label><button type="submit" class="button button-ghost button-small">Удалить сезон навсегда</button><p id="deleteSeasonMessage" class="admin-message" role="status"></p></form><hr class="admin-divider"><form id="recordingForm" class="admin-form"><h3>Запись финала</h3><label>Видео (до 50 МБ)<input id="recordingFile" type="file" accept="video/mp4,video/webm,video/quicktime" required></label><button class="button button-small" type="submit">Загрузить запись</button><p id="recordingMessage" class="admin-message" role="status"></p></form>`);
        const seasons = await fillSeasonSelect($('#adminControlSeason'));
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
            await window.SpringVisionAPI.request('admin_set_season',{
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
            out.textContent='Настройки и дедлайны сохранены.';
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
          if(!window.confirm('Последнее подтверждение: удалить сезон «'+selected.title+'» со всеми заявками и голосами?')) return;
          try {
            const result=await window.SpringVisionAPI.request('admin_delete_season',{seasonId:selected.id,confirmTitle:$('#deleteSeasonConfirm').value.trim()});
            out.textContent=result.storageWarning ? 'Сезон удалён, но не все файлы удалось очистить: '+result.storageWarning : 'Сезон удалён.';
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
    if (!performerPhoto.type.startsWith('image/')) { message.textContent = 'Фото исполнителя должно быть изображением.'; return; }
    if (performerPhoto.size > 10 * 1024 * 1024) { message.textContent = 'Фото исполнителя больше 10 МБ.'; return; }
    let parsed;
    try { parsed = new URL(performanceUrl); } catch { message.textContent = 'Проверь ссылку: она должна быть корректным URL.'; return; }
    if (!['http:','https:'].includes(parsed.protocol)) { message.textContent = 'Разрешены только ссылки http:// и https://.'; return; }
    if (file.size > 50 * 1024 * 1024) { message.textContent = 'Файл больше 50 МБ.'; return; }
    if (!file.type.startsWith('video/')) { message.textContent = 'Выбери видеофайл.'; return; }
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
      message.textContent = 'Заявка отправлена на модерацию. Страна зарезервирована за вашей заявкой.';
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
    loading.textContent = 'Загружаем профиль и заявки…';
    content.append(loading);
    const [me, mine] = await Promise.all([
      window.SpringVisionAPI.request('me'),
      window.SpringVisionAPI.request('my_submissions')
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
        ? 'Распредели 12, 10 и 8–1 баллов между десятью разными странами. За собственную заявку голосовать нельзя.'
        : 'Распредели 12, 10 и 8–1 баллов между десятью разными странами. Один голос на аккаунт.';
      panel.append(heading,intro);
      if (submissions.length < 10 || (isJury && submissions.length < 11)) {
        const notice = document.createElement('p');
        notice.className = 'vote-notice';
        notice.textContent = isJury ? 'Для голосования жюри нужны минимум 11 утверждённых участников, чтобы каждый мог не голосовать за себя.' : 'Для телеголосования нужны минимум 10 утверждённых участников.';
        panel.append(notice);
        content.append(panel);
        return;
      }
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
        portrait.alt = 'Фото исполнителя';
        portrait.loading = 'lazy';
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
          if (isJury && !allowOwn && item.id === state.ownSubmissionId) option.disabled = true;
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
          option.disabled = selectedElsewhere || (isJury && !allowOwn && option.value===state.ownSubmissionId);
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

  async function loadAppState() {
    if (!window.SpringVisionAPI?.configured()) {
      $('#seasonStatus').textContent = 'Сервер не подключён';
      $('#seasonCardName').textContent = 'Сезон загружается после подключения сервера';
      $('#seasonProgressLabel').textContent = 'Ожидание подключения';
      $('#applyButton').disabled = true;
      $('#voting').hidden = true;
      renderRecaps([]);
      renderFinalMedia(null);
      return;
    }
    try {
      const state = await window.SpringVisionAPI.request('public_state');
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
      $('#seasonStatus').textContent = statusLabels[currentSeason.status] || currentSeason.status;
      const progress = ({draft:5,registration:20,moderation:35,drawn:50,jury_voting:65,televoting:80,finished:100,archived:100})[currentSeason.status] || 0;
      $('#seasonProgressLabel').textContent = statusLabels[currentSeason.status] || currentSeason.status;
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
      $('#seasonCardName').textContent = `SpringVision ${String(currentSeason.season_number).padStart(2,'0')}`;
      $('#seasonDescription').textContent = currentSeason.description || 'Участвуй в сезоне SpringVision: заявка, рекапы, жюри и результаты.';
      const deadlineRows = [
        ['Начало регистрации', currentSeason.registration_opens_at],
        ['Дедлайн регистрации', currentSeason.registration_closes_at],
        ['Дедлайн голосования жюри', currentSeason.jury_deadline],
        ['Дедлайн телеголосования', currentSeason.televote_deadline],
        ['Дата конкурса', currentSeason.contest_at],
      ].filter(([,value]) => value);
      const deadlinesBox = $('#seasonDeadlines');
      deadlinesBox.replaceChildren();
      if (deadlineRows.length) {
        const heading = document.createElement('strong');
        heading.textContent = 'Расписание и дедлайны';
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
      $('#applyButton').disabled = currentSeason.status !== 'registration';
      $('#applyButton').textContent = currentSeason.status === 'registration' ? 'Подать заявку →' : 'Регистрация закрыта';
      renderCountryOptions(countrySearch.value);
      renderRecaps(state.submissions || []);
      renderVoting(state);
      renderFinalMedia(currentSeason);
      if (state.isAdmin) $('#admin').hidden = false;
    } catch (error) {
      $('#seasonStatus').textContent = 'Нет соединения с сервером';
      toast(error instanceof Error ? error.message : 'Не удалось загрузить SpringVision.');
    }
  }

  if (window.SpringVisionAPI?.configured()) {
    $('#seasonStatus').textContent = 'Подключаемся…';
    loadAppState();
  } else {
    $('#seasonStatus').textContent = 'Сервер не подключён';
  }
})();
