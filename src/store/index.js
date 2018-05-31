import Vue from 'vue';
import Vuex from 'vuex';

import * as getters from './getters';
import mutations from './mutations';
import * as actions from './actions';
import plugins from './plugins';
import * as constants from '../utils/constants';

//let debug = process.env.NODE_ENV !== 'production';
let debug = true;

Vue.use(Vuex);
export default new Vuex.Store({
	strict: debug,
	plugins: debug ? plugins : [],
	state: constants.state,
	getters,
	mutations,
	actions
});
