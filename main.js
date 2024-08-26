var $ = document.querySelector.bind(document);
var $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const btnPlay = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playList = $('.playlist');


const app = {

    currentIndex: 0,
    isPlaying: false,
    isRandom : false,
    isRepeat : false,

    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    setConfig: function(key,value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    songs : [
        {
            name: 'Thiên Lý Ơi',
            singer: 'Jack',
            path: './assets/music/ThienLyOi-JackJ97-13829746.mp3',
            img: './assets/image/thienlyoi.jfif'
        },
        {
            name: 'Lom Dom',
            singer: 'Jack',
            path: './assets/music/DomDomTyzRemix-JackG5R-6938150.mp3',
            img: './assets/image/domdom.jfif'
        },
        {
            name: 'Sao em vô tình',
            singer: 'Jack',
            path: './assets/music/SaoEmVoTinh-ICMJackJ97LIAM-9430881.mp3',
            img: './assets/image/saoemvotinh.jfif'
        },
        {
            name: 'Buông đôi tay nhau ra',
            singer: 'Jack',
            path: './assets/music/BuongDoiTayNhauRa-SonTungMTP-4184408.mp3',
            img: './assets/image/buongdoitaynhaura.jfif'
        },
        {
            name: 'Lạc Trôi',
            singer: 'Jack',
            path: './assets/music/LacTroi-SonTungMTP-4725907.mp3',
            img: './assets/image/lactroi.jfif'
        },
        {
            name: 'Yêu 5',
            singer: 'Jack',
            path: './assets/music/Yeu5-Rhymastic-4756973.mp3',
            img: './assets/image/yeu5.jfif'
        }
    ],

    defineProperties: function() { 
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },

    render: function(){
        const htmls = this.songs.map((song,index)=>{
            return `
                <div class="song ${index == this.currentIndex ? 'active' : ''}" data-index = "${index}">
                    <div class="thumb"
                        style="background-image: url('${song.img}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })

        playList.innerHTML = htmls.join('');
    },

    handlEvents: function(){
        const cdWidth = cd.offsetWidth;
        const _this = this;

        // Xử lý quay cd và dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ],{
            duration: 15000, // thời gian quay hết 1 vòng
            iterations: Infinity, // vòng lặp vô hạn
        })
        cdThumbAnimate.pause();


        // xử lý phóng to và thu nhỏ cd
        document.onscroll = function(){
            const scrollTop = document.documentElement.scrollTop ;
            const newCdWidth = cdWidth - scrollTop
            cd.style.width =   newCdWidth>0 ? newCdWidth + 'px': 0;

            cd.style.opacity = newCdWidth/cdWidth;
        }

        //xử lý khi click play
        btnPlay.onclick = function(){
            if(!_this.isPlaying){
                audio.play();
            }else{
                audio.pause(); 
            }
        }

        // Khi song được play
        audio.onplay = function(){
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // Khi song được pause
        audio.onpause = function(){
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        //Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function(){
            const timeSong = audio.duration; 
            const currentTime = audio.currentTime;
            if(timeSong){
                const time = Math.floor((currentTime / timeSong) * 100);
                progress.value = time;
            }
        }

        //Khi tua 
        progress.onchange = function(e){
            const seekTime = e.target.value;
            audio.currentTime = seekTime * audio.duration / 100;
        } 

        //Khi click next
        nextBtn.onclick = function(){
            if(_this.isRepeat){
                _this.loadCurrentSong();
            }else if(_this.isRandom){
                _this.playRandomSong();
            }
            else{
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Khi click previous
        prevBtn.onclick = function(){
            if(_this.isRepeat){
                _this.loadCurrentSong();
            }else if(_this.isRandom){
                _this.playRandomSong();
            }
            else{
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        //Khi bật tắt random song
        randomBtn.onclick = function(){
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active',_this.isRandom)
        }

        //Khi bật tắt repeat song
        repeatBtn.onclick = function(){
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active',_this.isRepeat)
        }

        //Xử lý next song khi audio ended
        audio.onended = function(){
            nextBtn.click();
        }

        //Lắng nghe click vào playlist
        playList.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)');
            if(songNode || e.target.closest('.option')){
                
                //xử lý khi click vào song
                if(songNode){
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }

                //Xử lý option
            }
        }
    },

    loadCurrentSong: function() {
        heading.innerText = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.img}')`;
        audio.src = this.currentSong.path;
    },

    nextSong: function(){
        this.currentIndex++; //
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    prevSong: function(){
        this.currentIndex--; //
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length-1;
        }
        this.loadCurrentSong();
    },

    playRandomSong: function(){
        let newIndex;

        do{
            newIndex = Math.floor(Math.random() * this.songs.length);
        }
        while(newIndex === this.currentIndex)


        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    scrollToActiveSong: function(){
        setTimeout(() => {  
            $('.song.active').scrollIntoView({
                behavior:'smooth',
                block: 'nearest',
            })
        }, 300);
    },

    loadConfig: function(){
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    start: function(){
        // gán cấu hình từ config vào ứng dụng
        this.loadConfig()
        // Định nghĩa các thuộc tính cho object
        this.defineProperties();
        // lắng nghe / xử lý các sự kiện (DOM events)
        this.handlEvents();
        // tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();
        // hiển thị danh sách bài hát
        this.render();

        // hiển thị trạng thái
        randomBtn.classList.toggle('active',this.isRandom)
        repeatBtn.classList.toggle('active',this.isRepeat)
    }
}

app.start();
