export const state = () => ({
	feeds: [],
	carousel: {},
	loading: null
});

export const mutations = {
	allFeeds: (state, feeds) => {
		state.feeds = feeds
	},
	loading: (state, val) => {
		state.loading = val
	},
	NEXT_FEED:(state, feeds) => {
		state.feeds = feeds
	},
	CAROUSEL_ALBUM: (state, carousel) => {
		state.carousel = carousel
	}
}

export const actions = {
	async allFeeds({ commit }) {
		commit('loading', true)
		try {
			const url = `https://graph.instagram.com/me/media?fields=id,media_type,name,caption,permalink,media_url,thumbnail_url,timestamp&access_token=${process.env.NUXT_ENV_INSTAGRAM_KEY}`
			await this.$axios.get(url)
			.then(({data}) => {
				commit("allFeeds", data)
			})
			.catch(err => console.error(err.response.data))
			.finally(() => {
				setTimeout(() => {
					commit('loading', false)
				}, 1500)
			})
		} catch (err) {
			console.error(err);
		}
	},

	async carouselAlbum({commit}, url){
		try{
			await this.$axios.get(url)
			.then(({data}) => {
				console.log(data)
				commit('CAROUSEL_ALBUM', data)
			})
			.catch(err => console.error(err.response.data))
		} catch (err) {
			console.error(err);
		}
	},

	async nextFeeds({commit}, url){
		commit('loading', true)
		try{
			await this.$axios.get(url)
			.then(({data}) => {
				commit('NEXT_FEED', data)
			})
			.catch(err => console.error(err.response.data))
			.finally(() => {
				setTimeout(() => {
					commit('loading', false)
				}, 1500)
			})
		} catch (err) {
			console.error(err);
		}
	}

}


export const getters = {
	getCarouselData(state){
		return state.carousel
	}
}