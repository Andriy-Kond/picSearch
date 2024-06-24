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

const refs = {
  searchForm: document.querySelector('[id=search-form]'),
  inputInSearchForm: document.querySelector('[name="searchQuery"]'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
  btnLabel: document.querySelector('.label'),
  btnSpinner: document.querySelector('.btn-loader'),
  mainSpinner: document.querySelector('.main-loader'),
};

refs.searchForm.addEventListener('submit', requestProcessing);
refs.loadMoreBtn.addEventListener('click', requestProcessing);

async function requestProcessing(e) {
  const res = await fetchQuery(e);
  const markupGallery = markupQueryResult(res);
  refs.gallery.insertAdjacentHTML('beforeend', markupGallery);
}

async function fetchQuery(e) {
  e.preventDefault();
  const newQuery = refs.inputInSearchForm.value;
  if (query !== newQuery) {
    page = 1;
    query = newQuery;
    refs.gallery.innerHTML = '';
    refs.mainSpinner.classList.remove('is-hidden');
  }

  const url = `${BASE_URL}/?key=${BASE_KEY}&q=${newQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=3&page=${page}`;
  refs.loadMoreBtn.disabled = true;
  refs.btnLabel.textContent = 'Downloading...';
  refs.btnSpinner.classList.remove('is-hidden');

  try {
    const res = await axios.get(url).then(res => {
      if (res.data.hits.length === 0) {
        Notify.info(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }

      page += 1;
      refs.mainSpinner.classList.add('is-hidden');
      refs.loadMoreBtn.classList.remove('is-hidden');
      refs.btnSpinner.classList.add('is-hidden');
      refs.loadMoreBtn.disabled = false;
      refs.btnLabel.textContent = 'Load More';
      return res.data.hits;
    });

    return res;
  } catch (error) {
    console.log('error :>> ', error);
  }
}

function markupQueryResult(data) {
  return data.map(
    ({ tags, webformatURL, likes, views, comments, downloads }) => {
      return `<div class="photo-card">
    <img src="${webformatURL}" alt="${tags}" loading="lazy" />
    <div class="info">
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
  `;
    }
  );
}
