const moment = require('moment');
const classie = require('desandro-classie');
import DragSlideshow from './dragslideshow.js';

(function() {
	let toggleBtn = () => {
		if (slideshow.isFullscreen) {
			classie.add(btnSwitch, 'view-maxi');
		} else {
			classie.remove(btnSwitch, 'view-maxi');
		}
	},
	toggleCtrls = () => {
		if (!slideshow.isContent) {
			classie.add(header, 'hide');
		}
	},
	toggleCompleteCtrls = () => {
		if (!slideshow.isContent) {
			classie.remove(header, 'hide');
		}
	},
	toggleSlideshow = () => {
		slideshow.toggle();
		toggleBtn();
	},
	slideshow = new DragSlideshow(document.querySelector('.slideshow'), {
		// Toggle between fullscreen & minimized slideshow
		onToggle: toggleBtn,
		// Toggle the main image & the content view
		onToggleContent: toggleCtrls,
		// Toggle the main image & the content view
		// (triggered after the animation ends)
		onToggleContentComplete: toggleCompleteCtrls
	}),
	btnSwitch = document.querySelector('button.dragger-switch');
	btnSwitch.addEventListener('click', toggleSlideshow);

	document.querySelectorAll('.timestamp').forEach(el => {
		el.innerHTML += moment().startOf('year').fromNow();
	});
}());
