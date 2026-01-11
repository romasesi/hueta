(function () {
  'use strict';

  var plugin = 'Free Online Cinema';

  var sources = [
    {
      title: 'Источник A',
      getIframe: function (movie) {
        // пример логики
        return 'https://multiembed.mov/?video_id=tt1234567' +
          encodeURIComponent(movie.title) +
          '&year=' + movie.year;
      }
    },
    {
      title: 'Источник B',
      getIframe: function (movie) {
        return 'https://example2.com/player/' + movie.imdb_id;
      }
    }
  ];

  Lampa.Component.add(plugin, {
    name: plugin,
    type: 'video',

    onCreate: function () {
      this.movie = this.activity.movie;
      this.renderSources();
    },

    renderSources: function () {
      var items = sources.map(function (s, i) {
        return {
          title: s.title,
          index: i,
          template: 'button'
        };
      });

      this.activity.render({
        title: 'Выберите источник',
        items: items
      });

      this.activity.select = this.selectSource.bind(this);
    },

    selectSource: function (item) {
      var source = sources[item.index];
      var iframe = source.getIframe(this.movie);

      Lampa.Player.play({
        url: iframe,
        type: 'iframe'
      });
    }
  });
})();

