// Api key: mjWGNSSOiOjn2D99jTbQjhx4QLl1KnYJ

const api_key = "mjWGNSSOiOjn2D99jTbQjhx4QLl1KnYJ";

document.querySelector('#dropdown-button').onclick = function (e) {
    e.preventDefault();
    const dropdownMenu = document.querySelector('#dropdown-menu');
    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
};

document.onclick = function (e) {
    if (e.target === document.querySelector('body')) document.querySelector('#dropdown-menu').style.display = 'none';
};

window.onload = function() {
    fetchTrendingGifs();
    fetchRandomGifs();
};

function fetchTrendingGifs(limit = 20) {
    fetch(`http://api.giphy.com/v1/gifs/trending?api_key=${api_key}&limit=${limit}&rating=pg-13&offset=${Math.floor(Math.random()*300)}`)
        .then(response => response.json())
        .then(data => {
            console.log(data.data);
            data.data.forEach(gif => {
                let gifClass;
                gifClass = gif.images["480w_still"].width / gif.images["480w_still"].height >= 1.5 ? 'double' : '';
                trendGifContainer = document.querySelector(".trends-gifs-container");
                insertGifToDOM(trendGifContainer, gif, gifClass)
            });
        });
}

function fetchRandomGifs() {
    fetch(`http://api.giphy.com/v1/gifs/random?api_key=${api_key}`)
    .then(response => response.json())
    .then(data => {
        let gif = data.data;
        let suggestionsGifContainer = document.querySelector(".suggestions-gifs-container");
        insertGifToDOM(suggestionsGifContainer, gif);
    }).catch(error => {
        return error;
    });

}

function insertGifToDOM(domElement, gif, gifClass = '') {
    const newGifHTML = `<div class="gif-container ${gifClass}"> 
                    <img class="gif-element" src="${gif.images.original.url}"/>
                  </div>`;

    domElement.insertAdjacentHTML('beforeend', newGifHTML);
}

