(function() {
    'use strict';

    // Переводы (можно расширить)
    Lampa.Lang.add('uebische', {
        ru: {
            title_online: 'Смотри уёбище',
            placeholder: 'Введите название',
            empty_title: 'Нет видео',
            empty_text: 'Не удалось загрузить видео по запросу',
            empty_image: 'img/img_broken.svg'
        }
    });

    // Функция добавления кнопки в карточку фильма
    function addButton(e) {
        if (e.render.find('.uebische--button').length) return;
        var btn = $('<div class="full-button selector uebische--button">' + Lampa.Lang.translate('title_online') + '</div>');
        btn.on('hover:enter', function() {
            Lampa.Component.add('uebische', component);
            Lampa.Activity.push({
                url: '',
                title: Lampa.Lang.translate('title_online'),
                component: 'uebische',
                search: e.movie.title,
                search_one: e.movie.title,
                search_two: e.movie.original_title,
                movie: e.movie,
                page: 1
            });
        });
        e.render.find('.button--play').after(btn);  // Вставляем после кнопки "Play"
    }

    // Прослушка события для добавления кнопки
    Lampa.Listener.follow('full', function(e) {
        if (e.type === 'complite') {
            addButton({
                render: e.object.activity.render(),
                movie: e.data.movie
            });
        }
    });

    // Компонент для отображения источников
    var component = {
        object: {},
        network: new Lampa.RegRequest(),

        constructor: function(_object) {
            this.object = _object;
        },

        create: function() {
            this.activity.loader(true);
            Lampa.Background.immediately('data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==');
            this.reset();
            this.build();
            this.activity.loader(false);
            this.activity.toggle();
        },

        build: function() {
            this.showFilters();
            this.applyFilter();
            this.find();
            this.resetButtons();
        },

        find: function() {
            var url = 'http://videocdn.tv/api/short';  // Пример источника (VideoCDN API, замени на свой)
            var query = encodeURIComponent(this.object.movie.original_title || this.object.movie.title);
            url += '?api_token=your_token&kinopoisk_id=' + this.object.movie.id + '&title=' + query;  // Добавь реальный API-токен, если нужно

            this.network.silent(url, this.parse.bind(this), function() {
                this.empty();
            }.bind(this));
        },

        parse: function(json) {
            var videos = [];
            if (json.data && json.data.length) {
                json.data.forEach(function(elem) {
                    var translations = elem.translations || [];
                    translations.forEach(function(tr) {
                        videos.push({
                            title: elem.title,
                            quality: tr.quality || 'HD',
                            url: tr.iframe_src || elem.iframe,
                            info: tr.translator
                        });
                    });
                });
            }
            this.append(videos);
        },

        append: function(videos) {
            var _this = this;
            videos.forEach(function(video) {
                var item = Lampa.Template.get('online_mod', {  // Используем шаблон из Lampa
                    title: video.title,
                    quality: video.quality,
                    info: video.info
                });
                item.on('hover:enter', function() {
                    _this.onSelect(video);
                });
                _this.append(item);
            });
            this.visible();
            this.render();
        },

        onSelect: function(video) {
            Lampa.Player.play({
                url: video.url,
                title: video.title
            });
            Lampa.Player.playlist([video]);  // Плейлист для сериалов
        },

        reset: function() {
            this.clear();
        },

        destroy: function() {
            this.network.clear();
        }
    };

    // Регистрация компонента
    if (!Lampa.Component.registered('uebische')) {
        Lampa.Component.add('uebische', component);
    }
})();
