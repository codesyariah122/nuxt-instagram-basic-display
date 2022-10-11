<style lang="scss" scoped>
	.container{
		position: relative;
		width: 100%;
		.media{
			opacity: 1;
			display: block;
			width: 250px;
			height: 250px;
			transition: .5s ease;
			backface-visibility: hidden;
		}
		.middle{
			transition: .5s ease;
			opacity: 0;
			position: absolute;
			top: 50%;
			left: 45%;
			transform: translate(-50%, -50%);
			-ms-transform: translate(-50%, -50%);
		}
		&:hover > .media {
			opacity: 0.3;
		}

		&:hover > .middle {
			opacity: 1;
		}
		button{
			background-color: transparent;
			border-radius: 50%;
			border: none;
			color: white;
			font-size: 51px;
			padding: 16px 32px;
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
		<b-row class="justify-content-start mb-5">
			<b-col lg="12" sm="12">
				<h1>Instagram Feed App</h1>
				<p>
					Basic instagram display api
				</p>
			</b-col>
		</b-row>

		<b-row v-if="configLoading.first" class="justify-content-center">
			<b-col v-for="(n, idx) in feeds.length" :key="idx" lg="4" md="4" sm="12" class="mb-5">
				<b-skeleton-img></b-skeleton-img>
			</b-col>
		</b-row>

		<b-row v-else class="justify-content-start">
			<b-col v-for="(item, idx) in feeds" :key="idx" lg="4" md="4" sm="12" class="mb-5">
				<div v-if="item.media_type === 'IMAGE' || item.media_type === 'CAROUSEL_ALBUM' || item.media_type === 'VIDEO'" class="container">
					<img v-if="item.media_type === 'IMAGE'" :src="item.media_url" class="media"/>

					<b-carousel v-else-if="item.media_type === 'CAROUSEL_ALBUM'" class="media" fade indicators>
						<b-carousel-slide :img-src="item.media_url"></b-carousel-slide>
					</b-carousel>

					<video v-else class="media">
						<source :src="item.media_url" type="video/mp4"/>
						<source :src="item.media_url" type="video/webm"/>
						<source :src="item.media_url" type="video/ogg"/>
					</video>

					<div class="middle">
						<b-button class="button text-primary" @click="detailFeed(item)">
							<font-awesome-icon :icon="['fas', 'play']"/>
						</b-button>
					</div>

				</div>
			</b-col>

			<b-col lg="12" sm="12">
				<b-modal id="detail-feed" size="lg" class="feed__media" hide-header hide-footer>
					<div class="feed__detail-content">
						<div v-if="detail.media_type === 'CAROUSEL_ALBUM'" class="feed__media">
							<div id="carouselExampleControlsNoTouching" class="carousel slide" data-touch="false" data-interval="false">
								<div class="carousel-inner">
									<div v-for="(item, idx) in carousel.data" :key="idx" :class="`carousel-item ${idx === 0 ? 'active' : ''}`">
										<video v-if="item.media_type === 'VIDEO'" controls autoplay>
											<source :src="item.media_url" type="video/mp4"/>
											<source :src="item.media_url" type="video/webm"/>
											<source :src="item.media_url" type="video/ogg"/>
										</video>

										<img v-else :src="item.media_url" class="d-block w-100">
									</div>
								</div>
								<button class="carousel-control-prev" type="button" data-target="#carouselExampleControlsNoTouching" data-slide="prev">
									<span class="carousel-control-prev-icon" aria-hidden="true"></span>
									<span class="sr-only">Previous</span>
								</button>
								<button class="carousel-control-next" type="button" data-target="#carouselExampleControlsNoTouching" data-slide="next">
									<span class="carousel-control-next-icon" aria-hidden="true"></span>
									<span class="sr-only">Next</span>
								</button>
							</div>
						</div>

						<div v-else class="feed__media">
							<img v-if="detail.media_type === 'IMAGE'" :src="detail.media_url"/>

							<video v-else controls autoplay>
								<source :src="detail.media_url" type="video/mp4"/>
								<source :src="detail.media_url" type="video/webm"/>
								<source :src="detail.media_url" type="video/ogg"/>
							</video>
						</div>

						<div class="feed__context">
							<p>
								{{$moment(detail.timestamp).format("LLLL")}}
							</p>
							<article v-html="detail.caption"></article>
						</div>

					</div>
				</b-modal>
			</b-col>
		</b-row>

		<b-row v-if="next" class="d-flex justify-content-center mt-3 mb-5">
			<b-spinner v-if="configLoading.next" style="width: 5rem; height:5rem;" label="Loading..."></b-spinner>
		</b-row>

		<b-row class="justify-content-center mt-5 mb-5" ref="infinite">
			<b-col lg="2" sm="12" md="2">
				<br>
			</b-col>
		</b-row>

	</b-container>
</template>

<script>
	export default {
		data(){
			return {
				next: null,
				configLoading: {
					first: null,
					next: null
				},
				feeds: [],
				paging: {},
				detail: {},
				carousel:[]
			}
		},

		beforeMount(){
			this.configApiUrl(),
			this.allFeeds(this.api_url)
		},

		mounted(){
			this.loadMoreFeed()
		},

		methods: {
			configApiUrl(){
				return this.$store.dispatch('config/setupConfigApiUrl')
			},

			async allFeeds(url){
				this.configLoading.first = true
				try{					
					await this.$axios
					.get(url)
					.then(({data}) => {
						if(data.data.length > 0){
							this.feeds = data.data 
							this.paging = data.paging
						}else{
							this.next = true
						}
					})
					.catch(err => console.error(err.response))
					.finally(() => {
						setTimeout(() => {
							this.configLoading.first = false
						}, 1500)
					})
				}catch(err){
					console.error(err)
				}
			},

			detailFeed(item){
				// children endpoint for carousel media_type
				if(item.media_type === 'CAROUSEL_ALBUM'){
					this.$store.dispatch('config/setupConfigChildUrl', item.id)
					this.getCarousel(this.child_url)
					this.$bvModal.show('detail-feed')
				}

				this.detail = item
				this.$bvModal.show('detail-feed')
			},

			getCarousel(url){
				this.$axios
				.get(url)
				.then(({data}) => {
					console.log(data)
					this.carousel = data
				})
				.catch(err => console.error(err.response))
			},

			async nextFeed(url){
				this.next = true
				this.configLoading.next = true
				await this.$axios
				.get(url)
				.then(({data}) => {
					data.data.map(d => {
						this.feeds.push(d)
						this.paging = data.paging
					})
				})
				.catch(err => console.error(err.response))
				.finally(() => {
					setTimeout(() => {
						this.configLoading.next = false
					}, 2500)
				})
			},

			loadMoreFeed(){
				window.onscroll = () => {
					// console.log(this.$refs.infinite.getBoundingClientRect().bottom)
					if(this.$refs.infinite.getBoundingClientRect().bottom <= 608){
						this.nextFeed(this.paging.next)
					}else{
						console.log("Stay")
					}
				}
			}

		},

		computed: {
			api_url(){
				return this.$store.getters['config/getApiUrl']
			},
			child_url(){
				return this.$store.getters['config/getChildApiUrl']
			}
		}
	}
</script>