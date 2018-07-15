# Draggable Notes

A horizontal scrolling notes web app available in a big or small carousel. Easy navigation: just scroll up/down in your web browser, or swipe left/right in your mobile browser. Click/tap on the arrow button at the bottom of each note to maximize the note and reveal more of its contents; click/tap again to minimize it.

**Demo:** https://chewmunyoke.github.io/draggable-notes/

**Note:** This experimental project is made for demonstration purpose only and not intended for production.

## Navigation in Web Browser

- Dragging / Swiping
	- Click/tap and hold **left/right** to navigate to previous/next note.
- Mousewheel scrolling
	- Scroll **up/down** to navigate to previous/next note.
- Arrow keys
	- Press **left/right** arrow keys to navigate to previous/next note.
	- Press **down** arrow key when in big carousel view to maximize note in fullscreen.
	- Press **up** arrow key when maximized note is scrolled to topmost to minimize it.
- Up arrow button
	- Located at the bottom of each note when in big carousel view. Click/tap on it to maximize the note.
- Down arrow button
	- Located at the top of the maximized note. Click/tap on it to minimize the note.

## Installation

1. Clone the repository, or download and extract the repository zip file and navigate to its directory
   ```
   cd /path/to/project/folder/
   ```
2. Install dependencies using [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/lang/en/)
   ```
   npm install
   ```
3. Deploy the web application to the development server http://localhost:8080/
   ```
   npm run start
   ```
4. Build a production-ready web application in /dist
   ```
   npm run build
   ```

## Technology Stack

- [Vue](https://vuejs.org/)
- [Vuex](https://vuex.vuejs.org/)
- [Webpack](https://webpack.js.org/)
- [Babel](https://babeljs.io/)
- [ESLint](https://eslint.org/)
- [Sass](https://sass-lang.com/)

## Task List

- [x] Convert mockup to code
- [x] CRUD functions of notes
- [x] WYSIWYG editor
- [ ] Database
- [ ] User login
- [x] Linters
- [ ] Testing
- [ ] Search
- [ ] Additional features (to-do, reminder)
- [ ] Themes (optional)

## Credits

* Design inspired by [iPhone X Todo App Concept](https://www.uplabs.com/posts/iphone-x-todo-concept) by Jae-seong, Jeong
* Code based on a [Codrops Article](https://tympanus.net/codrops/?p=19332) by Mary Lou
* [Dragdealer.js v0.9.7](https://github.com/skidding/dragdealer) plugin by Ovidiu Cherecheș

Created and maintained by [Angeline Chew](https://github.com/chewmunyoke) under the [MIT license](https://github.com/chewmunyoke/draggable-notes/blob/master/LICENSE).
