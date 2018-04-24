<template>
	<transition name="display">
		<div class="slideshow"
			:class="slideshowClass"
			v-show="state.isDisplayed">
			<div class="dragdealer dragger"
				:class="draggerClass"
				:style="draggerStyle">
				<div class="handle"
					:style="handleStyle">
					<div class="slide"
						:class="slideClass(index)"
						:style="slideStyle(index)"
						v-on:click="slideClickHandler(index)"
						v-for="(note, index) in notes"
						:key="index">
						<div class="note">
							<div class="title-container">
								<span class="title">{{ note.title }}</span>
								<span class="subtitle">Last Updated: </span>
								<span class="timestamp" v-bind:title="note.datestamp">{{ note.lastUpdated }}</span>
							</div>
							<div class="content" v-html="note.content">
							</div>
						</div>
						<div class="content-switch-container"
							:style="containerStyle(index)">
							<div class="content-switch-wrapper">
								<button class="content-switch"
									v-on:click="contentClickHandler">
									Read more
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</transition>
</template>

<script>
	import EventBus from '../eventbus.js';

	let docElem = window.document.documentelements,
		transEndEventNames = {
			'WebkitTransition': 'webkitTransitionEnd',
			'MozTransition': 'transitionend',
			'OTransition': 'oTransitionEnd',
			'msTransition': 'MSTransitionEnd',
			'transition': 'transitionend'
		},
		transEndEventName = transEndEventNames[Modernizr.prefixed('transition')],
		support = {transitions : Modernizr.csstransitions};

	var app;

	export default {
		name: 'slideshow-component',
		props: ['state', 'options', 'elements', 'notes'],
		computed: {
			notesCount: function() {
				// TODO if zero
				return this.notes.length;
			},
			zAxis: function() {
				return this.state.isFullscreen ?
					(this.options.perspective - (this.options.perspective / this.options.slideshowRatio)) :
					(this.options.perspective - (this.options.perspective * this.options.slideshowRatio));
			},
			slideIntialWidth: function() {
				return (this.options.slideWidthPct / this.notesCount) + '%';
			},
			slideInitialMargin: function() {
				return '0 ' + (((this.options.draggerWidthPct - this.options.slideWidthPct) / 2) / this.notesCount) + '%';
			},
			slideContentWidth: function() {
				return 'calc(' + (this.options.draggerWidthPct / this.notesCount) + '% - ' + this.options.slideContentMargin + 'px';
			},
			draggerToggledWidth: function() {
				return this.options.slideshowRatio * this.options.draggerWidthPct + '%';
			},
			draggerToggledHeight: function() {
				return this.options.slideshowRatio * this.options.draggerHeightPct + '%';
			},
			handleWidth: function() {
				return this.notesCount * this.options.draggerWidthPct + '%';
			},
			slideshowClass: function() {
				return {
					'switch-max': this.state.appIsSwitchMax,
					'switch-min': this.state.appIsSwitchMin,
					'switch-show': this.state.appIsSwitchShow,
					'show-content': this.state.appIsShowContent
				};
			},
			draggerClass: function() {
				return {
					'dragger-large': !this.state.draggerIsToggled,
					'dragger-small': this.state.draggerIsToggled
				};
			},
			draggerStyle: function() {
				return {
					// TODO prefix
					'width': this.state.draggerIsToggled ? this.draggerToggledWidth : null,
					'height': this.state.draggerIsToggled ? this.draggerToggledHeight : null,
					'transform': this.state.draggerIsTransforming ?
						'perspective(' + this.options.perspective + 'px) translate3d(0, 0, ' + this.zAxis + 'px)' :
						'translate3d(0, 0, 0)'
				};
			},
			handleStyle: function() {
				return {
					'width': this.handleWidth
				};
			}
		},
		methods: {
			slideClass: function(index) {
				return {
					'current': index == this.state.current,
					'previous': index == this.state.current - 1,
					'next': index == this.state.current + 1,
					'show': index == this.state.current && this.state.slideIsShow
				};
			},
			slideStyle: function(index) {
				return {
					'width': index == this.state.current && this.state.slideIsShow ? this.slideContentWidth : this.slideIntialWidth,
					'margin': index == this.state.current && this.state.slideIsShow ? null : this.slideInitialMargin,
					'transform-style': this.state.preserve3dSlides ? 'preserve-3d' : null
				};
			},
			containerStyle: function(index) {
				return {
					'position': index == this.state.current && this.state.containerIsFixed ? 'fixed' : null,
					'width': index == this.state.current && this.state.containerIsFixed ? this.slideContentWidth : null
				};
			},
			/**
			 * Function to toggle between fullscreen and minimized slideshow
			 */
			toggle: function() {
				if (this.state.isAnimating) return false;
				this.state.isAnimating = true;

				this.state.preserve3dSlides = true;

				// TODO callback
				//this.options.onToggle();

				// Add switch classes
				if (this.state.isFullscreen) {
					this.state.draggerButtonIsToggled = true;
					this.state.appIsSwitchMin = true;
				} else {
					this.state.draggerButtonIsToggled = false;
					this.state.appIsSwitchMax = true;
				}
				this.state.draggerIsTransforming = true;

				let onEndTransitionFn = function(event) {
					if (support.transitions) {
						if (event.propertyName.indexOf('transform') === -1 || event.target !== app.elements.dragger) return;
						this.removeEventListener(transEndEventName, onEndTransitionFn);
					}

					// Remove switch classes
					if (app.state.isFullscreen) {
						app.state.appIsSwitchMin = false;
						app.state.draggerIsToggled = true;
					} else {
						app.state.appIsSwitchMax = false;
						app.state.draggerIsToggled = false;
						app.state.preserve3dSlides = false;
					}
					app.state.draggerIsTransforming = false;

					app.state.isFullscreen = !app.state.isFullscreen;
					app.state.isAnimating = false;

					// To be executed after the DOM is updated with the computed class changes
					app.$nextTick(function() {
						// Reinstatiate the dragger with the "reflow" method
						app.elements.dd.reflow();
					});
				};

				if (support.transitions) {
					this.elements.dragger.addEventListener(transEndEventName, onEndTransitionFn);
				} else {
					onEndTransitionFn();
				}
			},
			/**
			 * Function to show/hide slide content
			 */
			_toggleContent: function(slide) {
				if (this.state.isAnimating) return false;
				this.state.isAnimating = true;

				// TODO callback
				// this.options.onToggleContent();

				if (this.state.isContent) {
					// Enable the dragdealer
					this.elements.dd.enable();
					this.state.appIsShowContent = false;
					this.state.slideIsShow = false;
					this.state.containerIsFixed = false;
				} else {
					// Disable the dragdealer
					this.elements.dd.disable();
					this.state.appIsSwitchShow = true;
					this.state.appIsShowContent = true;
					this.state.slideIsShow = true;
					slide.scrollTop = 0;
				}

				let onEndTransitionFn = function(event) {
					if (support.transitions) {
						if (event.propertyName.indexOf('transform') === -1 || event.target !== app.elements.slideshow) return;
						this.removeEventListener(transEndEventName, onEndTransitionFn);
					}

					// Set properties after transition ended
					if (app.state.isContent) {
						app.state.appIsSwitchShow = false;
					} else {
						app.state.containerIsFixed = true;
					}

					app.state.isContent = !app.state.isContent;
					app.state.isAnimating = false;

					// TODO Callback
					// app.options.onToggleContentComplete();
				};

				if (support.transitions) {
					this.elements.slideshow.addEventListener(transEndEventName, onEndTransitionFn);
				} else {
					onEndTransitionFn();
				}
			},
			slideClickHandler: function(index) {
				if (!this.state.isFullscreen && !this.state.isAnimating && !this.elements.dd.activity) {
					if (index === this.state.current) {
						this.toggle();
					} else {
						this.elements.dd.setStep(index + 1);
					}
				}
			},
			contentClickHandler: function(event) {
				this._toggleContent(app.elements.slides[this.state.current]);
			}
		},
		created: function() {
			app = this;
		}
	};

	EventBus.$on('dragger-button-toggle', function() {
		app.toggle();
	});
</script>
