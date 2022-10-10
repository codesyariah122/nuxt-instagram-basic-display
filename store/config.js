export const state = () => ({
	config: {
		api_url: `https://graph.instagram.com/me/media?fields=id,media_type,name,caption,permalink,media_url,thumbnail_url,timestamp&access_token=${process.env.NUXT_ENV_INSTAGRAM_KEY}`,
		next_url: null,
		child_url: null
	}
});

export const mutations = {
	CONFIG_API_URL(state){
		state.config.api_url
	},
	CONFIG_NEXT_URL(state, url){
		state.config.api_url = url
	},
	CONFIG_CHILD_URL(state, id){
		state.config.child_url = `https://graph.instagram.com/${id}/children?fields=id,media_url,thumbnail_url,media_type&access_token=${process.env.NUXT_ENV_INSTAGRAM_KEY}`
	}
}

export const actions = {
	storeConfigApiUrl({commit}){
		commit('CONFIG_API_URL')
	},

	storeConfigChildUrl({commit}, id){
		commit('CONFIG_CHILD_URL', id)
	}
}


export const getters = {
	getApiUrl(state){
		return state.config.api_url
	},
	getNextApiUrl(state){
		return state.config.next_url
	},
	getChildApiUrl(state){
		return state.config.child_url
	}
}