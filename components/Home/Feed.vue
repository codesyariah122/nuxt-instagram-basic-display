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
.carousel-control-prev-icon,
.carousel-control-next-icon {
	height: 50px !important;
	width: 50px !important;
	margin-top: -.5rem;
	border-radius:50%;
	background-color: #004899;
	z-index: 1!important;
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
		<b-row v-else class="justify-content-start">
			<b-col v-for="(item, index) in feeds" lg="4" md="4" sm="12" :key="index" class="mb-5">
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
							<div id="carouselExampleControls" class="carousel slide" data-ride="carousel">
								<div class="carousel-inner">
									<div v-for="(item, index) in carousel.data" :class="`carousel-item ${index === 0 ? 'active' : ''}`" :key="index">
										<video v-if="item.media_type === 'VIDEO'" controls autoplay>
											<source :src="item.media_url" type="video/mp4">
											<source :src="item.media_url" type="video/ogg">
											<source :src="item.media_url" type="video/webm">
										</video>
										<img v-else :src="item.media_url" class="d-block w-100" alt="laptop satu">
									</div>
								</div>
								<button class="carousel-control-prev" type="button" data-target="#carouselExampleControls" data-slide="prev">
									<span class="carousel-control-prev-icon" aria-hidden="true"></span>
									<span class="sr-only">Previous</span>
								</button>
								<button class="carousel-control-next" type="button" data-target="#carouselExampleControls" data-slide="next">
									<span class="carousel-control-next-icon" aria-hidden="true"></span>
									<span class="sr-only">Next</span>
								</button>
							</div>
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

		<b-row class="justify-content-center mt-5 mb-5" ref="infinite">
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
				carousel: [],
				paging: {}
			}
		},

		beforeMount(){
			this.configApiUrl(),
			this.instagramFeedData(this.api_url)
		},

		mounted(){
			this.loadMoreFeed()
		},

		methods: {
			configApiUrl(){
				return this.$store.dispatch("config/storeConfigApiUrl")
			},

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
				.catch(err => console.error(err.response))
				.finally(() => {
					setTimeout(() => {
						this.configLoading.first = false
					}, 1500)
				})
			},

			detailFeed(data){
				if(data.media_type === "CAROUSEL_ALBUM"){
					// this.getCarouselStore(this.next_url)
					this.$store.dispatch('config/storeConfigChildUrl', data.id)
					this.getCarousel(this.child_url)
					this.$bvModal.show('detail-feed')
				}

				this.detail = data
				this.$bvModal.show('detail-feed')
			},

			async nextFeed(url){
				console.log(this.paging)
				this.next = true
				this.configLoading.next = true
				try{
					await this.$axios
					.get(url)
					.then(({data})=>{
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
				}catch(err){
					console.log(err)
				}
			},

			loadMoreFeed(){
				window.onscroll = () => {
					console.log(this.$refs.infinite.getBoundingClientRect().bottom)
					if(this.$refs.infinite.getBoundingClientRect().bottom <= 542.0000152587891){
						console.log(this.paging.next)
						this.nextFeed(this.paging.next)
					}else{
						console.log("Ga next ya bro")
					}
				}
			},

			getCarousel(url){
				this.$axios
				.get(url)
				.then(({data}) => {
					this.carousel = data
				})
				.catch(err => console.error(err.response))
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