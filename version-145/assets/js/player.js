(function () {
  function mount(elementId, streamUrl) {
    var box = document.getElementById(elementId);

    if (!box) {
      return;
    }

    var video = box.querySelector("video");
    var cover = box.querySelector(".player-cover");
    var button = box.querySelector(".player-play");
    var error = box.querySelector(".player-error");
    var loaded = false;
    var hls = null;

    function showError() {
      if (error) {
        error.classList.add("is-visible");
      }
    }

    function prepare() {
      if (loaded || !video) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });

        hls.loadSource(streamUrl);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            showError();
          }
        });

        return;
      }

      video.src = streamUrl;
    }

    function start() {
      prepare();

      if (cover) {
        cover.classList.add("is-hidden");
      }

      if (video) {
        video.controls = true;
        var playTask = video.play();

        if (playTask && playTask.catch) {
          playTask.catch(function () {
            showError();

            if (cover) {
              cover.classList.remove("is-hidden");
            }
          });
        }
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }

    if (cover) {
      cover.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      });

      video.addEventListener("error", showError);
    }

    window.addEventListener("beforeunload", function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  }

  window.PlayerCore = {
    mount: mount,
  };
})();
