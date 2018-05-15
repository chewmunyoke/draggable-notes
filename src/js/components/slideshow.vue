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
								v-if="!(index == status.current && status.isEditing)">
								<span class="title">{{ note.title }}</span>
								<span class="subtitle">Last Updated: </span>
								<span class="timestamp" :title="note.datestamp">{{ note.lastUpdated }}</span>
							</div>
							<div class="title-editor"
								v-if="index == status.current && status.isEditing">
								<textarea :id="'title-' + index"
									v-html="note.title">
								</textarea>
							</div>
							<div class="content"
								v-if="!(index == status.current && status.isEditing)"
								v-html="note.content">
							</div>
							<div class="content-editor"
								v-if="index == status.current && status.isEditing">
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
									v-if="index == status.current && status.appIsShowContent && !status.isEditing">
									<button class="button content-edit"
										@click="contentEditHandler(index)">
									</button>
								</div>
								<div class="button-wrapper content-save-wrapper"
									v-if="index == status.current && status.appIsShowContent && status.isEditing">
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
	import { mapGetters } from 'vuex';

	export default {
		name: 'slideshow-component',
		props: ['status', 'notes'],
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
			contentEditHandler: function(index) {
				this.$store.commit('contentEditHandler', index);
			},
			contentSaveHandler: function(index) {
				this.$store.commit('contentSaveHandler', index);
			},
			contentCancelHandler: function() {
				this.$store.commit('contentCancelHandler');
			}
		}
	};
</script>
