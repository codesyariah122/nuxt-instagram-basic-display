<style lang="scss">
.container {
	position: relative;
	width: 100%;
	.media {
		opacity: 1;
		display: block;
		width: 250px;
		height: 250px;
		transition: .5s ease;
		backface-visibility: hidden;
	}

	.middle {
		transition: .5s ease;
		opacity: 0;
		position: absolute;
		top: 50%;
		left: 40%;
		transform: translate(-50%, -50%);
		-ms-transform: translate(-50%, -50%);
		button-align: center;
	}

	.container:hover .media {
		opacity: 0.3;
	}

	.container:hover .middle {
		opacity: 1;
	}

	.button {
		background-color: transparent;
		border-radius: 50%;
		border: none;
		color: white;
		font-size: 51px;
		padding: 16px 32px;
	}
	.carousel{
		.carousel-inner{
			.carousel-item{
				img{
					width: 250px;
					height: 300px;
				}
			}
		}
	}
}
.modal{
	.modal-dialog{
		width: 100vw!important;
		.modal-content{
			
		}
	}
}
.feed__detail-content{
	display: flex;
	.feed__media{
		width: 50%;
		img{
			width: 350px;
		}
		video{
			width: 350px;
		}
	}
	.feed__context{
		width: 50%;
		left: 0;
	}
}
</style>

<template>
	<b-container class="mt-5">
		<b-row v-if="configLoading.first" class="justify-content-center">
			<b-col v-for="(n, index) in feeds.length" lg="4" md="4" sm="12" :key="index+=1" class="mb-5">
				<div class="container">
					<b-skeleton-img class="image"></b-skeleton-img>
				</div>
			</b-col>
		</b-row>
		<b-row v-else class="justify-content-start" ref="feed_content">
			<b-col v-for="(item, index) in feeds" lg="4" md="4" sm="12" :key="item.id" class="mb-5">
				<div v-if="item.media_type === 'IMAGE' || item.media_type === 'CAROUSEL_ALBUM' || item.media_type === 'VIDEO'" class="container">

					<img v-if="item.media_type === 'IMAGE'" :src="item.media_url"  class="media">

					<b-carousel v-else-if="item.media_type === 'CAROUSEL_ALBUM'" class="media" id="carousel-fade" style="text-shadow: 0px 0px 2px #000" fade indicators >
						<b-carousel-slide :img-src="item.media_url"></b-carousel-slide>
					</b-carousel>

					<video v-else class="media">
						<source :src="item.media_url" type="video/mp4">
						<source :src="item.media_url" type="video/ogg">
					</video>
					<div class="middle">
						<b-button class="button text-primary" @click="detailFeed(item)">
							<font-awesome-icon :icon="['fas', 'play']"/>
						</b-button>
					</div>
				</div>
			</b-col>

			<b-col lg="12" sm="12" md="12">
				<b-modal id="detail-feed" size="lg" hide-header hide-footer>
					<div class="feed__detail-content">
						<div v-if="detail.media_type === 'CAROUSEL_ALBUM'" class="feed__media">
							<b-carousel  id="carousel-fade" style="text-shadow: 0px 0px 2px #000" fade indicators controls :interval="3000">
								<b-carousel-slide v-for="(item, index) in carousel.data" :img-src="item.media_url"></b-carousel-slide>
							</b-carousel>
						</div>
						<div v-else class="feed__media">
							<img v-if="detail.media_type === 'IMAGE'" :src="detail.media_url" />
							<video v-else controls autoplay>
								<source :src="detail.media_url" type="video/mp4">
								<source :src="detail.media_url" type="video/ogg">
								<source :src="detail.media_url" type="video/webm">
							</video>
						</div>
								
						<div class="feed__context">
							<p> {{$moment(detail.timestamp).format("LLLL")}} </p>
							<article v-html="detail.caption"></article>
						</div>
					</div>
				</b-modal>
			</b-col>
		</b-row>

		<b-row v-if="next" class="d-flex justify-content-center mb-3 mt-5">
			<b-spinner v-if="configLoading.next"  style="width: 5rem; height: 5rem;" variant="primary" label="Loading..."></b-spinner>
		</b-row>

		<b-row class="justify-content-center mt-5 mb-5">
			<b-col lg="2" sm="12" md="2">
				<b-button variant="none" pill size="lg" @click="nextFeed(paging.next)"><font-awesome-icon :icon="['fas', 'circle-down']" size="lg" style="font-size: 4rem;"/></b-button>
			</b-col>
		</b-row>

	</b-container>
</template>

<script>
	export default {
		data(){
			return {
				container_style: this.$device.isDesktop
				? "margin-top: 7rem;"
				: "margin-top: 5rem;",
				next: null,
				configLoading: {
					first: null,
					next: null
				},
				feeds: [],
				detail: {},
				paging: {}
			}
		},

		beforeMount(){
			this.instagramFeedData(this.api_url)
		},
		// mounted(){
		// 	this.loadMoreFeed()
		// },

		methods: {
			instagramFeedData(url){
				this.configLoading.first = true
				this.$axios
				.get(url)
				.then(({data}) => {
					if(data.data.length > 0){						
						this.feeds = data.data
						this.paging = data.paging
					}else{
						this.next = true
					}
				})
				.catch(err => console.error(err.response.data))
				.finally(() => {
					setTimeout(() => {
						this.configLoading.first = false
					}, 1500)
				})
			},

			nextFeed(url){
				this.next = true
				this.configLoading.next = true
				this.$axios
				.get(url)
				.then(({data}) => {
					data.data.map(d => {
						this.feeds.push(d)
						this.paging = data.paging
					})
				})
				.catch(err => console.error(err))
				.finally(() => {
					setTimeout(() => {
						this.configLoading.next = false
					}, 2500)
				})
			},

			loadMoreFeed(){
				window.onscroll = () => {
					this.next = true
					let bottomOfWindow = document.documentElement.scrollTop + window.innerHeight === document.documentElement.offsetHeight;
					console.log(this.$refs.feed_content.getBoundingClientRect().bottom)
					if(this.$refs.feed_content.getBoundingClientRect().bottom <= 632){
						this.nextFeed(this.paging.next)
					}else{
						console.log("Ga next ya bro")
					}
				}
			},

			detailFeed(data){
				if(data.media_type === "CAROUSEL_ALBUM"){
					const url = `https://graph.instagram.com/${data.id}/children?fields=id,media_url,thumbnail_url,media_type&access_token=${process.env.NUXT_ENV_INSTAGRAM_KEY}`
					this.getCarouselStore(url)
					this.$bvModal.show('detail-feed')
				}

				this.detail = data
				this.$bvModal.show('detail-feed')
			},

			getCarouselStore(url){
				this.$store.dispatch('carouselAlbum', url)
			}
		},

		computed: {
			api_url(){
				return this.$store.getters['config/getApiUrl']
			},
			carousel(){
				return this.$store.getters['getCarouselData']
			}
		}
	}
</script>