document.addEventListener('DOMContentLoaded', function() {
    // Инициализация элементов DOM
    const daySelect = document.getElementById('day');
    const monthSelect = document.getElementById('month');
    const yearInput = document.getElementById('year');
    const searchBtn = document.getElementById('search-btn');
    const randomBtn = document.getElementById('random-btn');
    const resultsContainer = document.getElementById('results-container');
    const resultsCount = document.getElementById('results-count');
    const loading = document.getElementById('loading');
    
    // Фильтры
    const politicalFilter = document.getElementById('filter-political');
    const culturalFilter = document.getElementById('filter-cultural');
    const scienceFilter = document.getElementById('filter-science');
    const sportsFilter = document.getElementById('filter-sports');
    const warsFilter = document.getElementById('filter-wars');
    
    // Заполнение дней месяца
    function populateDays() {
        daySelect.innerHTML = '<option value="">Любой день</option>';
        for (let i = 1; i <= 31; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            daySelect.appendChild(option);
        }
    }
    
    // Обновление количества дней в зависимости от месяца
    function updateDaysForMonth() {
        const month = parseInt(monthSelect.value);
        const year = parseInt(yearInput.value);
        
        if (!month) {
            // Если месяц не выбран, показываем все 31 день
            populateDays();
            return;
        }
        
        // Определяем количество дней в месяце
        let daysInMonth = 31;
        
        if (month === 2) { // Февраль
            // Проверка на високосный год
            if (year && isLeapYear(year)) {
                daysInMonth = 29;
            } else {
                daysInMonth = 28;
            }
        } else if ([4, 6, 9, 11].includes(month)) { // Апрель, Июнь, Сентябрь, Ноябрь
            daysInMonth = 30;
        }
        
        // Получаем текущее значение дня
        const currentDay = parseInt(daySelect.value);
        
        // Обновляем список дней
        daySelect.innerHTML = '<option value="">Любой день</option>';
        for (let i = 1; i <= daysInMonth; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            daySelect.appendChild(option);
        }
        
        // Восстанавливаем выбранный день, если он в пределах нового диапазона
        if (currentDay && currentDay <= daysInMonth) {
            daySelect.value = currentDay;
        } else if (currentDay && currentDay > daysInMonth) {
            // Если выбранный день больше количества дней в месяце, выбираем последний день
            daySelect.value = daysInMonth;
        }
    }
    
    // Проверка на високосный год
    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }
    
    // Установка текущей даты по умолчанию
    function setCurrentDate() {
        const today = new Date();
        monthSelect.value = today.getMonth() + 1;
        updateDaysForMonth(); // Сначала обновляем дни для текущего месяца
        daySelect.value = today.getDate();
        yearInput.value = today.getFullYear();
    }
    
    // Показать/скрыть индикатор загрузки
    function setLoading(isLoading) {
        loading.style.display = isLoading ? 'block' : 'none';
        searchBtn.disabled = isLoading;
        randomBtn.disabled = isLoading;
    }
    
    // Сгенерировать случайную дату
    function generateRandomDate() {
        // Случайный месяц (1-12)
        const randomMonth = Math.floor(Math.random() * 12) + 1;
        
        // Случайный год (1000-2024)
        const randomYear = Math.floor(Math.random() * (2024 - 1000 + 1)) + 1000;
        
        // Устанавливаем месяц
        monthSelect.value = randomMonth;
        
        // Обновляем дни для выбранного месяца
        yearInput.value = randomYear;
        updateDaysForMonth();
        
        // Определяем максимальное количество дней для выбранного месяца
        let maxDays = 31;
        if (randomMonth === 2) {
            maxDays = isLeapYear(randomYear) ? 29 : 28;
        } else if ([4, 6, 9, 11].includes(randomMonth)) {
            maxDays = 30;
        }
        
        // Случайный день
        const randomDay = Math.floor(Math.random() * maxDays) + 1;
        daySelect.value = randomDay;
        
        // Автоматически выполнить поиск
        setTimeout(() => searchEvents(), 100);
    }
    
    // Получить выбранные фильтры
    function getSelectedFilters() {
        const filters = [];
        if (politicalFilter.checked) filters.push('политика');
        if (culturalFilter.checked) filters.push('культура');
        if (scienceFilter.checked) filters.push('наука');
        if (sportsFilter.checked) filters.push('спорт');
        if (warsFilter.checked) filters.push('война');
        return filters;
    }
    
    // Определить категорию события по тексту
    function detectEventCategory(eventText) {
        const text = eventText.toLowerCase();
        
        if (text.includes('войн') || text.includes('битв') || text.includes('сражен') || 
            text.includes('конфликт') || text.includes('революция') || text.includes('восстание') ||
            text.includes('капитуляция')) {
            return { name: 'Войны и конфликты', class: 'wars' };
        }
        else if (text.includes('открыт') || text.includes('изобрет') || text.includes('наук') || 
                 text.includes('технолог') || text.includes('учен') || text.includes('лауреат') ||
                 text.includes('спутник') || text.includes('космос') || text.includes('закон')) {
            return { name: 'Наука и технологии', class: 'science' };
        }
        else if (text.includes('чемпион') || text.includes('олимпи') || text.includes('спорт') || 
                 text.includes('матч') || text.includes('соревнован') || text.includes('рекорд') ||
                 text.includes('игр')) {
            return { name: 'Спорт', class: 'sports' };
        }
        else if (text.includes('кино') || text.includes('фильм') || text.includes('книг') || 
                 text.includes('музык') || text.includes('театр') || text.includes('искусств') || 
                 text.includes('литератур') || text.includes('архитектур') || text.includes('показ')) {
            return { name: 'Культура и искусство', class: 'cultural' };
        }
        else {
            return { name: 'Политические события', class: 'political' };
        }
    }
    
    // Проверить, соответствует ли событие выбранным фильтрам
    function eventMatchesFilters(eventCategory, selectedFilters) {
        if (selectedFilters.length === 0) return true;
        
        const filterMap = {
            'политика': 'political',
            'культура': 'cultural',
            'наука': 'science',
            'спорт': 'sports',
            'война': 'wars'
        };
        
        return selectedFilters.some(filter => filterMap[filter] === eventCategory);
    }
    
    // Поиск событий (имитация запроса к Википедии)
    async function searchEvents() {
        const day = daySelect.value;
        const month = monthSelect.value;
        const year = yearInput.value;
        const selectedFilters = getSelectedFilters();
        
        // Валидация года
        if (year && (year < 1 || year > 2024)) {
            alert('Пожалуйста, введите корректный год (от 1 до 2024)');
            return;
        }
        
        // Если выбран день, но не выбран месяц
        if (day && !month) {
            alert('Для поиска по дню необходимо выбрать месяц');
            return;
        }
        
        // Если выбран месяц, но не выбран год (для более точного поиска)
        if (month && !year) {
            if (!confirm('Вы выбрали месяц без указания года. Поиск может быть менее точным. Продолжить?')) {
                return;
            }
        }
        
        // Формирование даты для поиска
        let dateQuery = '';
        if (day && month && year) {
            dateQuery = `${day} ${getMonthName(month)} ${year} года`;
        } else if (month && year) {
            dateQuery = `${getMonthName(month)} ${year} года`;
        } else if (year) {
            dateQuery = `${year} год`;
        } else if (month) {
            dateQuery = `${getMonthName(month)}`;
        } else if (day) {
            dateQuery = `${day} число`;
        } else {
            dateQuery = 'произвольная дата';
        }
        
        setLoading(true);
        resultsCount.textContent = `Ищем события для: ${dateQuery}...`;
        resultsContainer.innerHTML = '<div class="no-results"><i class="fas fa-spinner fa-spin"></i><p>Поиск событий...</p></div>';
        
        // Имитация загрузки данных
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Получение данных
        const mockEvents = getMockEvents(day, month, year);
        
        // Фильтрация событий
        const filteredEvents = mockEvents.filter(event => {
            const categoryClass = detectEventCategory(event.description).class;
            return eventMatchesFilters(categoryClass, selectedFilters);
        });
        
        // Отображение результатов
        displayEvents(filteredEvents, dateQuery);
        setLoading(false);
    }
    
    // Получить название месяца
    function getMonthName(monthNumber) {
        const months = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        return months[parseInt(monthNumber) - 1] || '';
    }
    
    // Генерация тестовых данных
    function getMockEvents(day, month, year) {
        // Базовый набор событий
        const allEvents = [
            { year: 1961, month: 4, day: 12, title: 'Первый полёт человека в космос', description: 'Юрий Гагарин на корабле "Восток-1" совершил первый в истории человечества полёт в космическое пространство.' },
            { year: 1945, month: 5, day: 9, title: 'День Победы', description: 'Окончание Великой Отечественной войны, подписание акта о безоговорочной капитуляции Германии.' },
            { year: 1812, month: 9, day: 7, title: 'Бородинское сражение', description: 'Крупнейшее сражение Отечественной войны 1812 года между русской и французской армиями.' },
            { year: 1869, month: 3, day: 6, title: 'Открытие периодического закона', description: 'Дмитрий Менделеев представил Русскому химическому обществу периодический закон химических элементов.' },
            { year: 1980, month: 7, day: 19, title: 'Открытие летних Олимпийских игр в Москве', description: 'Первые в истории Олимпийские игры на территории Восточной Европы.' },
            { year: 1895, month: 12, day: 28, title: 'Первый публичный кинопоказ', description: 'Братья Люмьер провели первый публичный показ кино в Париже.' },
            { year: 1917, month: 11, day: 7, title: 'Октябрьская революция', description: 'Вооружённое восстание в Петрограде, приведшее к власти большевиков.' },
            { year: 1957, month: 10, day: 4, title: 'Запуск первого искусственного спутника Земли', description: 'СССР вывел на орбиту первый в мире искусственный спутник Земли "Спутник-1".' },
            { year: 1986, month: 4, day: 26, title: 'Авария на Чернобыльской АЭС', description: 'Крупнейшая авария в истории атомной энергетики.' },
            { year: 1991, month: 12, day: 25, title: 'Распад СССР', description: 'Отставка Михаила Горбачёва с поста президента СССР и официальное прекращение существования Советского Союза.' },
            { year: 2008, month: 8, day: 8, title: 'Открытие летних Олимпийских игр в Пекине', description: 'Торжественная церемония открытия XXIX летних Олимпийских игр.' },
            { year: 2014, month: 2, day: 7, title: 'Открытие зимних Олимпийских игр в Сочи', description: 'Первые в России зимние Олимпийские игры.' },
            { year: 1492, month: 10, day: 12, title: 'Открытие Америки', description: 'Христофор Колумб достиг берегов Америки.' },
            { year: 1789, month: 7, day: 14, title: 'Взятие Бастилии', description: 'Начало Великой французской революции.' },
            { year: 1969, month: 7, day: 20, title: 'Высадка на Луну', description: 'Астронавты НАСА Нил Армстронг и Базз Олдрин высадились на Луну.' },
            { year: 1989, month: 11, day: 9, title: 'Падение Берлинской стены', description: 'Начало разрушения Берлинской стены, символа холодной войны.' },
            { year: 2001, month: 9, day: 11, title: 'Теракты 11 сентября', description: 'Серия террористических атак в США.' },
            { year: 2011, month: 3, day: 11, title: 'Авария на Фукусиме', description: 'Крупная радиационная авария на японской АЭС Фукусима-1.' },
            { year: 1776, month: 7, day: 4, title: 'Декларация независимости США', description: 'Принятие Декларации независимости США.' },
            { year: 1905, month: 1, day: 22, title: 'Кровавое воскресенье', description: 'Расстрел мирного шествия рабочих в Санкт-Петербурге.' },
            { year: 1914, month: 7, day: 28, title: 'Начало Первой мировой войны', description: 'Австро-Венгрия объявила войну Сербии.' },
            { year: 1939, month: 9, day: 1, title: 'Начало Второй мировой войны', description: 'Германия напала на Польшу.' },
            { year: 1963, month: 11, day: 22, title: 'Убийство Джона Кеннеди', description: 'Президент США Джон Кеннеди был убит в Далласе.' },
            { year: 1999, month: 12, day: 31, title: 'Миллениум', description: 'Конец второго тысячелетия и начало третьего.' }
        ];
        
        // Фильтрация по выбранной дате
        let filteredEvents = [...allEvents];
        
        if (year) {
            filteredEvents = filteredEvents.filter(event => event.year == year);
        }
        
        if (month) {
            filteredEvents = filteredEvents.filter(event => event.month == month);
        }
        
        if (day) {
            filteredEvents = filteredEvents.filter(event => event.day == day);
        }
        
        // Если фильтры слишком строгие, показываем случайные события
        if (filteredEvents.length === 0 && (year || month || day)) {
            // Пытаемся найти события хотя бы по году или месяцу
            if (year) {
                filteredEvents = allEvents
                    .filter(event => event.year == year)
                    .slice(0, 5);
            } else if (month) {
                filteredEvents = allEvents
                    .filter(event => event.month == month)
                    .slice(0, 5);
            }
            
            // Если все еще нет результатов, показываем случайные события
            if (filteredEvents.length === 0) {
                filteredEvents = [...allEvents]
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 3);
            }
        }
        
        return filteredEvents;
    }
    
    // Отображение найденных событий
    function displayEvents(events, dateQuery) {
        resultsContainer.innerHTML = '';
        
        if (events.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-calendar-times"></i>
                    <p>По вашему запросу "${dateQuery}" событий не найдено</p>
                    <p>Попробуйте изменить параметры поиска или фильтры</p>
                </div>
            `;
            resultsCount.textContent = `По запросу "${dateQuery}" ничего не найдено`;
            return;
        }
        
        resultsCount.textContent = `Найдено событий: ${events.length} (${dateQuery})`;
        
        events.forEach(event => {
            const category = detectEventCategory(event.description);
            const eventDate = `${event.day}.${event.month}.${event.year}`;
            
            // Генерация ссылки на Википедию
            const wikiQuery = encodeURIComponent(`${eventDate} ${event.title}`);
            const wikiUrl = `https://ru.wikipedia.org/wiki/Special:Search?search=${wikiQuery}`;
            
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.innerHTML = `
                <div class="event-year">${eventDate}</div>
                <div class="event-category category-${category.class}">${category.name}</div>
                <h3 class="event-title">${event.title}</h3>
                <p class="event-description">${event.description}</p>
                <a href="${wikiUrl}" target="_blank" class="event-link">
                    <i class="fas fa-external-link-alt"></i> Подробнее в Википедии
                </a>
            `;
            
            resultsContainer.appendChild(eventCard);
        });
    }
    
    // Инициализация
    populateDays();
    setCurrentDate();
    
    // Обработчики событий
    searchBtn.addEventListener('click', searchEvents);
    
    randomBtn.addEventListener('click', generateRandomDate);
    
    // Обновление дней при изменении месяца
    monthSelect.addEventListener('change', updateDaysForMonth);
    
    // Обновление дней при изменении года (для февраля)
    yearInput.addEventListener('change', updateDaysForMonth);
    yearInput.addEventListener('input', function() {
        if (monthSelect.value === '2') {
            updateDaysForMonth();
        }
    });
    
    // Поиск при нажатии Enter в поле года
    yearInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchEvents();
        }
    });
    
    // Автопоиск при изменении фильтров (если уже есть результаты)
    [politicalFilter, culturalFilter, scienceFilter, sportsFilter, warsFilter].forEach(filter => {
        filter.addEventListener('change', function() {
            if (resultsContainer.children.length > 0 && 
                !resultsContainer.querySelector('.no-results i.fa-calendar-times')) {
                searchEvents();
            }
        });
    });
    
    // Показ сообщения при загрузке
    setTimeout(() => {
        resultsCount.textContent = 'Выберите параметры поиска и нажмите "Найти события"';
    }, 100);
});
