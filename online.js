(function () {
  'use strict';

  var plugin = 'Free Embed 2026';

  var sources = [
    {title: 'MultiEmbed', getUrl: m => m.imdb_id ? 'https://multiembed.mov/?video_id=' + m.imdb_id : null},
    {title: 'SuperEmbed', getUrl: m => m.imdb_id ? 'https://superembed.stream/embed/movie/' + m.imdb_id.replace('tt','') : null},
    {title: 'VidSrc.to',  getUrl: m => m.tmdb_id ? 'https://vidsrc.to/embed/movie/' + m.tmdb_id : null},
    {title: 'AutoEmbed',  getUrl: m => m.imdb_id ? 'https://autoembed.co/embed/movie/' + m.imdb_id.replace('tt','') : null}
  ];

  Lampa.Component.add(plugin, {
    name: plugin,
    type: 'video',
    onCreate: function () {
      this.movie = this.activity.movie || {};
      var items = sources.map((s,i)=>({title: s.title, index: i, template: 'button'}))
                        .filter(s=> s.title); // убираем пустые

      if (items.length === 0) {
        Lampa.Noty.show('Нет доступных ID для источников');
        return;
      }

      this.activity.render({title: 'Выберите плеер', items: items});

      this.activity.select = function(item) {
        var src = sources[item.index];
        var url = src.getUrl(this.movie);

        if (!url) {
          Lampa.Noty.show('Источник не поддерживает этот фильм');
          return;
        }

        Lampa.Player.launch({url: url, type: 'iframe', title: this.movie.title || 'Без названия'});
      }.bind(this);
    }
  });
})();
