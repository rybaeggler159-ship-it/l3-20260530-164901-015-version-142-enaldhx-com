
(function(){
  function qs(sel, root){ return (root || document).querySelector(sel); }
  function qsa(sel, root){ return Array.from((root || document).querySelectorAll(sel)); }
  function once(fn){ let done=false; return function(){ if(done) return; done=true; fn.apply(this, arguments); }; }

  function loadJSON(url){ return fetch(url, {cache:'no-store'}).then(function(r){ return r.json(); }); }

  function initPlayer(){
    qsa('[data-player]').forEach(function(root){
      var video = qs('video', root);
      var button = qs('.player-button', root);
      if(!video || !button) return;
      var src = video.getAttribute('data-src');
      var hls = null;

      function attachSource(){
        if(!src) return;
        if(video.canPlayType('application/vnd.apple.mpegurl')){
          video.src = src;
        } else if(window.Hls && window.Hls.isSupported()){
          hls = new window.Hls({
            maxBufferLength: 30,
            backBufferLength: 90,
            lowLatencyMode: false
          });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
      }

      attachSource();

      function togglePlay(){
        if(video.paused){
          var p = video.play();
          if(p && p.catch) p.catch(function(){});
          button.style.opacity = '0';
          button.style.transform = 'scale(.85)';
        } else {
          video.pause();
          button.style.opacity = '1';
          button.style.transform = 'scale(1)';
        }
      }

      button.addEventListener('click', togglePlay);
      video.addEventListener('click', togglePlay);
      video.addEventListener('play', function(){ button.style.opacity = '0'; });
      video.addEventListener('pause', function(){ button.style.opacity = '1'; button.style.transform = 'scale(1)'; });
      video.addEventListener('ended', function(){ button.style.opacity = '1'; });
      window.addEventListener('beforeunload', function(){ if(hls) hls.destroy(); });
    });
  }

  function initSearchPage(){
    var root = qs('[data-search-page]');
    if(!root) return;
    var input = qs('[data-search-input]', root);
    var results = qs('[data-search-results]', root);
    var meta = qs('[data-search-meta]', root);
    var empty = qs('[data-search-empty]', root);
    if(!input || !results) return;

    var params = new URLSearchParams(location.search);
    var initial = (params.get('q') || '').trim();
    input.value = initial;
    var cache = null;

    function render(items, query){
      results.innerHTML = '';
      if(!items.length){
        if(empty) empty.hidden = false;
        if(meta) meta.textContent = query ? ('没有找到与“' + query + '”匹配的内容。') : '暂无结果';
        return;
      }
      if(empty) empty.hidden = true;
      if(meta) meta.textContent = query ? ('找到 ' + items.length + ' 条匹配结果') : ('展示 ' + items.length + ' 条热门结果');
      var html = items.map(function(m){
        var href = 'movie/' + m.id + '.html';
        var genres = (m.genres || []).slice(0,2).join(' / ');
        return '<article class="movie-card" style="--c1:' + m.c1 + ';--c2:' + m.c2 + ';--c3:' + m.c3 + ';">' +
          '<a class="poster" href="' + href + '"><span class="poster-badge">' + (m.year || '—') + '</span><span class="poster-mark">' + m.mark + '</span><span class="poster-score">推荐 ' + m.score + '</span></a>' +
          '<div class="card-body"><div class="card-topline"><span class="chip">' + m.region + '</span><span class="chip chip-soft">' + m.type + '</span></div>' +
          '<h3 class="card-title"><a href="' + href + '">' + m.title + '</a></h3>' +
          '<div class="card-meta">' + (m.year || '未知') + ' · ' + genres + '</div>' +
          '<p class="card-line">' + m.line + '</p></div></article>';
      }).join('');
      results.innerHTML = html;
    }

    function normalize(text){ return (text || '').toLowerCase().replace(/\s+/g, ''); }

    function decorate(raw){
      return raw.map(function(m){
        var h = 0;
        for(var i=0;i<m.id.length+m.title.length;i++) h = (h * 31 + (m.title.charCodeAt(i % m.title.length) || 0) + m.id.charCodeAt(i % m.id.length)) >>> 0;
        var hue = h % 360;
        function c(off, sat, light){
          var hh = (hue + off) % 360;
          var s = sat / 100, l = light / 100;
          var cval = (1 - Math.abs(2*l - 1)) * s;
          var x = cval * (1 - Math.abs((hh/60) % 2 - 1));
          var m2 = l - cval/2;
          var r=0,g=0,b=0;
          if(hh<60){r=cval;g=x;} else if(hh<120){r=x;g=cval;} else if(hh<180){g=cval;b=x;} else if(hh<240){g=x;b=cval;} else if(hh<300){r=x;b=cval;} else {r=cval;b=x;}
          var toHex = function(v){ return ('0' + Math.round((v+m2)*255).toString(16)).slice(-2); };
          return '#' + toHex(r) + toHex(g) + toHex(b);
        }
        return {
          id: m.id,
          title: m.title,
          year: m.year,
          region: m.region,
          type: m.type,
          genres: m.genres || [],
          line: (m.one_line || '').slice(0, 80),
          score: m.score,
          mark: (m.title || '').slice(0, 2),
          c1: c(0, 72, 58),
          c2: c(42, 78, 52),
          c3: c(150, 55, 30)
        };
      });
    }

    function apply(raw){
      var q = normalize(input.value);
      var items = raw;
      if(q){
        items = raw.filter(function(m){
          var hay = [m.title, m.region, m.type, m.year, (m.genres||[]).join(' '), m.one_line, m.summary, m.review, (m.tags||[]).join(' ')].join(' ').toLowerCase();
          hay = hay.replace(/\s+/g, '');
          return hay.indexOf(q) !== -1;
        });
      }
      render(items.slice(0, 120), input.value.trim());
    }

    function boot(data){
      cache = decorate(data);
      apply(cache);
      input.addEventListener('input', function(){ apply(cache); });
      input.addEventListener('keydown', function(e){ if(e.key === 'Enter') e.preventDefault(); });
    }

    loadJSON('assets/movies-index.json').then(boot).catch(function(){
      if(meta) meta.textContent = '数据加载失败，显示静态结果。';
      render([], '');
    });
  }

  function initMenu(){
    var toggle = qs('#menu-toggle');
    var nav = qs('.nav-wrap');
    if(!toggle || !nav) return;
    qsa('.nav-link').forEach(function(link){
      link.addEventListener('click', function(){ if(toggle) toggle.checked = false; });
    });
  }

  function initBackToTop(){
    var btn = qs('[data-backtop]');
    if(!btn) return;
    window.addEventListener('scroll', function(){
      btn.style.opacity = window.scrollY > 700 ? '1' : '0';
      btn.style.pointerEvents = window.scrollY > 700 ? 'auto' : 'none';
    }, {passive:true});
    btn.addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); });
  }

  document.addEventListener('DOMContentLoaded', function(){
    initMenu();
    initPlayer();
    initSearchPage();
    initBackToTop();
  });
})();
