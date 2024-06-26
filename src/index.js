// Pixabay API key: 34581261-d39fcdfb48adfd850ac44b9c1

// Описаний в документації
import SimpleLightbox from 'simplelightbox';
// Додатковий імпорт стилів
import 'simplelightbox/dist/simple-lightbox.min.css';

import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const BASE_URL = 'https://pixabay.com/api/';
const BASE_KEY = '34581261-d39fcdfb48adfd850ac44b9c1';

let page = 1;
let query = '';
const per_page = 10;
const gallerySLB = new SimpleLightbox('.gallery a');

const refs = {
  searchForm: document.querySelector('[id=search-form]'),
  inputInSearchForm: document.querySelector('[name="searchQuery"]'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
  btnLabel: document.querySelector('.label'),
  btnSpinner: document.querySelector('.btn-loader'),
  mainSpinner: document.querySelector('.main-loader'),
};

refs.searchForm.addEventListener('submit', submitForm);
refs.loadMoreBtn.addEventListener('click', requestProcessing);

function submitForm(e) {
  page = 1;
  refs.gallery.innerHTML = '';
  requestProcessing(e);
}

async function requestProcessing(e) {
  const res = await fetchQuery(e);
  console.log('requestProcessing >> res:::', res);
  const markupGallery = markupQueryResult(res);
  refs.gallery.insertAdjacentHTML('beforeend', markupGallery);
  gallerySLB.refresh();

  if (page > 2) {
    console.log('requestProcessing >> page:::', page);
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  }
}

async function fetchQuery(e) {
  e.preventDefault();
  const newQuery = refs.inputInSearchForm.value;
  if (query !== newQuery) {
    page = 1;
    query = newQuery;
    refs.gallery.innerHTML = '';
    refs.mainSpinner.classList.remove('is-hidden');
    refs.loadMoreBtn.classList.add('is-hidden');
  }

  const url = `${BASE_URL}/?key=${BASE_KEY}&q=${newQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${per_page}&page=${page}`;
  refs.loadMoreBtn.disabled = true;
  refs.btnLabel.textContent = 'Downloading...';
  refs.btnSpinner.classList.remove('is-hidden');

  try {
    const queryResult = await axios.get(url).then(res => {
      if (res.data.totalHits === 0) {
        Notify.info(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }

      const pages = Math.ceil(res.data.totalHits / per_page);
      if (pages <= page) {
        Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
        refs.loadMoreBtn.disabled = true;
        refs.btnSpinner.classList.add('is-hidden');
        refs.btnLabel.textContent = 'Load More';
        return res.data.hits;
      }

      if (page === 1) {
        Notify.success(`Hooray! We found ${res.data.totalHits} images.`);
      }

      page += 1;
      refs.mainSpinner.classList.add('is-hidden');
      refs.loadMoreBtn.classList.remove('is-hidden');
      refs.loadMoreBtn.disabled = false;
      refs.btnSpinner.classList.add('is-hidden');
      refs.btnLabel.textContent = 'Load More';
      return res.data.hits;
    });

    return queryResult;
  } catch (error) {
    console.log('error :>> ', error);
  }
}

function markupQueryResult(data) {
  return data
    .map(
      ({
        tags,
        webformatURL,
        likes,
        views,
        comments,
        downloads,
        largeImageURL,
      }) => {
        return `<a href="${largeImageURL}">
                  <div class="photo-card">
                    <img src="${webformatURL}" alt="${tags}" loading="lazy" height="200px"  style="width: fit-content;" />
                    <div class="info" height="200px">
                      <p class="info-item">
                        <b>Likes: ${likes}</b>
                      </p>
                      <p class="info-item">
                        <b>Views: ${views}</b>
                      </p>
                      <p class="info-item">
                        <b>Conments: ${comments}</b>
                      </p>
                      <p class="info-item">
                        <b>Downloads: ${downloads}</b>
                      </p>
                    </div>
                  </div>
                </a>`;
      }
    )
    .join('');
}
