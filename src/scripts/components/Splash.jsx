import React from 'react';
import Backbone from 'backbone';

class Splash extends React.Component {

  handleSubmit = () => {
    Backbone.history
      .navigate(`/splash`, true);
  }

  componentDidMount() {
    $('a').click(function(){
  $('html, body').animate({
  scrollTop: $( $(this).attr('href') ).offset().top
  }, 500);
  return false;
  });

  $(document).ready(function() {
  $('#slidebottom button').hover(function() {
  var $lefty = $(this).next();
  $lefty.animate({
  left: parseInt($lefty.css('left'),10) == 0 ?
  -$lefty.outerWidth() :
  0
  });
  });
  });


  function openModalPopupWindow()
  {
  document.getElementById('modalMask').display = 'inline';  // Make the modal popup stuff visible
  }


  //Code stolen from css-tricks for smooth scrolling:
  $(function() {
  $('a[href*=#]:not([href=#])').click(function() {
  if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
  var target = $(this.hash);
  target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
  if (target.length) {
  $('html,body').animate({
  scrollTop: target.offset().top
  }, 1000);
  return false;
  }
  }
  });
  });


  (function() {
  var body = document.body;
  var burgerMenu = document.getElementsByClassName('b-menu')[0];
  var burgerContain = document.getElementsByClassName('b-container')[0];
  var burgerNav = document.getElementsByClassName('b-nav')[0];

  burgerMenu.addEventListener('click', function toggleClasses() {
    [body, burgerContain, burgerNav].forEach(function (el) {
      el.classList.toggle('open');
    });
  }, false);
})();




//LOGIC FOR PLAYER:

;(function(window, undefined) {

'use strict';

var AudioPlayer = (function() {

  // Player vars
  var
  player = document.getElementById('ap'),
  playBtn,
  prevBtn,
  nextBtn,
  plBtn,
  repeatBtn,
  volumeBtn,
  progressBar,
  preloadBar,
  curTime,
  durTime,
  trackTitle,
  audio,
  index = 0,
  playList,
  volumeBar,
  volumeLength,
  repeating = false,
  seeking = false,
  rightClick = false,
  apActive = false,
  // playlist vars
  pl,
  plLi,
  // settings
  settings = {
    volume   : .1,
    autoPlay : false,
    notification: false,
    playList : []
  };

  function init(options) {

    if(!('classList' in document.documentElement)) {
      return false;
    }

    if(apActive || player === null) {
      return;
    }

    settings = extend(settings, options);

    // get player elements
    playBtn        = player.querySelector('.ap-toggle-btn');
    prevBtn        = player.querySelector('.ap-prev-btn');
    nextBtn        = player.querySelector('.ap-next-btn');
    repeatBtn      = player.querySelector('.ap-repeat-btn');
    volumeBtn      = player.querySelector('.ap-volume-btn');
    plBtn          = player.querySelector('.ap-playlist-btn');
    curTime        = player.querySelector('.ap-time--current');
    durTime        = player.querySelector('.ap-time--duration');
    trackTitle     = player.querySelector('.ap-title');
    progressBar    = player.querySelector('.ap-bar');
    preloadBar     = player.querySelector('.ap-preload-bar');
    volumeBar      = player.querySelector('.ap-volume-bar');

    playList = settings.playList;

    playBtn.addEventListener('click', playToggle, false);
    volumeBtn.addEventListener('click', volumeToggle, false);
    repeatBtn.addEventListener('click', repeatToggle, false);

    progressBar.parentNode.parentNode.addEventListener('mousedown', handlerBar, false);
    progressBar.parentNode.parentNode.addEventListener('mousemove', seek, false);
    document.documentElement.addEventListener('mouseup', seekingFalse, false);

    volumeBar.parentNode.parentNode.addEventListener('mousedown', handlerVol, false);
    volumeBar.parentNode.parentNode.addEventListener('mousemove', setVolume);
    document.documentElement.addEventListener('mouseup', seekingFalse, false);

    prevBtn.addEventListener('click', prev, false);
    nextBtn.addEventListener('click', next, false);


    apActive = true;

    // Create playlist
    renderPL();
    plBtn.addEventListener('click', plToggle, false);

    // Create audio object
    audio = new Audio();
    audio.volume = settings.volume;



    if(isEmptyList()) {
      empty();
      return;
    }

    audio.src = playList[index].file;
    audio.preload = 'auto';
    trackTitle.innerHTML = playList[index].title;
    volumeBar.style.height = audio.volume * 100 + '%';
    volumeLength = volumeBar.css('height');

    audio.addEventListener('error', error, false);
    audio.addEventListener('timeupdate', update, false);
    audio.addEventListener('ended', doEnd, false);

    if(settings.autoPlay) {
      audio.play();
      playBtn.classList.add('playing');
      plLi[index].classList.add('pl-current');
    }
  }

/**
 *  PlayList methods
 */
    function renderPL() {
      var html = [];
      var tpl =
        '<li data-track="{count}">'+
          '<div class="pl-number">'+
            '<div class="pl-count">'+
              '<svg fill="#000000" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">'+
                  '<path d="M0 0h24v24H0z" fill="none"/>'+
                  '<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>'+
              '</svg>'+
            '</div>'+
            '<div class="pl-playing">'+
              '<div class="eq">'+
                '<div class="eq-bar"></div>'+
                '<div class="eq-bar"></div>'+
                '<div class="eq-bar"></div>'+
              '</div>'+
            '</div>'+
          '</div>'+
          '<div class="pl-title">{title}</div>'+
          '<button class="pl-remove">'+
              '<svg fill="#000000" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">'+
                  '<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>'+
                  '<path d="M0 0h24v24H0z" fill="none"/>'+
              '</svg>'+
          '</button>'+
        '</li>';

      playList.forEach(function(item, i) {
        html.push(
          tpl.replace('{count}', i).replace('{title}', item.title)
        );
      });

      pl = create('div', {
        'className': 'pl-container hide',
        'id': 'pl',
        'innerHTML': !isEmptyList() ? '<ul class="pl-list">' + html.join('') + '</ul>' : '<div class="pl-empty">PlayList is empty</div>'
      });

      player.parentNode.insertBefore(pl, player.nextSibling);

      plLi = pl.querySelectorAll('li');

      pl.addEventListener('click', listHandler, false);
    }

    function listHandler(evt) {
      evt.preventDefault();
      if(evt.target.className === 'pl-title') {
        var current = parseInt(evt.target.parentNode.getAttribute('data-track'), 10);
        index = current;
        play();
        plActive();
      }
      else {
        var target = evt.target;
        while(target.className !== pl.className) {
          if(target.className === 'pl-remove') {
            var isDel = parseInt(target.parentNode.getAttribute('data-track'), 10);

            playList.splice(isDel, 1);
            target.parentNode.parentNode.removeChild(target.parentNode);

            plLi = pl.querySelectorAll('li');

            [].forEach.call(plLi, function(el, i) {
              el.setAttribute('data-track', i);
            });

            if(!audio.paused) {

              if(isDel === index) {
                play();
              }

            }
            else {
              if(isEmptyList()) {
                empty();
              }
              else {
                // audio.currentTime = 0;
                audio.src = playList[index].file;
                document.title = trackTitle.innerHTML = playList[index].title;
                progressBar.style.width = 0;
              }
            }
            if(isDel < index) {
              index--;
            }

            return;
          }
          target = target.parentNode;
        }

      }
    }

    function plActive() {
      if(audio.paused) {
        plLi[index].classList.remove('pl-current');
        return;
      }
      var current = index;
      for(var i = 0, len = plLi.length; len > i; i++) {
        plLi[i].classList.remove('pl-current');
      }
      plLi[current].classList.add('pl-current');
    }


/**
 *  Player methods
 */
  function error() {
    !isEmptyList() && next();
  }
  function play() {

    index = (index > playList.length - 1) ? 0 : index;
    if(index < 0) index = playList.length - 1;

    if(isEmptyList()) {
      empty();
      return;
    }

    audio.src = playList[index].file;
    audio.preload = 'auto';
    document.title = trackTitle.innerHTML = playList[index].title;
    audio.play();
    notify(playList[index].title, {
      icon: playList[index].icon,
      body: 'Now playing',
      tag: 'music-player'
    });
    playBtn.classList.add('playing');
    plActive();
  }

  function prev() {
    index = index - 1;
    play();
  }

  function next() {
    index = index + 1;
    play();
  }

  function isEmptyList() {
    return playList.length === 0;
  }

  function empty() {
    audio.pause();
    audio.src = '';
    trackTitle.innerHTML = 'queue is empty';
    curTime.innerHTML = '--';
    durTime.innerHTML = '--';
    progressBar.style.width = 0;
    preloadBar.style.width = 0;
    playBtn.classList.remove('playing');
    pl.innerHTML = '<div class="pl-empty">PlayList is empty</div>';
  }

  function playToggle() {
    if(isEmptyList()) {
      return;
    }
    if(audio.paused) {
      audio.play();
      notify(playList[index].title, {
        icon: playList[index].icon,
        body: 'Now playing'
      });
      this.classList.add('playing');
    }
    else {
      audio.pause();
      this.classList.remove('playing');
    }
    plActive();
  }

  function volumeToggle() {
    if(audio.muted) {
      if(parseInt(volumeLength, 10) === 0) {
        volumeBar.style.height = '100%';
        audio.volume = 1;
      }
      else {
        volumeBar.style.height = volumeLength;
      }
      audio.muted = false;
      this.classList.remove('muted');
    }
    else {
      audio.muted = true;
      volumeBar.style.height = 0;
      this.classList.add('muted');
    }
  }

  function repeatToggle() {
    var repeat = this.classList;
    if(repeat.contains('ap-active')) {
      repeating = false;
      repeat.remove('ap-active');
    }
    else {
      repeating = true;
      repeat.add('ap-active');
    }
  }

  function plToggle() {
    this.classList.toggle('ap-active');
    pl.classList.toggle('hide');
  }

  function update() {
    if(audio.readyState === 0) return;

    var barlength = Math.round(audio.currentTime * (100 / audio.duration));
    progressBar.style.width = barlength + '%';

    var
    curMins = Math.floor(audio.currentTime / 60),
    curSecs = Math.floor(audio.currentTime - curMins * 60),
    mins = Math.floor(audio.duration / 60),
    secs = Math.floor(audio.duration - mins * 60);
    (curSecs < 10) && (curSecs = '0' + curSecs);
    (secs < 10) && (secs = '0' + secs);

    curTime.innerHTML = curMins + ':' + curSecs;
    durTime.innerHTML = mins + ':' + secs;

    var buffered = audio.buffered;
    if(buffered.length) {
      var loaded = Math.round(100 * buffered.end(0) / audio.duration);
      preloadBar.style.width = loaded + '%';
    }
  }

  function doEnd() {
    if(index === playList.length - 1) {
      if(!repeating) {
        audio.pause();
        plActive();
        playBtn.classList.remove('playing');
        return;
      }
      else {
        index = 0;
        play();
      }
    }
    else {
      index = (index === playList.length - 1) ? 0 : index + 1;
      play();
    }
  }

  function moveBar(evt, el, dir) {
    var value;
    if(dir === 'horizontal') {
      value = Math.round( ((evt.clientX - el.offset().left) + window.pageXOffset) * 100 / el.parentNode.offsetWidth);
      el.style.width = value + '%';
      return value;
    }
    else {
      var offset = (el.offset().top + el.offsetHeight)  - window.pageYOffset;
      value = Math.round((offset - evt.clientY));
      if(value > 100) value = 100;
      if(value < 0) value = 0;
      volumeBar.style.height = value + '%';
      return value;
    }
  }

  function handlerBar(evt) {
    rightClick = (evt.which === 3) ? true : false;
    seeking = true;
    seek(evt);
  }

  function handlerVol(evt) {
    rightClick = (evt.which === 3) ? true : false;
    seeking = true;
    setVolume(evt);
  }

  function seek(evt) {
    if(seeking && rightClick === false && audio.readyState !== 0) {
      var value = moveBar(evt, progressBar, 'horizontal');
      audio.currentTime = audio.duration * (value / 100);
    }
  }

  function seekingFalse() {
    seeking = false;
  }

  function setVolume(evt) {
    volumeLength = volumeBar.css('height');
    if(seeking && rightClick === false) {
      var value = moveBar(evt, volumeBar.parentNode, 'vertical') / 100;
      if(value <= 0) {
        audio.volume = 0;
        volumeBtn.classList.add('muted');
      }
      else {
        if(audio.muted) audio.muted = false;
        audio.volume = value;
        volumeBtn.classList.remove('muted');
      }
    }
  }

  function notify(title, attr) {
    if(!settings.notification) {
      return;
    }
    if(window.Notification === undefined) {
      return;
    }
    window.Notification.requestPermission(function(access) {
      if(access === 'granted') {
        var notice = new Notification(title.substr(0, 110), attr);
        notice.onshow = function() {
          setTimeout(function() {
            notice.close();
          }, 5000);
        }
        // notice.onclose = function() {
        //   if(noticeTimer) {
        //     clearTimeout(noticeTimer);
        //   }
        // }
      }
    })
  }

/* Destroy method. Clear All */
  function destroy() {
    if(!apActive) return;

    playBtn.removeEventListener('click', playToggle, false);
    volumeBtn.removeEventListener('click', volumeToggle, false);
    repeatBtn.removeEventListener('click', repeatToggle, false);
    plBtn.removeEventListener('click', plToggle, false);

    progressBar.parentNode.parentNode.removeEventListener('mousedown', handlerBar, false);
    progressBar.parentNode.parentNode.removeEventListener('mousemove', seek, false);
    document.documentElement.removeEventListener('mouseup', seekingFalse, false);

    volumeBar.parentNode.parentNode.removeEventListener('mousedown', handlerVol, false);
    volumeBar.parentNode.parentNode.removeEventListener('mousemove', setVolume);
    document.documentElement.removeEventListener('mouseup', seekingFalse, false);

    prevBtn.removeEventListener('click', prev, false);
    nextBtn.removeEventListener('click', next, false);

    audio.removeEventListener('error', error, false);
    audio.removeEventListener('timeupdate', update, false);
    audio.removeEventListener('ended', doEnd, false);
    player.parentNode.removeChild(player);

    // Playlist
    pl.removeEventListener('click', listHandler, false);
    pl.parentNode.removeChild(pl);

    audio.pause();
    apActive = false;
  }


/**
 *  Helpers
 */
  function extend(defaults, options) {
    for(var name in options) {
      if(defaults.hasOwnProperty(name)) {
        defaults[name] = options[name];
      }
    }
    return defaults;
  }
  function create(el, attr) {
    var element = document.createElement(el);
    if(attr) {
      for(var name in attr) {
        if(element[name] !== undefined) {
          element[name] = attr[name];
        }
      }
    }
    return element;
  }

  Element.prototype.offset = function() {
    var el = this.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    return {
      top: el.top + scrollTop,
      left: el.left + scrollLeft
    };
  };

  Element.prototype.css = function(attr) {
    if(typeof attr === 'string') {
      return getComputedStyle(this, '')[attr];
    }
    else if(typeof attr === 'object') {
      for(var name in attr) {
        if(this.style[name] !== undefined) {
          this.style[name] = attr[name];
        }
      }
    }
  };


/**
 *  Public methods
 */
  return {
    init: init,
    destroy: destroy
  };

})();

window.AP = AudioPlayer;

})(window);


// test image for web notifications
var iconImage = 'http://funkyimg.com/i/21pX5.png';

AP.init({
  playList: [
              {'icon': iconImage, 'title': 'Metro', 'file': 'assets/metro.mp3'},
  ]
});


var preTop = $('body').scrollTop();
var $header = $('.navbar');
$(window).scroll(function($e){
  var curTop = $('body').scrollTop();
  if(curTop > 450){
    $header.addClass('zoom-v');
  }else{
    $header.removeClass('zoom-v');
  }
  preTop = curTop;
});

// Card functionality//

//BOX 1//

$(".box1").mouseover(
  function(){
 	 $(".box-bottom1").stop(true, false).animate({ height: "100%" }, "slow");

});
$(".box1").mouseleave(
  function(){
 	 $(".box-bottom1").stop(true, false).animate({ height: "0px" }, "slow");

});

//BOX 2//

$(".box2").mouseover(
  function(){
 	 $(".box-bottom2").stop(true, false).animate({ height: "100%" }, "slow");

});
$(".box2").mouseleave(
  function(){
 	 $(".box-bottom2").stop(true, false).animate({ height: "0px" }, "slow");

});

//BOX 3//

$(".box3").mouseover(
  function(){
 	 $(".box-bottom3").stop(true, false).animate({ height: "100%" }, "slow");

});
$(".box3").mouseleave(
  function(){
 	 $(".box-bottom3").stop(true, false).animate({ height: "0px" }, "slow");

});





// Create a lightbox

var $lightbox = $("<div class='lightbox'></div>");
var $img = $("<img>");
var $caption = $("<p class='caption'></p>");


// Add image and caption to lightbox

$lightbox
	.append($img)
	.append($caption);

// Add lighbox to document

$('body').append($lightbox);


$('.gallery li').click(function (e) {
	e.preventDefault();

	// Get image link and description
	var src = $(this).children('img').attr("src");
	var cap = $(this).children('img').attr("alt");

	// Add data to lighbox

	$img.attr('src',src);
	$caption.text(cap);

	// $lightbox.append('<img src="' + src + '"></img><p class="caption">' + caption + '</p>');

	// Show lightbox

	$lightbox.fadeIn('fast');

	$lightbox.click(function () {
		$lightbox.fadeOut('fast');
	});
});




//Laptop Scrolling Menu//


var page = document.querySelector('.page'),
    bannerTitle = document.querySelector('.banner__title'),
    bannerTitleTop = bannerTitle.offsetTop,
    bannerParentHeight = bannerTitle.parentElement.offsetHeight,
    fixedClass = 'banner__title--fixed';

function scrollFix (scrollEvent) {
  if (getPageY(scrollEvent) >= bannerTitleTop) {
    /**Add the fixed class to the element */
    bannerTitle.classList.add(fixedClass);
    /**To prevent the parent element collapsing, causing
     * a jump in all content below the parent element
     * we need to explicitly set parent element height
     * when removing the element (bannerTitle) from the
     * parent by giving it a fixed position.
     * When the element is re-inserted into the parent
     * the height will be re-calculated by the browser!
     */
    bannerTitle.parentElement.setAttribute("style","height:" + bannerParentHeight + 'px');
  }
  else if (getPageY(scrollEvent) < bannerTitleTop) {
  bannerTitle.classList.remove(fixedClass);
  }
}

function getPageY (event) {
  /** hopefully this is cross-browser! */
  return event.pageY
    || window.pageYOffset
    || event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
}

window.addEventListener('scroll', scrollFix, false);

}

  render() {
    return (
      <div>
      <div className="mobile-nav">

      <div className="b-nav">
            <ul>
                <li><a className="b-link b-link--active" href="#splash">HOME</a></li>
                <li><a className="b-link" href="#news">NEWS</a></li>
                <li><a className="b-link" href="#contact">CONTACT</a></li>
                <li><div className="socialMedia">
                <a href="https://www.facebook.com/Careerfl/?ref=br_rs"><i className="fa fa-facebook-square" aria-hidden="true"></i></a>
                <a href="https://www.instagram.com/career.band/"><i className="fa fa-instagram" aria-hidden="true"></i></a>
                <a href="https://www.youtube.com/watch?v=8MwwOmGGnSY"><i className="fa fa-youtube-play" aria-hidden="true"></i></a>
                </div>
                </li>
            </ul>
      </div>
      <div className="b-container">
      <div className="b-menu">
      <div className="b-bun b-bun--top"></div>
      <div className="b-bun b-bun--mid"></div>
      <div className="b-bun b-bun--bottom"></div>
      </div>
      <a href="#" className="b-brand"></a>
      </div>
      </div>

        <div id="splash">
        <h1>CAREER</h1>
        <div className="laptopMenu">
        <li><a className="b-link b-link--active" href="#splash">CAREER</a></li>
        <li><a className="b-link" href="#news">NEWS</a></li>
        <li><a className="b-link" href="#contact">CONTACT</a></li>
        </div>


        </div>

        <div className="page">
        <header className="banner">
        <h1 className="banner__title">
        <div className="bannerLinks">
          <a href="#splash">CAREER</a>
          <a href="#news">NEWS</a>
          <a href="#contact">CONTACT</a>
          </div>
        </h1>
        </header>
        </div>

        <div id="news">
        <div className="newsContainer">
        <h2 className="text-center">NEWS.</h2>
        <h1>6/19/2017</h1>
        <p> It was popularised in the 1960s with
          the release of Letraset sheets containing
          Lorem Ipsum passages, and more recently with
          desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum</p>
        <img src="assets/careerbgphoto.jpg"/>
        <h1>7/11/2017</h1>
        <p> It was popularised in the 1960s with
          the release of Letraset sheets containing
          Lorem Ipsum passages, and more recently with
          desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum</p>
        <img src="assets/careerbgphoto.jpg"/>
        </div>

        <div className="photos">
        <div className="container">
		    <h2 className="text-center">PHOTOS.</h2>
		    <div className="gallery">
			  <ul>
				<li><img src="assets/guitar.png" className="displayPhoto"/></li>
				<li><img src="assets/springs.png" className="displayPhoto"/></li>
				<li><img src="assets/screenprint.png"  className="displayPhoto" /></li>
				<li><img src="assets/Leo.png" className="displayPhoto"/></li>
				<li><img src="assets/cleanup.png" className="displayPhoto"/></li>
				<li><img src="assets/whitespace.png" className="displayPhoto"/></li>
			  </ul>
		    </div>
	      </div>
        </div>

        </div>





        <div id="contact">
        <div className="cardContainer">

        <div className="card card-1">
          <div className="box1">
          <h2>LISTEN.</h2>
          <div className="box-bottom1">
            <div className="music">
           <div className="ap" id="ap">
           <div className="ap-inner">
           <div className="ap-panel">
           <div className="ap-item ap--playback">

           <button className="ap-controls ap-prev-btn">
           <svg xmlns="http://www.w3.org/2000/svg" fill="#ffffff" height="100" viewBox="0 0 24 24" width="100">
           <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
           <path d="M0 0h24v24H0z" fill="none"/>
           </svg>
           </button>

           <button className="ap-controls ap-toggle-btn">
           <svg xmlns="http://www.w3.org/2000/svg" fill="#fff"  height="100" viewBox="0 0 24 24" width="100" className="ap--play">
           <path d="M8 5v14l11-7z"/>
           <path d="M0 0h24v24H0z" fill="none"/>
           </svg>
           <svg xmlns="http://www.w3.org/2000/svg" fill="#ffffff" height="100" viewBox="0 0 24 24" width="100" className="ap--pause">
           <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
           <path d="M0 0h24v24H0z" fill="none"/>
           </svg>
           </button>

           <button className="ap-controls ap-next-btn">
           <svg xmlns="http://www.w3.org/2000/svg" fill="#ffffff" height="100" viewBox="0 0 24 24" width="100">
           <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
           <path d="M0 0h24v24H0z" fill="none"/>
           </svg>
           </button>
           </div>

           <div className="ap-item ap--track">
           <div className="ap-info">
           <div className="ap-title">Unknown</div>

           <div className="ap-time">
           <span className="ap-time--current">--</span>
           <span> / </span>
           <span className="ap-time--duration">--</span>
           </div>

           <div className="ap-progress-container">
           <div className="ap-progress">
           <div className="ap-bar"></div>
           <div className="ap-preload-bar"></div>
           </div>
           </div>

           </div>
           </div>
           <div className="ap-item ap--settings">
           <div className="ap-controls ap-volume-container">

           <button className="ap-volume-btn">
           <svg fill="#ffffff" height="48" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" className="ap--volume-on">
           <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
           <path d="M0 0h24v24H0z" fill="none"/>
           </svg>
           <svg xmlns="http://www.w3.org/2000/svg" fill="#ffffff" height="48" viewBox="0 0 24 24" width="24" className="ap--volume-off">
           <path d="M7 9v6h4l5 5V4l-5 5H7z"/>
           <path d="M0 0h24v24H0z" fill="none"/>
           </svg>
           </button>

           <div className="ap-volume">
           <div className="ap-volume-progress"><div className="ap-volume-bar"></div></div>
           </div>
           </div>

           <button className="ap-controls ap-repeat-btn">
           <svg fill="#ffffff"  height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
           <path d="M0 0h24v24H0z" fill="none"/>
           <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
           </svg>
           </button>

           <button className="ap-controls ap-playlist-btn">
           <svg fill="#ffffff" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
           <path d="M0 0h24v24H0z" fill="none"/>
           <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
           </svg>
           </button>

           </div>
           </div>
           </div>
           </div>
           </div>

        </div>
        </div>
        </div>


        <div className="card card-1">
          <div className="box2">
          <h2>SHOP.</h2>
          <div className="box-bottom2">
           TEST!
         </div>
           </div>
           </div>






        <div className="card card-1">
          <div className="box3">
          <h2>CONTACT.</h2>
          <div className="box-bottom3">
            <form action="https://formspree.io/victoralvareztech@gmail.com"
             method="POST">
             <input type="text" name="name" className="input" placeholder="NAME"></input>
             <input type="email" name="_replyto" className="input" placeholder="EMAIL"></input>
             <textarea  name="message" maxlength="1000" cols="50" rows="6" className="inputMessage" placeholder="MESSAGE"></textarea>
             <input type="submit" value="SUBMIT" className="submit"></input>
             </form>

        </div>
        </div>
        </div>

        </div>
        </div>
      </div>

     );
  }
}

export default Splash;
