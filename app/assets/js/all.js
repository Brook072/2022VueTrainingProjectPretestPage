const loginStatus = localStorage.getItem('loginToken')
const loginInputNode = document.querySelector('#loginInput');
const registerInputNode = document.querySelector('#registerInput');
const loginFuncNode = document.querySelector('#loginFunc');
const userFuncNode = document.querySelector('#userFunc');
const attractionListNode = document.querySelector('#attractionList');
const attractionTableNode = document.querySelector('#attractionTable');
const attractionCreateNode = document.querySelector('#attractionCreate')
const attractionEditNode = document.querySelector('#attractionEdit')
const personalFavoriteListNode = document.querySelector('#personalFavoriteList');
const apiUrl = "https://2022-vue-training-project-pretest-server.vercel.app"
// 'http://localhost:3000'

let attractionList = []
let filteredList = []
let favoriteList = []

function init(){
  if(loginStatus != null){
    let userName = localStorage.getItem('userName')
    document.querySelector('#userName').innerHTML = `歡迎回來!${userName}`
    loginFuncNode.className = "d-none"
    userFuncNode.className = "d-flex align-items-center"
  }else{
    loginFuncNode.className = "d-flex"
    userFuncNode.className = "d-none"
  }
  if(localStorage.getItem('userAuth') === 'user') document.querySelector('#adminBtn').className = 'btn btn-primary me-2 d-none'
  if(window.location.pathname === "/2022VueTrainingProjectPretestPage/attraction.html"){
    attractionContentRender();
  } else if(window.location.pathname === "/2022VueTrainingProjectPretestPage/") { 
    attractionListGet()
    if(loginStatus != null )favoriteGet()
  } else if(window.location.pathname === "/2022VueTrainingProjectPretestPage/personalFavoriteList.html"){
    favoriteGet()
  } else if(window.location.pathname === "/2022VueTrainingProjectPretestPage/admin.html"){
    attractionListGet()
  } else if(window.location.pathname === "/2022VueTrainingProjectPretestPage/attractionEdit.html"){
    attractionEditDataGet()
  } else if(window.location.pathname === "/2022VueTrainingProjectPretestPage/login.html" && loginStatus != null){
    window.location.href = '/2022VueTrainingProjectPretestPage/'
  } else if(window.location.pathname === "/2022VueTrainingProjectPretestPage/admin.html" && loginStatus != null){
    window.location.href = '/2022VueTrainingProjectPretestPage/'
  }
}

function signupPost(){
  axios({
    method: 'post',
    url: `${apiUrl}/users`,
    data: {
      email:registerInputNode[0].value,
      password:registerInputNode[1].value,
      name: registerInputNode[2].value,
      auth: "user"
    }
  }).then((res)=>{
    if(res.status === 201) alert(`註冊成功！歡迎${res.data.user.name}加入本網站！`)
    localStorage.setItem('loginToken', res.data.accessToken);
    localStorage.setItem('userName', res.data.user.name);
    localStorage.setItem('userEmail', res.data.user.email);
    localStorage.setItem('userID', res.data.user.id);
    localStorage.setItem('userAuth', res.data.user.auth);
    axios({
      method: 'post',
      url: `${apiUrl}/favorite/${res.data.user.id}`,
      headers:{
        authorization: res.data.accessToken,
      },
      data:{
        favoriteItem:[]
      }
    })
    window.location.href = 'https://brook072.github.io/2022VueTrainingProjectPretestPage/'
  });
}

function signinPost(){
  axios({
    method: 'post',
    url: `${apiUrl}/signin`,
    data: {
      email:loginInputNode[0].value,
      password:loginInputNode[1].value
    }
  }).then((res)=>{
    if(res.status === 200) alert(`歡迎回來！ ${res.data.user.name}！`)
    localStorage.setItem('loginToken', res.data.accessToken);
    localStorage.setItem('userName', res.data.user.name);
    localStorage.setItem('userEmail', res.data.user.email);
    localStorage.setItem('userID', res.data.user.id);
    localStorage.setItem('userAuth', res.data.user.auth);
    if(res.data.user.auth === "user") window.location.href = 'https://brook072.github.io/2022VueTrainingProjectPretestPage/'
    if(res.data.user.auth === "admin") window.location.href = 'https://brook072.github.io/2022VueTrainingProjectPretestPage/admin.html'
  }).catch((err)=>{
    console.log(err)
    if(err.response.data === 'Cannot find user') alert('此電子郵件尚未註冊！')
    if(err.response.data === 'Incorrect password') alert('密碼錯誤，請重新輸入！')
  });
}

