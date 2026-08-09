(function() {
    'use strict';

    // ==================== CONFIG ====================
    const STORAGE_KEY = 'neumjong_';

    const TILE_SETS = [
        ['🀇','🀈','🀉','🀊','🀋','🀌','🀍','🀎','🀏','🀐','🀑','🀒','🀓','🀔','🀕','🀖','🀗','🀘','🀙','🀚','🀛','🀜','🀝','🀞','🀟','🀠','🀡','🀀','🀁','🀂','🀃','🀆','🀅','🀄'],
        ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟'],
        ['🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🍍','🥝','🍅','🥑','🍆','🥔','🥕','🌽','🌶','🫑','🥒','🥬','🥦','🧄','🧅','🍄','🥜','🌰','🍞','🥐','🥖','🥨'],
        ['🌵','🎄','🌲','🌳','🌴','🪵','🌱','🌿','☘️','🍀','🎍','🪴','🎋','🍃','🍂','🍁','🍄','🌾','💐','🌷','🌹','🥀','🌺','🌸','🌼','🌻','🌞','🌝','🌛','🌜','🌚','🌕','🌖','🌗'],
        ['⌚','📱','💻','⌨️','🖥','🖨','🖱','🖲','🕹','🗜','💽','💾','💿','📀','📼','📷','📸','📹','🎥','📽','🎞','📞','☎️','📟','📠','📺','📻','🎙','🎚','🎛','🧭','⏱','⏲','⏰'],
        ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🪃','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸','🥌','🎿','⛷'],
        ['🚗','🚕','🚙','🚌','🚎','🏎','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🦯','🦽','🦼','🛴','🚲','🛵','🏍','🛺','🚨','🚔','🚍','🚘','🚖','🚡','🚠','🚟','🚃','🚋','🚞','🚝'],
        ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','☺️','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨'],
        ['🚀','🛸','🛰','🌍','🌎','🌏','🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘','🌙','🪐','⭐','🌟','✨','💫','☄️','🌠','🌌','🔭','🔬','🧬','🔮','🧿','🪄','💎','⚗️','🔑','🗝','🚪'],
        ['🎵','🎶','🎼','🎹','🥁','🪘','🎷','🎺','🪗','🎸','🪕','🎻','🎬','🎤','🎧','📯','🎮','🎰','🎲','🧩','🎯','🎳','🎣','🎽','🎿','🛷','🥌','⛸','🛼','🛹','🎪','🎨','🎭','🎫']
    ];

    const TIER_NAMES = ['Beginner','Novice','Apprentice','Student','Adept','Skilled','Expert','Master','Grandmaster','Legend'];
    const TIER_COLORS = ['#38a169','#319795','#3182ce','#805ad5','#d53f8c','#dd6b20','#e53e3e','#38a169','#319795','#3182ce'];

    // ==================== LEVEL GENERATION ====================
    function generateLevels() {
        const levels = [];
        for (let i = 1; i <= 100; i++) {
            const tier = Math.min(Math.floor((i - 1) / 10), 9);
            const setIdx = tier % TILE_SETS.length;
            const baseTime = Math.max(35, 200 - (i * 1.5));
            let cols, rows;
            if (i <= 5) { cols = 4; rows = 3; }
            else if (i <= 15) { cols = 4; rows = 4; }
            else if (i <= 30) { cols = 5; rows = 4; }
            else if (i <= 50) { cols = 6; rows = 4; }
            else if (i <= 70) { cols = 6; rows = 5; }
            else if (i <= 85) { cols = 7; rows = 5; }
            else { cols = 8; rows = 5; }
            if ((cols * rows) % 2 !== 0) rows += 1;
            const pairCount = (cols * rows) / 2;
            levels.push({
                id: i,
                name: TIER_NAMES[tier] + ' ' + ((i % 10) || 10),
                tier: tier + 1,
                tierName: TIER_NAMES[tier],
                set: TILE_SETS[setIdx],
                cols, rows,
                pairs: pairCount,
                time: Math.round(baseTime),
                shuffleCount: Math.max(1, 4 - Math.floor(i / 25)),
                hintCount: Math.max(1, 5 - Math.floor(i / 20))
            });
        }
        return levels;
    }

    const LEVELS = generateLevels();

    // ==================== STATE ====================
    let state = {
        level: 1,
        unlocked: 1,
        tiles: [],
        selected: null,
        matched: 0,
        timeLeft: 0,
        timerId: null,
        paused: false,
        shufflesLeft: 3,
        hintsLeft: 3,
        undoStack: [],
        sound: true,
        vibrate: true,
        music: false,
        totalMatches: 0,
        totalTime: 0,
        bestTimes: {},
        gamesPlayed: 0
    };

    // ==================== DOM HELPERS ====================
    function $(id) { return document.getElementById(id); }
    function showScreen(name) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.overlay').forEach(o => o.style.display = 'none');
        const screen = $(name + '-screen');
        if (screen) screen.classList.add('active');
    }
    function showOverlay(name) { $(name + '-overlay').style.display = 'flex'; }
    function hideOverlay(name) { $(name + '-overlay').style.display = 'none'; }

    // ==================== AUDIO ====================
    let audioCtx = null;
    function getAudioCtx() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtx;
    }
    function beep(freq, dur, type, vol) {
        if (!state.sound) return;
        try {
            const ctx = getAudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type || 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(vol || 0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (dur || 0.1));
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + (dur || 0.1));
        } catch(e) {}
    }
    function sfxSelect() { beep(520, 0.08, 'sine', 0.06); }
    function sfxMatch() { beep(880, 0.12, 'sine', 0.08); setTimeout(()=>beep(1100,0.18,'sine',0.06),100); }
    function sfxError() { beep(200, 0.12, 'sawtooth', 0.05); }
    function sfxWin() { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,0.25,'sine',0.07),i*130)); }
    function sfxLose() { [400,350,300,250].forEach((f,i)=>setTimeout(()=>beep(f,0.25,'sawtooth',0.05),i*180)); }
    function sfxShuffle() { beep(600, 0.08, 'sine', 0.05); setTimeout(()=>beep(800,0.12,'sine',0.05),80); }
    function sfxClick() { beep(420, 0.04, 'sine', 0.04); }

    // ==================== VIBRATION ====================
    function vibrate(pattern) {
        if (!state.vibrate) return;
        try {
            if (navigator.vibrate) {
                navigator.vibrate(pattern);
            } else if (navigator.notification && navigator.notification.vibrate) {
                navigator.notification.vibrate(pattern);
            }
        } catch(e) {}
    }

    // ==================== STORAGE ====================
    function save() {
        try {
            const data = {
                unlocked: state.unlocked,
                level: state.level,
                sound: state.sound,
                vibrate: state.vibrate,
                music: state.music,
                totalMatches: state.totalMatches,
                totalTime: state.totalTime,
                bestTimes: state.bestTimes,
                gamesPlayed: state.gamesPlayed
            };
            localStorage.setItem(STORAGE_KEY + 'save', JSON.stringify(data));
        } catch(e) {}
    }
    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY + 'save');
            if (raw) {
                const data = JSON.parse(raw);
                state.unlocked = Math.max(1, data.unlocked || 1);
                state.level = Math.max(1, data.level || 1);
                state.sound = data.sound !== false;
                state.vibrate = data.vibrate !== false;
                state.music = data.music === true;
                state.totalMatches = data.totalMatches || 0;
                state.totalTime = data.totalTime || 0;
                state.bestTimes = data.bestTimes || {};
                state.gamesPlayed = data.gamesPlayed || 0;
            }
        } catch(e) {}
    }
    function resetProgress() {
        state.unlocked = 1;
        state.level = 1;
        state.totalMatches = 0;
        state.totalTime = 0;
        state.bestTimes = {};
        state.gamesPlayed = 0;
        save();
    }

    // ==================== PARTICLES ====================
    const canvas = $('particles');
    const pCtx = canvas ? canvas.getContext('2d') : null;
    let particles = [];
    let animating = false;

    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function spawnParticles(x, y, color) {
        if (!pCtx) return;
        for (let i = 0; i < 14; i++) {
            particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 7,
                vy: (Math.random() - 0.5) * 7 - 3,
                life: 1,
                decay: 0.02 + Math.random() * 0.025,
                size: 3 + Math.random() * 5,
                color: color || '#a3b1c6'
            });
        }
        if (!animating) {
            animating = true;
            requestAnimationFrame(updateParticles);
        }
    }

    function updateParticles() {
        if (!pCtx || particles.length === 0) {
            animating = false;
            return;
        }
        pCtx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.18;
            p.life -= p.decay;
            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }
            pCtx.globalAlpha = p.life;
            pCtx.fillStyle = p.color;
            pCtx.beginPath();
            pCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            pCtx.fill();
        }
        pCtx.globalAlpha = 1;
        requestAnimationFrame(updateParticles);
    }

    // ==================== BOARD LOGIC ====================
    function generateBoard(lvl) {
        const total = lvl.cols * lvl.rows;
        const pairs = total / 2;
        const set = lvl.set;
        const usedSymbols = [];
        const available = [...set];
        for (let i = 0; i < pairs; i++) {
            const idx = Math.floor(Math.random() * available.length);
            const sym = available.splice(idx, 1)[0];
            usedSymbols.push(sym, sym);
        }
        for (let i = usedSymbols.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [usedSymbols[i], usedSymbols[j]] = [usedSymbols[j], usedSymbols[i]];
        }
        return usedSymbols.map((symbol, idx) => ({
            id: idx, symbol,
            row: Math.floor(idx / lvl.cols),
            col: idx % lvl.cols,
            matched: false, selected: false
        }));
    }

    function isBlocked(tile, tiles, cols) {
        if (tile.matched) return true;
        const left = tiles.find(t => t.row === tile.row && t.col === tile.col - 1 && !t.matched);
        const right = tiles.find(t => t.row === tile.row && t.col === tile.col + 1 && !t.matched);
        return !!(left && right);
    }

    function getTileSize(cols, rows) {
        const padding = 36;
        const gap = 8;
        const maxWidth = Math.min(window.innerWidth - padding, 720);
        const maxHeight = window.innerHeight - 240;
        const tileHeightRatio = 1.3;
        const sizeByWidth = Math.floor((maxWidth - gap * (cols - 1)) / cols);
        const sizeByHeight = Math.floor((maxHeight - gap * (rows - 1)) / (rows * tileHeightRatio));
        return Math.max(40, Math.min(sizeByWidth, sizeByHeight, 70));
    }

    // ==================== RENDERING ====================
    function renderBoard() {
        const lvl = LEVELS[state.level - 1];
        const board = $('game-board');
        if (!board) return;
        board.innerHTML = '';
        const tileSize = getTileSize(lvl.cols, lvl.rows);
        board.style.gridTemplateColumns = 'repeat(' + lvl.cols + ', ' + tileSize + 'px)';
        board.style.gap = '8px';

        state.tiles.forEach(tile => {
            const el = document.createElement('div');
            el.className = 'tile';
            el.dataset.id = tile.id;
            el.style.width = tileSize + 'px';
            el.style.height = Math.round(tileSize * 1.3) + 'px';
            el.style.fontSize = Math.round(tileSize * 0.48) + 'px';

            if (tile.matched) {
                el.classList.add('empty');
            } else {
                el.textContent = tile.symbol;
                if (tile.selected) el.classList.add('selected');
                if (isBlocked(tile, state.tiles, lvl.cols)) el.classList.add('blocked');
            }

            el.addEventListener('click', function() { onTileClick(tile, el); });
            board.appendChild(el);
        });

        $('pairs').textContent = state.matched + '/' + lvl.pairs;
        $('count-shuffle').textContent = state.shufflesLeft;
        $('count-hint').textContent = state.hintsLeft;

        $('btn-shuffle').disabled = state.shufflesLeft <= 0;
        $('btn-hint').disabled = state.hintsLeft <= 0;
    }

    // ==================== GAME LOGIC ====================
    function onTileClick(tile, el) {
        if (state.paused || tile.matched) return;
        if (isBlocked(tile, state.tiles, LEVELS[state.level-1].cols)) {
            vibrate(30);
            sfxError();
            el.style.animation = 'shake 0.4s ease';
            setTimeout(function() { el.style.animation = ''; }, 400);
            return;
        }

        sfxSelect();

        if (state.selected === null) {
            state.selected = tile;
            tile.selected = true;
            renderBoard();
            return;
        }

        if (state.selected.id === tile.id) {
            state.selected.selected = false;
            state.selected = null;
            renderBoard();
            return;
        }

        const first = state.selected;
        state.selected.selected = false;
        state.selected = null;

        if (first.symbol === tile.symbol) {
            state.undoStack.push({type:'match', ids:[first.id, tile.id]});
            first.matched = true;
            tile.matched = true;
            state.matched++;
            state.totalMatches++;
            sfxMatch();
            vibrate(50);

            var rect1 = document.querySelector('[data-id="' + first.id + '"]');
            var rect2 = document.querySelector('[data-id="' + tile.id + '"]');
            if (rect1) {
                var r1 = rect1.getBoundingClientRect();
                spawnParticles(r1.left + r1.width/2, r1.top + r1.height/2, '#38a169');
            }
            if (rect2) {
                var r2 = rect2.getBoundingClientRect();
                spawnParticles(r2.left + r2.width/2, r2.top + r2.height/2, '#38a169');
            }

            renderBoard();
            checkWin();
        } else {
            sfxError();
            vibrate(30);
            state.undoStack.push({type:'deselect', ids:[first.id]});
            renderBoard();
        }
    }

    function checkWin() {
        const lvl = LEVELS[state.level - 1];
        if (state.matched >= lvl.pairs) {
            clearInterval(state.timerId);
            state.timerId = null;
            sfxWin();
            vibrate([40, 40, 40, 40]);
            const timeUsed = lvl.time - state.timeLeft;
            const prevBest = state.bestTimes[state.level] || 9999;
            state.bestTimes[state.level] = Math.min(timeUsed, prevBest);
            if (state.level >= state.unlocked) state.unlocked = Math.min(100, state.level + 1);
            state.gamesPlayed++;
            save();

            var stars = 1;
            if (timeUsed < lvl.time * 0.5) stars = 3;
            else if (timeUsed < lvl.time * 0.75) stars = 2;

            var starHTML = '';
            for (var s = 0; s < 3; s++) {
                starHTML += '<span class="star" style="opacity:' + (s < stars ? '1' : '0.3') + '">⭐</span>';
            }
            $('star-rating').innerHTML = starHTML;

            setTimeout(function() {
                var msg = 'Level ' + state.level + ' cleared in ' + formatTime(timeUsed) + '!';
                if (timeUsed < prevBest) msg += ' New best time!';
                $('win-message').textContent = msg;
                showOverlay('win');
            }, 600);
        }
    }

    function checkLose() {
        if (state.timeLeft <= 0) {
            clearInterval(state.timerId);
            state.timerId = null;
            sfxLose();
            vibrate([80, 80, 80]);
            showOverlay('lose');
        }
    }

    function formatTime(sec) {
        var m = Math.floor(sec / 60).toString().padStart(2, '0');
        var s = Math.floor(sec % 60).toString().padStart(2, '0');
        return m + ':' + s;
    }

    function startTimer() {
        clearInterval(state.timerId);
        state.timerId = setInterval(function() {
            if (state.paused) return;
            state.timeLeft--;
            state.totalTime++;
            $('timer').textContent = formatTime(state.timeLeft);
            if (state.timeLeft <= 10) {
                $('timer').style.color = '#e53e3e';
                if (state.timeLeft <= 5 && state.timeLeft > 0) {
                    beep(800, 0.08, 'square', 0.04);
                }
            }
            if (state.timeLeft <= 0) checkLose();
        }, 1000);
    }

    function loadLevel(n) {
        state.level = n;
        var lvl = LEVELS[n - 1];
        state.tiles = generateBoard(lvl);
        state.selected = null;
        state.matched = 0;
        state.timeLeft = lvl.time;
        state.shufflesLeft = lvl.shuffleCount;
        state.hintsLeft = lvl.hintCount;
        state.undoStack = [];
        state.paused = false;

        $('level-num').textContent = n;
        $('level-name').textContent = lvl.name;
        $('level-tier').textContent = 'Tier ' + lvl.tier;
        $('timer').textContent = formatTime(lvl.time);
        $('timer').style.color = '#e53e3e';

        renderBoard();
        startTimer();

        hideOverlay('win');
        hideOverlay('lose');
        hideOverlay('pause');
        showScreen('game');
    }

    function shuffleBoard() {
        if (state.shufflesLeft <= 0) return;
        var unmatched = state.tiles.filter(function(t) { return !t.matched; });
        if (unmatched.length < 2) return;

        sfxShuffle();
        state.shufflesLeft--;
        state.undoStack.push({type:'shuffle'});

        var symbols = unmatched.map(function(t) { return t.symbol; });
        for (var i = symbols.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = symbols[i];
            symbols[i] = symbols[j];
            symbols[j] = tmp;
        }

        unmatched.forEach(function(t, i) {
            t.symbol = symbols[i];
            t.selected = false;
        });
        state.selected = null;
        renderBoard();
    }

    function showHint() {
        if (state.hintsLeft <= 0) return;
        var lvl = LEVELS[state.level - 1];
        var free = state.tiles.filter(function(t) {
            return !t.matched && !isBlocked(t, state.tiles, lvl.cols);
        });
        var groups = {};
        free.forEach(function(t) {
            groups[t.symbol] = groups[t.symbol] || [];
            groups[t.symbol].push(t);
        });

        for (var sym in groups) {
            if (groups[sym].length >= 2) {
                state.hintsLeft--;
                var a = groups[sym][0];
                var b = groups[sym][1];
                var els = document.querySelectorAll('#game-board .tile');
                els.forEach(function(el) {
                    var id = parseInt(el.dataset.id);
                    if (id === a.id || id === b.id) el.classList.add('hint');
                });
                setTimeout(function() {
                    document.querySelectorAll('#game-board .tile.hint').forEach(function(el) {
                        el.classList.remove('hint');
                    });
                }, 2000);
                return;
            }
        }
    }

    function undo() {
        if (state.undoStack.length === 0) return;
        var action = state.undoStack.pop();
        if (action.type === 'match') {
            action.ids.forEach(function(id) {
                var t = state.tiles.find(function(x) { return x.id === id; });
                if (t) t.matched = false;
            });
            state.matched--;
            renderBoard();
        }
    }

    // ==================== SCREENS ====================
    function renderLevelSelect() {
        var grid = $('levels-grid');
        if (!grid) return;
        grid.innerHTML = '';

        // Render tier legend
        var legend = $('tier-legend');
        if (legend) {
            legend.innerHTML = '';
            TIER_NAMES.forEach(function(name, idx) {
                var badge = document.createElement('span');
                badge.className = 'tier-badge';
                badge.textContent = name;
                if (idx === Math.floor((state.level - 1) / 10)) badge.classList.add('active');
                legend.appendChild(badge);
            });
        }

        for (var i = 1; i <= 100; i++) {
            var btn = document.createElement('button');
            btn.className = 'level-dot';
            btn.textContent = i;
            if (i === state.level) btn.classList.add('current');
            else if (i < state.unlocked) btn.classList.add('completed');
            else btn.classList.add('locked');

            btn.addEventListener('click', (function(levelNum) {
                return function() {
                    if (levelNum <= state.unlocked) {
                        sfxClick();
                        loadLevel(levelNum);
                    }
                };
            })(i));
            grid.appendChild(btn);
        }
    }

    function renderStats() {
        $('stat-level').textContent = state.level;
        var completed = 0;
        for (var i = 1; i <= 100; i++) {
            if (state.bestTimes[i]) completed++;
        }
        $('stat-completed').textContent = completed;
        $('stat-matches').textContent = state.totalMatches;
        var totalMins = Math.floor(state.totalTime / 60);
        var totalSecs = state.totalTime % 60;
        $('stat-time').textContent = totalMins.toString().padStart(2,'0') + ':' + totalSecs.toString().padStart(2,'0');
    }

    function renderSettings() {
        var toggles = [
            { id: 'toggle-sound', key: 'sound' },
            { id: 'toggle-vibrate', key: 'vibrate' }
        ];
        toggles.forEach(function(t) {
            var el = $(t.id);
            if (!el) return;
            var isOn = state[t.key];
            el.textContent = isOn ? 'ON' : 'OFF';
            el.classList.toggle('active', isOn);
            el.onclick = function() {
                state[t.key] = !state[t.key];
                el.textContent = state[t.key] ? 'ON' : 'OFF';
                el.classList.toggle('active', state[t.key]);
                save();
                sfxClick();
            };
        });
    }

    // ==================== EVENT BINDING ====================
    function bindEvents() {
        $('btn-play').addEventListener('click', function() { sfxClick(); loadLevel(state.level); });
        $('btn-levels').addEventListener('click', function() { sfxClick(); renderLevelSelect(); showScreen('level'); });
        $('btn-stats').addEventListener('click', function() { sfxClick(); renderStats(); showScreen('stats'); });
        $('btn-settings').addEventListener('click', function() { sfxClick(); renderSettings(); showScreen('settings'); });
        $('btn-howto').addEventListener('click', function() { sfxClick(); showScreen('howto'); });

        $('btn-pause').addEventListener('click', function() {
            state.paused = true;
            showOverlay('pause');
        });
        $('btn-resume').addEventListener('click', function() {
            state.paused = false;
            hideOverlay('pause');
        });
        $('btn-restart').addEventListener('click', function() {
            state.paused = false;
            loadLevel(state.level);
        });
        $('btn-quit').addEventListener('click', function() {
            state.paused = false;
            if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
            showScreen('start');
        });

        $('btn-shuffle').addEventListener('click', shuffleBoard);
        $('btn-hint').addEventListener('click', showHint);
        $('btn-undo').addEventListener('click', undo);

        $('btn-next').addEventListener('click', function() {
            if (state.level < 100) loadLevel(state.level + 1);
            else { hideOverlay('win'); showScreen('start'); }
        });
        $('btn-win-menu').addEventListener('click', function() { hideOverlay('win'); showScreen('start'); });
        $('btn-retry').addEventListener('click', function() { loadLevel(state.level); });
        $('btn-lose-menu').addEventListener('click', function() { hideOverlay('lose'); showScreen('start'); });

        $('btn-level-back').addEventListener('click', function() { sfxClick(); showScreen('start'); });
        $('btn-stats-back').addEventListener('click', function() { sfxClick(); showScreen('start'); });
        $('btn-settings-back').addEventListener('click', function() { sfxClick(); showScreen('start'); });
        $('btn-howto-back').addEventListener('click', function() { sfxClick(); showScreen('start'); });

        $('btn-reset').addEventListener('click', function() {
            if (confirm('Reset ALL progress? This will erase your level unlocks, stats, and best times. This cannot be undone.')) {
                resetProgress();
                renderSettings();
                sfxClick();
            }
        });

        // Cordova back button
        document.addEventListener('backbutton', function(e) {
            e.preventDefault();
            if ($('win-overlay').style.display === 'flex') { hideOverlay('win'); showScreen('start'); }
            else if ($('lose-overlay').style.display === 'flex') { hideOverlay('lose'); showScreen('start'); }
            else if ($('pause-overlay').style.display === 'flex') { state.paused = false; hideOverlay('pause'); }
            else if ($('game-screen').classList.contains('active')) { state.paused = true; showOverlay('pause'); }
            else if (!$('start-screen').classList.contains('active')) { showScreen('start'); }
            else { 
                if (navigator.app && navigator.app.exitApp) navigator.app.exitApp();
            }
        }, false);

        // Pause on app background
        document.addEventListener('pause', function() {
            if ($('game-screen').classList.contains('active') && 
                $('win-overlay').style.display !== 'flex' && 
                $('lose-overlay').style.display !== 'flex') {
                state.paused = true;
                showOverlay('pause');
            }
        }, false);

        window.addEventListener('resize', function() {
            resizeCanvas();
            if ($('game-screen').classList.contains('active')) renderBoard();
        });
    }

    // ==================== INIT ====================
    function init() {
        load();
        resizeCanvas();
        bindEvents();
        showScreen('start');

        // Resume audio context on first touch
        var resumeAudio = function() {
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        };
        document.body.addEventListener('touchstart', resumeAudio, { once: true });
        document.body.addEventListener('click', resumeAudio, { once: true });
    }

    // Cordova deviceready or DOMContentLoaded fallback
    document.addEventListener('deviceready', init, false);
    if (!window.cordova) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init, false);
        } else {
            init();
        }
    }
})();
