export const state = () => ({
	config: {
		api_url: `https://graph.instagram.com/me/media?fields=id,media_type,name,caption,permalink,media_url,thumbnail_url,timestamp&access_token=${process.env.NUXT_ENV_INSTAGRAM_KEY}`,
		next_url: `https://graph.instagram.com/${data.id}/children?fields=id,media_url,thumbnail_url,media_type&access_token=${process.env.NUXT_ENV_INSTAGRAM_KEY}`
	}
});

export const mutations = {
}

export const actions = {
}


export const getters = {
	getApiUrl(state){
		return state.config.api_url
	},
	getNextApiUrl(state){
		return state.config.next_url
	}
}