function signout(){
  localStorage.removeItem('loginToken');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userID');
  localStorage.removeItem('userAuth');
  window.location.reload();
}

function attractionListGet(){
  axios({
    method: 'get',
    url: `${apiUrl}/attractions`,
  }).then((res)=>{
    attractionList = res.data;
    attractionListRender();
  })
}

function attractionListRender(category){
  if(category === undefined) filteredList = attractionList;
  if(window.location.pathname === '/2022VueTrainingProjectPretestPage/'){
    attractionListNode.innerHTML = ''
    filteredList.forEach((item)=>{
      attractionListNode.innerHTML += `
      <div class="col">
        <div class="card mx-2 text-decoration-none text-dark">
          <a https://brook072.github.io/2022VueTrainingProjectPretestPage/attraction.html?id=${item.id}">
            <img class="card-img-top" style="height: 200px" src="${item.pictureUrl}" alt="Card image cap">
          </a>
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <h4 class="card-title">${item.title}</h4>
              <i class="fas fa-heart text-dark" data-id="attraction-${item.id}" onclick="favoritePut('${item.id}')"></i>
            </div>
            <p class="card-text">${item.area}</p>
            <p class="card-text text-truncate">${item.description}</p>
          </div>
        </div>
      </div>
      `
    })
  }else if(window.location.pathname === '/2022VueTrainingProjectPretestPage/admin.html'){
    attractionTableNode.innerHTML = ''
    filteredList.forEach((item)=>{
      attractionTableNode.innerHTML += `
        <td scope="row">${item.id}</td>
        <td>${item.title}</td>
        <td>${item.description}</td>
        <td>
          <a class="btn btn-info mb-2" href="https://brook072.github.io/2022VueTrainingProjectPretestPage/attractionEdit.html?id=${item.id}">
            <span class="me-1">編輯</span>
            <i class="fas fa-edit"></i>
          </a>
          <button class="btn btn-danger" onclick="attractionDelete('${item.id}')">
            <span class="me-1">刪除</span>
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `
    })
  }
}



function attractionContentRender(){
  let qrtStr = window.location.search
  let attractionID = qrtStr.split('=')[1]
  axios({
    method: 'get',
    url: `${apiUrl}/attractions/${attractionID}`,
  }).then((res)=>{
    document.querySelector('#attractionContent').innerHTML += JSON.stringify(res.data)
  })
}

function favoriteGet(){
  let userID = localStorage.getItem('userID')
  let userToken = localStorage.getItem('loginToken')
  if(userID === null && window.location.pathname === "/2022VueTrainingProjectPretestPage/personalFavoriteList.html") window.location.href = 'https://brook072.github.io/2022VueTrainingProjectPretestPage/'
   axios({
    method: 'get',
    url: `${apiUrl}/favorite/${userID}`,
    headers:{
      authorization: userToken,
    },
  }).then((res)=>{
    favoriteList = res.data.favoriteItem
    if(window.location.pathname === "/2022VueTrainingProjectPretestPage/") favoriteRender()
    if(window.location.pathname === "/2022VueTrainingProjectPretestPage/personalFavoriteList.html") personalFavoriteListRender();
  })
}

function favoriteRender(){
  let allFavoriteNode = document.querySelectorAll(".text-danger")
  allFavoriteNode.forEach((item)=>{
    item.className = "fas fa-heart text-dark"
  })
  favoriteList.forEach((item)=>{
    let attractionNode = document.querySelector(`[data-id="attraction-${item}"]`)
    attractionNode.className = "fas fa-heart text-danger"
  })
}

