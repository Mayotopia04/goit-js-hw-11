import { BASE_URL, options } from './pixabay-api.js';
import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import '../css/styles.css';

//DOM links
const galleryElement = document.querySelector('.gallery');
const searchInputElement = document.querySelector('input[name="searchQuery"]');
const searchFormElement = document.getElementById('search-form');

// instantiate simpleLightbox
const lightbox = new SimpleLightbox('.lightbox', {
    captionsData: 'alt',
    captionDelay: 250,
});

let totalHits = 0;
let reachedEnd = false;

function renderGallery(hits) {
    const markup = hits
    .map(
        ({
            webformatURL,
            largeImageURL,
            tags,
            likes,
            views,
            comments,
            downloads,

        }) => {
            return `
            <a href="${largeImageURL}" class="lightbox">
                <div class="photo-card">
                    <img src="${webformatURL}" alt="${tags}" loading="lazy" />
                    <div class="info">
                        <p class="info-item" title="Likes">
                        <b>❤️</b>
                        ${likes}
                        </p>
                        <p class="info-item" title="Views">
                        <b>👀</b>
                        ${views}
                        </p>
                        <p class="info-item" title="Comments">
                        <b>📝</b>
                        ${comments}
                        </p>
                        <p class="info-item" title="Downloads">
                        <b class="icon">⬇️</b>
                        ${downloads}
                        </p>
                    </div>
                </div> 
            </a>
            `;
        }
    )
    .join('');

    galleryElement.insertAdjacentHTML('beforeend', markup);

    //Smooth page scrolling
    const { height: cardHeight } = document.querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

    // window.scrollBy({
    //     top: cardHeight * 2,
    //     behavior: 'smooth',
    // })

    //End of collection
    if (options.params.page * options.params.per_page >= totalHits) {
        if (!reachedEnd) {
            Notify.info("We're sorry, but you've reached the end of search results.");
            reachedEnd = true;
        }
    }
    lightbox.refresh();
}

async function handleSubmit(event) {
    event.preventDefault();
    options.params.q = searchInputElement.value.trim();
    if (options.params.q === '') {
        return;
    }
    options.params.page = 1;
    galleryElement.innerHTML = '';
    reachedEnd = false;

    try {
        const response = await axios.get(BASE_URL, options);
        totalHits = response.data.totalHits;

        const { hits } = response.data;
        console.log(hits);

        if (hits.length === 0) {
            Notify.info(
                'Sorry, there are no images matching your search query. Please try again.'
            );
        } else {
            Notify.success(`Hooray! We found ${totalHits} images.`, {timeout: 1000, cssAnimationStyle: 'zoom', cssAnimationDuration: 1000 });
            renderGallery(hits);
        }
        searchInputElement.value = '';
    } catch (error) {
        Notify.failure(error);
    }
}

searchFormElement.addEventListener('submit', handleSubmit);

async function loadMore() {
    options.params.page += 1;
    try {
        const response = await axios.get(BASE_URL, options);
        const hits = response.data.hits;
        renderGallery(hits);
    } catch (error) {
        Notify.failure('bummer dude👿', {fontSize: '14px', position: 'center-center', timeout: 1000, cssAnimation: 'fade', cssAnimationDuration: 1000, showOnlyLastOne: 'true'});
    }
}

function handleScroll() {
    const {scrollTop, scrollHeight, clientHeight} = document.documentElement;

    if (scrollTop + clientHeight >= scrollHeight) {
        loadMore();
    }
}

window.addEventListener('scroll', handleScroll);