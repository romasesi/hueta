(function () {
  'use strict';

  var plugin_name = 'Free Embed Players 2026';

  // Список источников (можно добавлять/убирать)
  var sources = [
    {
      title: 'MultiEmbed (основной)',
      getUrl: function (movie, season, episode) {
        var id = movie.imdb_id || movie.imdb || '';
        if (!id) return null;
        var url = 'https://multiembed.mov/?video_id=' + id;
        if (season && episode) url += '&s=' + season + '&e=' + episode;
        return url;
      }
    },
    {
      title: 'SuperEmbed',
      getUrl: function (movie, season, episode) {
        var id = movie.imdb_id || movie.imdb || '';
        if (!id) return null;
        id = id.replace('tt', '');
        var url = 'https://superembed.stream/embed/movie/' + id;
        if (season && episode) url = 'https://superembed.stream/embed/tv/' + id + '/' + season + '/' + episode;
        return url;
      }
    },
    {
      title: 'AutoEmbed',
      getUrl: function (movie, season, episode) {
        var id = movie.imdb_id || movie.imdb || '';
        if (!id) return null;
        var url = 'https://autoembed.co/movie/imdb/' + id.replace('tt', '');
        if (season && episode) url = 'https://autoembed.co/tv/imdb/' + id.replace('tt', '') + '/' + season + '/' + episode;
        return url;
      }
    },
    {
      title: 'VidSrc.to',
      getUrl: function (movie, season, episode) {
        var id = movie.tmdb_id || movie.tmdb || '';
        if (!id) return null;
        var url = 'https://vidsrc.to/embed/movie/' + id;
        if (season && episode) url = 'https://vidsrc.to/embed/tv/' + id + '/' + season + '/' + episode;
        return url;
      }
    }
  ];

  var current_index = 0;

  function playCurrent(movie, season, episode) {
    if (current_index >= sources.length) {
      Lampa.Modal.open({
        title: 'Ошибка',
        html: '<p>Все источники не сработали :( Попробуй позже или другой контент.</p>',
        onBack: function () { Lampa.Activity.pop(); }
      });
      return;
    }

    var source = sources[current_index];
    var url = source.getUrl(movie, season, episode);

    if (!url) {
      current_index++;
      playCurrent(movie, season, episode);
      return;
    }

    Lampa.Player.launch({
      url: url,
      type: 'iframe',
      title: movie.title + (season ? ' (S' + season + ' E' + episode + ')' : ''),
      onError: function () {
        current_index++;
        playCurrent(movie, season, episode); // авто-переход на следующий
      }
    });

    // Обновляем заголовок активности
    Lampa.Activity.active().title = source.title + ' (' + (current_index + 1) + '/' + sources.length + ')';
  }

  Lampa.Component.add(plugin_name, {
    name: plugin_name,
    type: 'video',

    onCreate: function () {
      this.movie = this.activity.movie || {};
      this.season = this.activity.season || 1;
      this.episode = this.activity.episode || 1;

      current_index = 0; // сбрасываем при новом запуске

      // Добавляем кнопку "Следующий плеер"
      this.activity.buttons = [
        {
          title: 'Следующий плеер',
          action: function () {
            current_index++;
            playCurrent(this.movie, this.season, this.episode);
          }.bind(this)
        }
      ];

      playCurrent(this.movie, this.season ? this.season : null, this.episode ? this.episode : null);
    }
  });

  // Автозапуск при выборе "Онлайн" в карточке
  Lampa.Listener.follow('full', function (e) {
    if (e.type == 'online' && e.body && e.body.component == plugin_name) {
      e.body.component = plugin_name;
    }
  });

})();
