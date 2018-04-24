<template>
	<section class="main" v-cloak>
		<header-component
			:state="state">
		</header-component>
		<slideshow-component
			:state="state"
			:options="options"
			:elements="elements"
			:notes="notes">
		</slideshow-component>
	</section>
</template>

<script>
	const moment = require('moment');
	const Dragdealer = require('../dragdealer.js');
	import EventBus from '../eventbus.js';
	import HeaderComponent from './header.vue';
	import SlideshowComponent from './slideshow.vue';

	let data = {
		// App initial state
		state: {
			current: 0,
			isDisplayed: false,
			isFullscreen: true,
			isContent: false,
			isAnimating: false,
			appIsSwitchMax: false,
			appIsSwitchMin: false,
			appIsSwitchShow: false,
			appIsShowContent: false,
			draggerButtonIsToggled: false,
			draggerIsToggled: false,
			draggerIsTransforming: false,
			slideIsShow: false,
			containerIsFixed: false,
			preserve3dSlides: false // fixes rendering problem in firefox
		},
		// App default options
		options: {
			perspective: 1200,
			slideshowRatio: 0.3,
			draggerWidthPct: 100,
			draggerHeightPct: 60,
			slideWidthPct: 80,
			slideContentMargin: 20
		},
		elements: {},
		user: {},
		notes: []
	};

	var app;

	export default {
		name: 'app-component',
		data() {
			return data;
		},
		components: {
			HeaderComponent,
			SlideshowComponent
		},
		created: function() {
			app = this;
			initEvents();
			EventBus.$emit('fetch-data');
		}
	};

	function initEvents() {
		document.addEventListener('mousewheel', function(event) {
			if (!app.state.isContent) {
				if (event.deltaY < 0) {
					// Scroll up = previous slide
					app.elements.dd.setStep(app.state.current);
				} else {
					// Scroll down = next slide
					app.elements.dd.setStep(app.state.current + 2);
				}
			}
		});

		document.addEventListener('keydown', function(event) {
			let keyCode = event.keyCode || event.which,
				currentSlide = app.elements.slides[app.state.current];

			if (app.state.isContent) {
				switch (keyCode) {
					case 38: // Up arrow key
						// Toggle content only if content is scrolled to topmost
						if (currentSlide.scrollTop === 0) {
							app.toggleContent(currentSlide);
						}
						break;
				}
			} else {
				switch (keyCode) {
					case 40: // Down arrow key
						// Toggle content only if it's fullscreen
						if (app.state.isFullscreen) {
							app.toggleContent(currentSlide);
						}
						break;
					case 37: // Left arrow key
						app.elements.dd.setStep(app.state.current);
						break;
					case 39: // Right arrow key
						app.elements.dd.setStep(app.state.current + 2);
						break;
				}
			}
		});
	}

	EventBus.$on('fetch-data', function() {
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				let newData = JSON.parse(this.responseText);
				newData.notes.forEach(function(note) {
					note.datestamp = moment(note.timestamp).format('LLLL');
					note.lastUpdated = moment(note.timestamp).fromNow();
					note.content = '<p>' + note.content + '</p>';
					note.content = note.content.replace(/\n/g, '</p><p>');
					app.notes.push(note);
				});
				app.user = newData.user;
				EventBus.$emit('init-dd');
			}
		};
		xhr.open('GET', 'https://api.jsonbin.io/b/5adde191003aec63328dc0e1', true);
		setTimeout(function() {
			xhr.send();
		}, 500);
	});

	EventBus.$on('init-dd', function() {
		app.$nextTick(function() {
			app.elements = {
				slideshow: app.$el.querySelector('.slideshow'),
				dragger: app.$el.querySelector('.dragger'),
				handle: app.$el.querySelector('.handle')
			};
			app.elements.slides = [].slice.call(app.elements.handle.children);
			app.elements.dd = new Dragdealer(app.elements.dragger, {
				steps: app.notes.length,
				speed: 0.3,
				loose: true,
				callback: function(x, y) {
					app.state.current = app.elements.dd.getStep()[0] - 1;
				}
			});
		});
		app.state.isDisplayed = true;
	});
</script>