function favoritePut(attractionID){
  if(loginStatus === null){
    alert('請先進行登入！')
    window.location.href = "https://brook072.github.io/2022VueTrainingProjectPretestPage/login.html"
  }else{
    let userID = localStorage.getItem('userID')
    let userToken = localStorage.getItem('loginToken')
    let attractionNode = document.querySelector(`[data-id="attraction-${attractionID}"]`)
    if(attractionNode.className === "fas fa-heart text-danger"){
      let idx = favoriteList.indexOf(attractionID);
      favoriteList.splice(idx, 1)
    }else if(attractionNode.className === "fas fa-heart text-dark"){
      favoriteList.push(attractionID)
    }
    axios({
      method: 'put',
      url: `${apiUrl}/favorite/${userID}`,
      headers:{
        authorization: userToken,
      },
      data: {
        favoriteItem: favoriteList
      }
    })
    favoriteRender()
    if(window.location.pathname === "/2022VueTrainingProjectPretestPage/personalFavoriteList.html") personalFavoriteListRender();
  }
}

function personalFavoriteListRender(){
  let favoriteData
  personalFavoriteListNode.innerHTML = '';
  favoriteList.forEach((item)=>{
    axios.get(`${apiUrl}/attractions/${item}`).then((res)=>{
      favoriteData = res.data
      personalFavoriteListNode.innerHTML += `
      <div class="col">
        <div class="card mx-2 text-decoration-none text-dark">
            <a href="https://brook072.github.io/2022VueTrainingProjectPretestPage/attraction.html?id=${favoriteData.id}">
              <img class="card-img-top" style="height: 200px" src="${favoriteData.pictureUrl}" alt="Card image cap">
            </a>
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <h4 class="card-title">${favoriteData.title}</h4>
                <i class="fas fa-heart text-danger" data-id="attraction-${favoriteData.id}" onclick="favoritePut('${favoriteData.id}')"></i>
              </div>
              <p class="card-text">${favoriteData.area}</p>
              <p class="card-text text-truncate">${favoriteData.description}</p>
            </div>
          </div>
      </div>
      `
    })
  })
  if(favoriteList.length === 0){
    personalFavoriteListNode.innerHTML = "<p class='fs-1'>目前無任何收藏之景點喔！</p>"
  }
}

function attractionCreatePost(){
  let userToken = localStorage.getItem('loginToken')
  axios({
    method: 'post',
    url: `${apiUrl}/attractions`,
    headers:{
      authorization: userToken,
    },
    data: {
      title: attractionCreateNode['attractionTitle'].value,
      area: attractionCreateNode['attractionArea'].value,
      description: attractionCreateNode['attractionDescription'].value,
      pictureUrl: attractionCreateNode['attractionPictureUrl'].value
    }
  }).then((res)=>{
    if( res.status === 201 )alert('新增成功！')
    window.location.href = 'https://brook072.github.io/2022VueTrainingProjectPretestPage/admin.html'
  })
}

function attractionDelete(attractionID){
  let userToken = localStorage.getItem('loginToken')
  let deleteConfirm = confirm(`將刪除${attractionID}號景點，您確定嗎？`)
  if(deleteConfirm){
    axios({
      method: 'delete',
      url: `${apiUrl}/attractions/${attractionID}`,
      headers:{
        authorization: userToken,
      }
    }).then((res)=>{
      if(res.status === 200) alert('刪除成功！')
      attractionListGet()
    })
  }else{
    return;
  }
}

function attractionEditDataGet(){
  let qryStr = window.location.search
  let editID = qryStr.split('=')[1]
  let userToken = localStorage.getItem('loginToken')
  axios({
    method: 'get',
    url: `${apiUrl}/attractions/${editID}`,
    headers:{
      authorization: userToken,
    }
  }).then((res)=>{
    attractionEditNode['attractionTitle'].value = res.data.title
    attractionEditNode['attractionArea'].value = res.data.area
    attractionEditNode['attractionDescription'].value = res.data.description
    attractionEditNode['attractionPictureUrl'].value = res.data.pictureUrl
  })
}

function attractionEditPut(){
  let qryStr = window.location.search
  let editID = qryStr.split('=')[1]
  let userToken = localStorage.getItem('loginToken')
  let editConfirm = confirm('您確定要進行變更嗎？')
  if(editConfirm){
    axios({
      method: 'put',
      url: `${apiUrl}/attractions/${editID}`,
      headers:{
        authorization: userToken,
      },
      data:{
        title: attractionEditNode['attractionTitle'].value,
        area: attractionEditNode['attractionArea'].value,
        description: attractionEditNode['attractionDescription'].value,
        pictureUrl: attractionEditNode['attractionPictureUrl'].value
      }
    }).then((res)=>{
      if(res.status === 200) alert('變更成功！')
      window.location.reload()
    })
  }
}


init();