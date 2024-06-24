// Pixabay API key: 34581261-d39fcdfb48adfd850ac44b9c1
// key - твій унікальний ключ доступу до API.
// q - термін для пошуку. Те, що буде вводити користувач.
// image_type - тип зображення. На потрібні тільки фотографії, тому постав значення photo.
// orientation - орієнтація фотографії. Постав значення horizontal.
// safesearch - фільтр за віком. Постав значення true.

// У відповіді буде масив зображень, що задовольнили критерії параметрів запиту. Кожне зображення описується об'єктом, з якого тобі цікаві тільки наступні властивості:

// webformatURL - посилання на маленьке зображення для списку карток.
// largeImageURL - посилання на велике зображення.
// tags - рядок з описом зображення. Підійде для атрибуту alt.
// likes - кількість лайків.
// views - кількість переглядів.
// comments - кількість коментарів.
// downloads - кількість завантажень.

// Описаний в документації
import SimpleLightbox from 'simplelightbox';
// Додатковий імпорт стилів
import 'simplelightbox/dist/simple-lightbox.min.css';

import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const BASE_URL = 'https://pixabay.com/api/';
const BASE_KEY = '34581261-d39fcdfb48adfd850ac44b9c1';

const refs = {
  searchForm: document.querySelector('[id=search-form]'),
  inputInSearchForm: document.querySelector('[name="searchQuery"]'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

refs.searchForm.addEventListener('submit', fetchQuery);

async function fetchQuery(e) {
  e.preventDefault();
  const query = refs.inputInSearchForm.value;

  const url = `${BASE_URL}/?key=${BASE_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&per_page=10`;

  await axios.get(url).then(res => {
    if (res.data.hits.length === 0) {
      Notify.info(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    const markupGallery = markupQueryResult(res.data.hits);
    refs.gallery.innerHTML = markupGallery;
  });
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
