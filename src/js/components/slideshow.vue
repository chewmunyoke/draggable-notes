<template>
	<transition name="display">
		<div class="slideshow"
			:class="slideshowClass"
			v-show="status.isDisplayed">
			<div class="dragdealer dragger"
				:class="draggerClass"
				:style="draggerStyle">
				<div class="handle"
					:style="handleStyle">
					<div class="slide"
						:class="slideClass(index)"
						:style="slideStyle(index)"
						@click="slideClickHandler(index)"
						v-for="(note, index) in notes"
						:key="index">
						<div class="note">
							<div class="title-container"
<<<<<<< HEAD
								v-if="!(index == state.current && state.isEditing)">
=======
								v-if="!(index == status.current && status.isEditing)">
>>>>>>> dev
								<span class="title">{{ note.title }}</span>
								<span class="subtitle">Last Updated: </span>
								<span class="timestamp" :title="note.datestamp">{{ note.lastUpdated }}</span>
							</div>
							<div class="title-editor"
<<<<<<< HEAD
								v-if="index == state.current && state.isEditing">
=======
								v-if="index == status.current && status.isEditing">
>>>>>>> dev
								<textarea :id="'title-' + index"
									v-html="note.title">
								</textarea>
							</div>
							<div class="content"
<<<<<<< HEAD
								v-if="!(index == state.current && state.isEditing)"
								v-html="note.content">
							</div>
							<div class="content-editor"
								v-if="index == state.current && state.isEditing">
=======
								v-if="!(index == status.current && status.isEditing)"
								v-html="note.content">
							</div>
							<div class="content-editor"
								v-if="index == status.current && status.isEditing">
>>>>>>> dev
								<div :id="'content-' + index"
									v-html="note.content">
								</div>
							</div>
						</div>
						<div class="content-button-container"
							:style="containerStyle(index)">
							<div class="content-switch-wrapper">
								<div class="button-wrapper content-switch-wrapper">
									<button class="button content-switch"
										@click="contentSwitchHandler">
									</button>
								</div>
								<div class="button-wrapper content-edit-wrapper"
<<<<<<< HEAD
									v-if="index == state.current && state.appIsShowContent && !state.isEditing">
=======
									v-if="index == status.current && status.appIsShowContent && !status.isEditing">
>>>>>>> dev
									<button class="button content-edit"
										@click="contentEditHandler(index)">
									</button>
								</div>
								<div class="button-wrapper content-save-wrapper"
<<<<<<< HEAD
									v-if="index == state.current && state.appIsShowContent && state.isEditing">
=======
									v-if="index == status.current && status.appIsShowContent && status.isEditing">
>>>>>>> dev
									<button class="button content-save"
										@click="contentSaveHandler(index)">
									</button>&nbsp;
									<button class="button content-cancel"
										@click="contentCancelHandler">
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</transition>
</template>

<script>
<<<<<<< HEAD
	const Quill = require('quill');
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
		props: ['state', 'options', 'toolbarOptions', 'elements', 'notes'],
=======
	import { mapGetters } from 'vuex';

	export default {
		name: 'slideshow-component',
		props: ['status', 'notes'],
>>>>>>> dev
		computed: {
			...mapGetters([
				'slideshowClass',
				'draggerClass',
				'draggerStyle',
				'handleStyle',
				'slideClass',
				'slideStyle',
				'containerStyle'
			])
		},
		methods: {
			slideClickHandler: function(index) {
				this.$store.commit('slideClickHandler', index);
			},
			contentSwitchHandler: function() {
				this.$store.commit('contentSwitchHandler');
			},
<<<<<<< HEAD
			/**
			 * Function to show/hide slide content
			 */
			toggleContent: function(slide) {
				if (this.state.isAnimating) return false;
				this.state.isAnimating = true;

				// TODO callback
				// this.options.onToggleContent();

				if (this.state.isContent) {
					// Enable the dragdealer
					this.elements.dd.enable();
					this.elements.dd.bindEventListeners();
					this.state.appIsShowContent = false;
					this.state.slideIsShow = false;
					this.state.containerIsFixed = false;
				} else {
					// Disable the dragdealer
					this.elements.dd.disable();
					this.elements.dd.unbindEventListeners();
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
=======
			contentEditHandler: function(index) {
				this.$store.commit('contentEditHandler', index);
>>>>>>> dev
			},
			contentSaveHandler: function(index) {
				this.$store.commit('contentSaveHandler', index);
			},
<<<<<<< HEAD
			contentSwitchHandler: function(event) {
				this.toggleContent(app.elements.slides[this.state.current]);
			},
			contentEditHandler: function(index) {
				this.state.isEditing = true;
				app.$nextTick(function() {
					this.elements.editor = new Quill('#content-' + index, {
						theme: 'snow',
						modules: {
							toolbar: app.toolbarOptions
						}
					});
				});
			},
			contentSaveHandler: function(index) {
				// TODO
				let newTitle = this.$el.querySelector('#title-' + index).value;
				let newContent = this.elements.editor.container.querySelector('.ql-editor').innerHTML;
				this.notes[index].title = newTitle;
				this.notes[index].content = newContent;
				this.state.isEditing = false;
			},
			contentCancelHandler: function(event) {
				this.state.isEditing = false;
=======
			contentCancelHandler: function() {
				this.$store.commit('contentCancelHandler');
>>>>>>> dev
			}
		}
	};
<<<<<<< HEAD

	EventBus.$on('dragger-button-toggle', function() {
		app.toggle();
	});
	EventBus.$on('content-button-toggle', function(currentSlide) {
		app.toggleContent(currentSlide);
	});
=======
>>>>>>> dev
</script>
