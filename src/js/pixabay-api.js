export const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '40949285-b1cf37184329e1bc69caad7c2';

export const options = {
    params: {
        key: API_KEY,
        q: '',
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: 1,
        per_page: 40,
    },
};
