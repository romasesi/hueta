(function () {
  'use strict';

  var plugin = 'Free Online Cinema';

  var sources = [
    {
      title: 'MultiEmbed (самый стабильный сейчас)',
      getIframe: function (movie) {
        var imdb = movie.imdb_id || movie.imdb || '';
        if (!imdb) return 'https://via.placeholder.com/1280x720?text=Нет+IMDB';

        var url = 'https://multiembed.mov/?video_id=' + imdb;
        
        // если сериал и есть сезон/серия (Lampa обычно передаёт в activity)
        if (movie.season && movie.episode) {
          url += '&s=' + movie.season + '&e=' + movie.episode;
        }
        
        return url;
      }
    },
    
    // запасной — autoembed (часто живее, когда multiembed тормозит)
    {
      title: 'AutoEmbed',
      getIframe: function (movie) {
        var imdb = movie.imdb_id || movie.imdb || '';
        if (!imdb) return null;
        return 'https://autoembed.co/embed/movie/' + imdb.replace('tt', '');
      }
    }
  ];

  Lampa.Component.add(plugin, {
    name: plugin,
    type: 'video',

    onCreate: function () {
      this.movie = this.activity.movie || {};
      this.activity.render({
        title: 'Выберите источник',
        items: sources.map((s, i) => ({
          title: s.title,
          index: i,
          template: 'button'
        }))
      });

      this.activity.select = function(item) {
        var source = sources[item.index];
        var url = source.getIframe(this.movie);

        if (!url) {
          Lampa.Noty.show('Нет нужного ID для этого источника');
          return;
        }

        Lampa.Player.play({
          url: url,
          type: 'iframe',
          title: this.movie.title
        });
      }.bind(this);
    }
  });
})();
