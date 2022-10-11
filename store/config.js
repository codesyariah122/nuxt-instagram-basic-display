export const state = () => ({
	config: {
		api_url: `https://graph.instagram.com/me/media?fields=id,media_type,media_url,caption,permalink,thumbnail_url,timestamp&access_token=${process.env.NUXT_ENV_IG_TOKEN}`,
		child_url: null
	}
})

export const mutations = {
	CONFIG_API_URL(state){
		state.config.api_url
	},

	CONFIG_CHILD_URL(state, id){
		state.config.child_url = `https://graph.instagram.com/${id}/children?fields=id,media_url,thumbnail_url,media_type,timestamp&access_token=${process.env.NUXT_ENV_IG_TOKEN}`
	}
}

export const actions = {
	setupConfigApiUrl({commit}){
		commit('CONFIG_API_URL')
	},
	setupConfigChildUrl({commit}, id){
		commit('CONFIG_CHILD_URL', id)
	}
}

export const getters = {
	getApiUrl(state){
		return state.config.api_url
	},
	getChildApiUrl(state){
		return state.config.child_url
	}
}