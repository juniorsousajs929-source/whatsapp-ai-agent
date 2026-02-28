// Configurações do "Super Player" YouTube (Estilo VTurb)
const VIDEO_ID = 'y881t8ilMyc'; // Troque pelo seu ID do YouTube
const REVEAL_TIME_SECONDS = 10; // Tempo para mostrar o botão (ex: 300 para 5min)

let player;
let lastTime = 0;
let isStarted = false;

// Inicializa o Player
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: VIDEO_ID,
        playerVars: {
            'autoplay': 0,
            'controls': 0,          // Esconde controles
            'disablekb': 1,        // Desativa teclado
            'modestbranding': 1,   // Remove logo
            'rel': 0,
            'fs': 0,               // Desativa tela cheia
            'iv_load_policy': 3,
            'origin': window.location.origin
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    console.log("Player pronto.");
    setupPlayOverlay();

    // Loop de monitoramento Anti-Skip (VTurb Traps)
    setInterval(() => {
        if (!player || !player.getCurrentTime || !isStarted) return;

        let currentTime = player.getCurrentTime();

        // TRAVA 1: Impedir avanço (Seek Lock)
        if (currentTime > lastTime + 2.0) {
            player.seekTo(lastTime);
        } else {
            // Só avança o ponto de segurança se o vídeo rodar normal
            if (currentTime > lastTime) {
                lastTime = currentTime;
            }
        }

        // TRAVA 2: Revelação do Botão
        checkCtaReveal(currentTime);
    }, 500);
}

function onPlayerStateChange(event) {
    // TRAVA 3: Auto-Resume (Se pausar, volta a tocar)
    // 2 = PAUSED
    if (event.data === 2 && isStarted) {
        player.playVideo();
    }
}

function setupPlayOverlay() {
    const wrapper = document.querySelector('.video-wrapper');
    const overlay = document.createElement('div');
    overlay.className = 'player-overlay';
    overlay.innerHTML = '<div class="play-button-custom">▶</div>';
    wrapper.appendChild(overlay);

    overlay.onclick = () => {
        player.playVideo();
        overlay.style.display = 'none';
        isStarted = true;
    };
}

function checkCtaReveal(currentTime) {
    const cta = document.getElementById('cta-area');
    if (currentTime >= REVEAL_TIME_SECONDS) {
        cta.style.display = 'block';
    }
}
