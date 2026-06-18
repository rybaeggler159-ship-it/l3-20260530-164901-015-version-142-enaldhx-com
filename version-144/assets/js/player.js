(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initPlayer(panel) {
    var video = panel.querySelector('video');
    var cover = panel.querySelector('.player-cover');
    var stream = panel.getAttribute('data-stream');
    var loaded = false;
    var hlsInstance = null;

    if (!video || !cover || !stream) return;

    function attachStream() {
      if (loaded) return;
      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal && hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
            video.src = stream;
          }
        });
      } else {
        video.src = stream;
      }
    }

    function startPlayback() {
      attachStream();
      cover.classList.add('is-hidden');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          cover.classList.remove('is-hidden');
        });
      }
    }

    cover.addEventListener('click', startPlayback);
    video.addEventListener('play', function () {
      cover.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) cover.classList.remove('is-hidden');
    });
    video.addEventListener('ended', function () {
      cover.classList.remove('is-hidden');
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('.player-panel')).forEach(initPlayer);
  });
})();
