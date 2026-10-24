(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const config = window.SPRINGVISION_CONFIG || { demoMode: true };
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
      const status = document.createElement('span');
      status.className = 'admin-submission-status';
      status.textContent = ({pending:'На рассмотрении',approved:'Одобрена',rejected:'Отклонена',withdrawn:'Отозвана'})[row.status] || row.status;
      const comment = document.createElement('textarea');
      comment.placeholder = 'Комментарий (обязателен по желанию при отклонении)';
      comment.value = row.moderation_comment || '';
      comment.rows = 2;
      const actions = document.createElement('div');
      actions.className = 'admin-inline-actions';
      if (row.recap_storage_path) {
        const recap = document.createElement('button');
        recap.type = 'button'; recap.className = 'button button-ghost button-small'; recap.textContent = 'Рекап';
        recap.addEventListener('click', async () => {
          try {
            const response = await window.SpringVisionAPI.request('admin_recap_downloads',{seasonId});
            const item = (response.recaps || []).find(x => x.id === row.id);
            if (item?.recap_url) window.open(item.recap_url,'_blank','noopener');
            else toast('Не удалось получить ссылку на рекап.');
          } catch (error) { adminError(error); }
        });
        actions.append(recap);
      }
      for (const [statusValue,label] of [['approved','Одобрить'],['rejected','Отклонить']]) {
        const button = document.createElement('button');
        button.type = 'button'; button.className = statusValue === 'approved' ? 'button button-small' : 'button button-small button-ghost';
        button.textContent = label;
        button.addEventListener('click', async () => {
          button.disabled = true;
          try {
            await window.SpringVisionAPI.request('admin_review_submission',{submissionId:row.id,status:statusValue,comment:comment.value.trim()});
            toast(statusValue === 'approved' ? 'Заявка одобрена, право жюри выдано.' : 'Заявка отклонена.');
            await loadAdminApplications();
            await loadAppState();
          } catch (error) { adminError(error); button.disabled = false; }
        });
        actions.append(button);
      }
      card.append(title,status,comment,actions);
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
    if (!window.SpringVisionAPI?.configured()) { toast('Админ-панель заработает после подключения Supabase.'); return; }
    if (!currentIsAdmin) { toast('Нет доступа к админ-панели.'); return; }
    try {
      if (section === 'applications') {
        showAdminDialog('Модерация заявок',`<div class="admin-form-row"><label>Сезон<select id="adminAppSeason" required></select></label><button type="button" class="button button-small" id="loadAdminApps">Обновить</button></div><div class="admin-inline-actions"><button type="button" class="button button-ghost button-small" id="downloadRecaps">Скачать все рекапы ZIP</button></div><div id="adminApplicationsList" class="admin-applications-list"></div>`);
        await fillSeasonSelect($('#adminAppSeason'));
        $('#loadAdminApps').addEventListener('click',()=>loadAdminApplications().catch(adminError));
        $('#downloadRecaps').addEventListener('click',()=>downloadRecapsZip().catch(adminError));
        $('#adminAppSeason').addEventListener('change',()=>loadAdminApplications().catch(adminError));
      } else if (section === 'seasons') {
        showAdminDialog('Управление сезонами',`<form id="createSeasonForm" class="admin-form"><h3>Создать сезон</h3><div class="admin-form-grid"><label>Номер сезона<input id="newSeasonNumber" type="number" min="1" required></label><label>Название<input id="newSeasonTitle" maxlength="160" required></label></div><label>Описание<textarea id="newSeasonDescription" rows="2"></textarea></label><label>URL логотипа<input id="newSeasonLogo" type="url" placeholder="https://…"></label><div class="admin-form-grid"><label>Начало регистрации<input id="newRegOpen" type="datetime-local"></label><label>Конец регистрации<input id="newRegClose" type="datetime-local"></label><label>Дедлайн жюри<input id="newJuryDeadline" type="datetime-local"></label><label>Дата конкурса<input id="newContestAt" type="datetime-local"></label></div><button class="button" type="submit">Создать сезон</button><p id="createSeasonMessage" class="admin-message" role="status"></p></form><hr class="admin-divider"><h3>Управление этапами и публикацией</h3><label>Сезон<select id="adminControlSeason"></select></label><form id="seasonControlsForm" class="admin-form"><label>Статус<select id="controlStatus"><option value="draft">Подготовка</option><option value="registration">Регистрация</option><option value="moderation">Модерация</option><option value="drawn">Жеребьёвка проведена</option><option value="jury_voting">Голосование жюри</option><option value="televoting">Телеголосование</option><option value="finished">Завершён</option><option value="archived">Архив</option></select></label><div class="admin-checks"><label><input type="checkbox" id="controlParticipants"> Опубликовать участников</label><label><input type="checkbox" id="controlDraw"> Опубликовать жеребьёвку</label><label><input type="checkbox" id="controlJuryOpen"> Открыть голосование жюри</label><label><input type="checkbox" id="controlJuryResults"> Показать результаты жюри</label><label><input type="checkbox" id="controlTelevoteOpen"> Открыть телеголосование</label><label><input type="checkbox" id="controlTelevoteResults"> Показать результаты телеголосования</label><label><input type="checkbox" id="controlOverallResults"> Показать общий результат</label></div><label>Ссылка на Twitch<input type="url" id="controlTwitch" placeholder="https://www.twitch.tv/…"></label><div class="admin-inline-actions"><button type="submit" class="button button-small">Сохранить настройки</button><button type="button" id="adminDrawButton" class="button button-ghost button-small">Провести жеребьёвку</button></div><p id="seasonControlsMessage" class="admin-message" role="status"></p></form><hr class="admin-divider"><form id="recordingForm" class="admin-form"><h3>Запись финала</h3><label>Видео (до 50 МБ)<input id="recordingFile" type="file" accept="video/mp4,video/webm,video/quicktime" required></label><button class="button button-small" type="submit">Загрузить запись</button><p id="recordingMessage" class="admin-message" role="status"></p></form>`);
        const seasons = await fillSeasonSelect($('#adminControlSeason'));
        const toLocal = value => value ? new Date(value).toISOString().slice(0,16) : '';
        const fillControls = () => {
          const selected = seasons.find(s=>s.id===$('#adminControlSeason').value);
          if (!selected) return;
          $('#controlStatus').value = selected.status;
          $('#controlParticipants').checked = selected.participant_list_published;
          $('#controlDraw').checked = selected.draw_published;
          $('#controlJuryOpen').checked = selected.jury_voting_open;
          $('#controlJuryResults').checked = selected.jury_results_published;
          $('#controlTelevoteOpen').checked = selected.televote_open;
          $('#controlTelevoteResults').checked = selected.televote_results_published;
          $('#controlOverallResults').checked = selected.overall_results_published;
          $('#controlTwitch').value = selected.twitch_url || '';
        };
        $('#adminControlSeason').addEventListener('change',fillControls);
        if (seasons.length) { $('#adminControlSeason').value = seasons[0].id; fillControls(); }
        const iso = id => { const v=$(id).value; return v ? new Date(v).toISOString() : null; };
        $('#createSeasonForm').addEventListener('submit',async event=>{
          event.preventDefault();
          const out=$('#createSeasonMessage');
          try {
            await window.SpringVisionAPI.request('admin_create_season',{
              seasonNumber:Number($('#newSeasonNumber').value),title:$('#newSeasonTitle').value.trim(),
              description:$('#newSeasonDescription').value.trim(),logoUrl:$('#newSeasonLogo').value.trim()||null,
              registrationOpensAt:iso('#newRegOpen'),registrationClosesAt:iso('#newRegClose'),
              juryDeadline:iso('#newJuryDeadline'),contestAt:iso('#newContestAt')
            });
            out.textContent='Сезон создан.';
            toast('Сезон создан');
            const updated=await fillSeasonSelect($('#adminControlSeason'));
            if(updated.length){$('#adminControlSeason').value=updated[0].id;fillControls();}
            await loadAppState();
          } catch(error){out.textContent=error.message||'Ошибка создания сезона.';}
        });
        $('#seasonControlsForm').addEventListener('submit',async event=>{
          event.preventDefault();
          const out=$('#seasonControlsMessage');
          try {
            const seasonId=await selectedSeason('#adminControlSeason');
            await window.SpringVisionAPI.request('admin_set_season',{
              seasonId,status:$('#controlStatus').value,participant_list_published:$('#controlParticipants').checked,
              draw_published:$('#controlDraw').checked,jury_voting_open:$('#controlJuryOpen').checked,
              jury_results_published:$('#controlJuryResults').checked,televote_open:$('#controlTelevoteOpen').checked,
              televote_results_published:$('#controlTelevoteResults').checked,overall_results_published:$('#controlOverallResults').checked,
              twitch_url:$('#controlTwitch').value.trim()||null
            });
            out.textContent='Настройки сохранены.';
            await loadAppState();
          } catch(error){out.textContent=error.message||'Не удалось сохранить настройки.';}
        });
        $('#adminDrawButton').addEventListener('click',async()=>{
          try { const seasonId=await selectedSeason('#adminControlSeason'); const result=await window.SpringVisionAPI.request('admin_draw',{seasonId}); $('#seasonControlsMessage').textContent=`Жеребьёвка создана: ${result.count} участников. Публикация выключена.`; await loadAppState(); }
          catch(error){adminError(error);}
        });
        $('#recordingForm').addEventListener('submit',async event=>{
          event.preventDefault(); const out=$('#recordingMessage');
          try { const seasonId=await selectedSeason('#adminControlSeason'); const file=$('#recordingFile').files[0]; if(!file) throw new Error('Выбери видеофайл.'); await window.SpringVisionAPI.requestForm('admin_upload_recording',{seasonId},'file',file); out.textContent='Запись загружена в приватное хранилище.'; }
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
      currentProfile = state.profile || null;
      currentIsAdmin = Boolean(state.isAdmin);
      $('#admin').hidden = !currentIsAdmin;
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
