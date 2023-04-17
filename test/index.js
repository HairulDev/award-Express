
const axios = require('axios');

async function topArticles(limit = 2) {
    const BASE_URL = 'https://jsonmock.hackerrank.com/api/articles';
    const PAGE_SIZE = 100; // jumlah maksimum articles yang dikembalikan per halaman

    // Ambil jumlah total halaman dari halaman pertama respons
    const { data: { total_pages } } = await axios.get(`${BASE_URL}?page=${PAGE_SIZE}`);

    // Ambil semua halaman respons secara asinkron menggunakan Promise.all
    const pageRequests = [];
    for (let i = 1; i <= total_pages; i++) {
        pageRequests.push(axios.get(`${BASE_URL}?page=${i}`));
    }
    const responses = await Promise.all(pageRequests);

    // Mengekstrak informasi yang relevan dari setiap artikel dan menyaring judul kosong
    const articles = responses.flatMap(response => response.data.data)
        .map(({ title, story_title, num_comments }) => ({
            title: title ?? story_title, // / menggunakan story_title jika title adalah null
            num_comments,
        }))
        .filter(({ title }) => title !== null);

    // Urutkan artikel berdasarkan num_comments (menurun) dan title (menurun) jika ada story
    articles.sort((a, b) => {
        if (a.num_comments !== b.num_comments) {
            return b.num_comments - a.num_comments; // sort by num_comments first
        } else {
            return b.title.localeCompare(a.title); // then sort by title (alphabetically)
        }
    });

    // Mengembalikan daftar nama title batas atas
    const resArticles = articles.slice(0, limit).map(({ title }) => title).join('\n');
    console.log(resArticles);
    return resArticles;


}

topArticles()