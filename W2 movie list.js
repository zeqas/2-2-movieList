const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

let favoriteMovies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

const movies = []
let filteredMovies = []
let searchedMovies = []

const navBar = document.querySelector('#nav-bar')
const dataPanel = document.querySelector('#data-Panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
// Add Change-Mode Listener
const changeMode = document.querySelector('#change-mode')
// Default Page is 1
let thePage = 1
// Default mode is 'card'
let mode = 'card'


axios
  .get(INDEX_URL)
  .then(response => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    displayDataList()
  })
  .catch(err => {
    console.log(err)
  })

// Card Mode

function renderMovie_Card(data) {
  let rawHTML = ''
  data.forEach((item) => {
    // title, image
    rawHTML += `
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${POSTER_URL + item.image}" class="card-img-top" alt="...">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">Favorite</button>
          </div>
        </div>
      </div>
    </div>
    `
  });
  dataPanel.innerHTML = rawHTML
}

function renderMovie_List(data) {
  let rawHTML = ''
  rawHTML += '<table class="table"><tbody>'
  data.forEach(item => {
    rawHTML += `
        <tr>
          <td>
              <h5 class="card-title">${item.title}</h5>
          </td>
          <td>
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">Favorite</button>
          </td>
        </tr>
    `
  })
  rawHTML += '</tbody></table>'
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)  // 分頁數量
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}


function getMoviesByPage(page, filteredTypeOfMovies) { // 切出指定分頁頁數內容
  const data = filteredTypeOfMovies.length ? filteredTypeOfMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {  //顯示電影資訊
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then(response => {
    // response.data.results
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date:' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="This is a movie poster" class="img-fluid">`
  })
}

// Add To Favorite
function addToFavorite(id) {
  favoriteMovies = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const foundMovie = movies.find(movie => movie.id === id)
  console.log(favoriteMovies)
  if (favoriteMovies.some(movie => movie.id === id)) {
    return alert('此電影已在收藏清單中!')
  }

  favoriteMovies.push(foundMovie)
  localStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies))
  alert('成功加入清單!')
}


dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) { // 顯示資訊
    showMovieModal(Number(event.target.dataset.id)) // 尋找ID
  } else if (event.target.matches('.btn-add-favorite')) { // 加入最愛
    addToFavorite(Number(event.target.dataset.id))
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  searchedMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword)) // 搜尋到的電影物件

  if (searchedMovies.length === 0) { // 找不到電影
    return alert('Movie can not be found with keyword : ' + keyword)
  }

  renderPaginator(searchedMovies.length)
  thePage = 1
  displayDataList()

})


paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return

  thePage = Number(event.target.dataset.page)
  displayDataList()
})

// 以下為 A11 新增 

// Change Mode
changeMode.addEventListener('click', function onChangeModeClicked(event) {
  if (event.target.matches('#cardMode')) {
    mode = 'card'
  } else if (event.target.matches('#listMode')) {
    mode = 'list'
  }
  displayDataList()
})

// Render Card || List mode
function displayDataList() {

  const movieList = getMoviesByPage(thePage, searchedMovies === [] ? movies : searchedMovies)　// 取得目前頁數(確認目前的電影是否過濾)
  mode === 'card' ? renderMovie_Card(movieList) : renderMovie_List(movieList)
}

// 新增 按Home或Favorite都可以回復原始狀態
navBar.addEventListener('click', function onNavbarClicked(event) {
  if (event.target.matches('.nav-link')) {
    renderPaginator(movies.length)
    displayDataList()
  }
})


