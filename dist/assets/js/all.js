"use strict";

var loginStatus = localStorage.getItem('loginToken');
var loginInputNode = document.querySelector('#loginInput');
var registerInputNode = document.querySelector('#registerInput');
var loginFuncNode = document.querySelector('#loginFunc');
var userFuncNode = document.querySelector('#userFunc');
var attractionListNode = document.querySelector('#attractionList');
var attractionTableNode = document.querySelector('#attractionTable');
var attractionCreateNode = document.querySelector('#attractionCreate');
var attractionEditNode = document.querySelector('#attractionEdit');
var personalFavoriteListNode = document.querySelector('#personalFavoriteList');
var apiUrl = "https://2022-vue-training-project-pretest-server.vercel.app"; // 'http://localhost:3000'

var attractionList = [];
var filteredList = [];
var favoriteList = [];

function init() {
  if (loginStatus != null) {
    var userName = localStorage.getItem('userName');
    document.querySelector('#userName').innerHTML = "\u6B61\u8FCE\u56DE\u4F86!".concat(userName);
    loginFuncNode.className = "d-none";
    userFuncNode.className = "d-flex align-items-center";
  } else {
    loginFuncNode.className = "d-flex";
    userFuncNode.className = "d-none";
  }

  if (localStorage.getItem('userAuth') === 'user') document.querySelector('#adminBtn').className = 'btn btn-primary me-2 d-none';

  if (window.location.pathname === "/2022VueTrainingProjectPretestPage/attraction.html") {
    attractionContentRender();
  } else if (window.location.pathname === "/") {
    attractionListGet();
    if (loginStatus != null) favoriteGet();
  } else if (window.location.pathname === "/2022VueTrainingProjectPretestPage/personalFavoriteList.html") {
    favoriteGet();
  } else if (window.location.pathname === "/2022VueTrainingProjectPretestPage/admin.html") {
    attractionListGet();
  } else if (window.location.pathname === "/2022VueTrainingProjectPretestPage/attractionEdit.html") {
    attractionEditDataGet();
  }
}

function signupPost() {
  axios({
    method: 'post',
    url: "".concat(apiUrl, "/users"),
    data: {
      email: registerInputNode[0].value,
      password: registerInputNode[1].value,
      name: registerInputNode[2].value,
      auth: "user"
    }
  }).then(function (res) {
    if (res.status === 201) alert("\u8A3B\u518A\u6210\u529F\uFF01\u6B61\u8FCE".concat(res.data.user.name, "\u52A0\u5165\u672C\u7DB2\u7AD9\uFF01"));
    localStorage.setItem('loginToken', res.data.accessToken);
    localStorage.setItem('userName', res.data.user.name);
    localStorage.setItem('userEmail', res.data.user.email);
    localStorage.setItem('userID', res.data.user.id);
    localStorage.setItem('userAuth', res.data.user.auth);
    axios({
      method: 'post',
      url: "".concat(apiUrl, "/favorite/").concat(res.data.user.id),
      headers: {
        authorization: res.data.accessToken
      },
      data: {
        favoriteItem: []
      }
    });
    window.location.href = 'https://brook072.github.io/2022VueTrainingProjectPretestPage/';
  });
}

function signinPost() {
  axios({
    method: 'post',
    url: "".concat(apiUrl, "/signin"),
    data: {
      email: loginInputNode[0].value,
      password: loginInputNode[1].value
    }
  }).then(function (res) {
    if (res.status === 200) alert("\u6B61\u8FCE\u56DE\u4F86\uFF01 ".concat(res.data.user.name, "\uFF01"));
    localStorage.setItem('loginToken', res.data.accessToken);
    localStorage.setItem('userName', res.data.user.name);
    localStorage.setItem('userEmail', res.data.user.email);
    localStorage.setItem('userID', res.data.user.id);
    localStorage.setItem('userAuth', res.data.user.auth);
    if (res.data.user.auth === "user") window.location.href = 'https://brook072.github.io/2022VueTrainingProjectPretestPage/';
    if (res.data.user.auth === "admin") window.location.href = 'https://brook072.github.io/2022VueTrainingProjectPretestPage/admin.html';
  })["catch"](function (err) {
    console.log(err);
    if (err.response.data === 'Cannot find user') alert('此電子郵件尚未註冊！');
    if (err.response.data === 'Incorrect password') alert('密碼錯誤，請重新輸入！');
  });
}

function signout() {
  localStorage.removeItem('loginToken');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userID');
  localStorage.removeItem('userAuth');
  window.location.reload();
}

function attractionListGet() {
  axios({
    method: 'get',
    url: "".concat(apiUrl, "/attractions")
  }).then(function (res) {
    attractionList = res.data;
    attractionListRender();
  });
}

function attractionListRender(category) {
  if (category === undefined) filteredList = attractionList;

  if (window.location.pathname === '/2022VueTrainingProjectPretestPage/') {
    attractionListNode.innerHTML = '';
    filteredList.forEach(function (item) {
      attractionListNode.innerHTML += "\n      <div class=\"col\">\n        <div class=\"card mx-2 text-decoration-none text-dark\">\n          <a https://brook072.github.io/2022VueTrainingProjectPretestPage/attraction.html?id=".concat(item.id, "\">\n            <img class=\"card-img-top\" style=\"height: 200px\" src=\"").concat(item.pictureUrl, "\" alt=\"Card image cap\">\n          </a>\n          <div class=\"card-body\">\n            <div class=\"d-flex justify-content-between\">\n              <h4 class=\"card-title\">").concat(item.title, "</h4>\n              <i class=\"fas fa-heart text-dark\" data-id=\"attraction-").concat(item.id, "\" onclick=\"favoritePut('").concat(item.id, "')\"></i>\n            </div>\n            <p class=\"card-text\">").concat(item.area, "</p>\n            <p class=\"card-text text-truncate\">").concat(item.description, "</p>\n          </div>\n        </div>\n      </div>\n      ");
    });
  } else if (window.location.pathname === '/2022VueTrainingProjectPretestPage/admin.html') {
    attractionTableNode.innerHTML = '';
    filteredList.forEach(function (item) {
      attractionTableNode.innerHTML += "\n        <td scope=\"row\">".concat(item.id, "</td>\n        <td>").concat(item.title, "</td>\n        <td>").concat(item.description, "</td>\n        <td>\n          <a class=\"btn btn-info mb-2\" href=\"https://brook072.github.io/2022VueTrainingProjectPretestPage/attractionEdit.html?id=").concat(item.id, "\">\n            <span class=\"me-1\">\u7DE8\u8F2F</span>\n            <i class=\"fas fa-edit\"></i>\n          </a>\n          <button class=\"btn btn-danger\" onclick=\"attractionDelete('").concat(item.id, "')\">\n            <span class=\"me-1\">\u522A\u9664</span>\n            <i class=\"fas fa-trash-alt\"></i>\n          </button>\n        </td>\n      ");
    });
  }
}

function attractionContentRender() {
  var qrtStr = window.location.search;
  var attractionID = qrtStr.split('=')[1];
  axios({
    method: 'get',
    url: "".concat(apiUrl, "/attractions/").concat(attractionID)
  }).then(function (res) {
    document.querySelector('#attractionContent').innerHTML += JSON.stringify(res.data);
  });
}

function favoriteGet() {
  var userID = localStorage.getItem('userID');
  var userToken = localStorage.getItem('loginToken');
  if (userID === null && window.location.pathname === "/2022VueTrainingProjectPretestPage/personalFavoriteList.html") window.location.href = 'https://brook072.github.io/2022VueTrainingProjectPretestPage/';
  axios({
    method: 'get',
    url: "".concat(apiUrl, "/favorite/").concat(userID),
    headers: {
      authorization: userToken
    }
  }).then(function (res) {
    favoriteList = res.data.favoriteItem;
    if (window.location.pathname === "/2022VueTrainingProjectPretestPage/") favoriteRender();
    if (window.location.pathname === "/2022VueTrainingProjectPretestPage/personalFavoriteList.html") personalFavoriteListRender();
  });
}

function favoriteRender() {
  var allFavoriteNode = document.querySelectorAll(".text-danger");
  allFavoriteNode.forEach(function (item) {
    item.className = "fas fa-heart text-dark";
  });
  favoriteList.forEach(function (item) {
    var attractionNode = document.querySelector("[data-id=\"attraction-".concat(item, "\"]"));
    attractionNode.className = "fas fa-heart text-danger";
  });
}

function favoritePut(attractionID) {
  if (loginStatus === null) {
    alert('請先進行登入！');
    window.location.href = "https://brook072.github.io/2022VueTrainingProjectPretestPage/login.html";
  } else {
    var userID = localStorage.getItem('userID');
    var userToken = localStorage.getItem('loginToken');
    var attractionNode = document.querySelector("[data-id=\"attraction-".concat(attractionID, "\"]"));

    if (attractionNode.className === "fas fa-heart text-danger") {
      var idx = favoriteList.indexOf(attractionID);
      favoriteList.splice(idx, 1);
    } else if (attractionNode.className === "fas fa-heart text-dark") {
      favoriteList.push(attractionID);
    }

    axios({
      method: 'put',
      url: "".concat(apiUrl, "/favorite/").concat(userID),
      headers: {
        authorization: userToken
      },
      data: {
        favoriteItem: favoriteList
      }
    });
    favoriteRender();
    if (window.location.pathname === "/2022VueTrainingProjectPretestPage/personalFavoriteList.html") personalFavoriteListRender();
  }
}

function personalFavoriteListRender() {
  var favoriteData;
  personalFavoriteListNode.innerHTML = '';
  favoriteList.forEach(function (item) {
    axios.get("".concat(apiUrl, "/attractions/").concat(item)).then(function (res) {
      favoriteData = res.data;
      personalFavoriteListNode.innerHTML += "\n      <div class=\"col\">\n        <div class=\"card mx-2 text-decoration-none text-dark\">\n            <a href=\"https://brook072.github.io/2022VueTrainingProjectPretestPage/attraction.html?id=".concat(favoriteData.id, "\">\n              <img class=\"card-img-top\" style=\"height: 200px\" src=\"").concat(favoriteData.pictureUrl, "\" alt=\"Card image cap\">\n            </a>\n            <div class=\"card-body\">\n              <div class=\"d-flex justify-content-between\">\n                <h4 class=\"card-title\">").concat(favoriteData.title, "</h4>\n                <i class=\"fas fa-heart text-danger\" data-id=\"attraction-").concat(favoriteData.id, "\" onclick=\"favoritePut('").concat(favoriteData.id, "')\"></i>\n              </div>\n              <p class=\"card-text\">").concat(favoriteData.area, "</p>\n              <p class=\"card-text text-truncate\">").concat(favoriteData.description, "</p>\n            </div>\n          </div>\n      </div>\n      ");
    });
  });

  if (favoriteList.length === 0) {
    personalFavoriteListNode.innerHTML = "<p class='fs-1'>目前無任何收藏之景點喔！</p>";
  }
}

function attractionCreatePost() {
  var userToken = localStorage.getItem('loginToken');
  axios({
    method: 'post',
    url: "".concat(apiUrl, "/attractions"),
    headers: {
      authorization: userToken
    },
    data: {
      title: attractionCreateNode['attractionTitle'].value,
      area: attractionCreateNode['attractionArea'].value,
      description: attractionCreateNode['attractionDescription'].value,
      pictureUrl: attractionCreateNode['attractionPictureUrl'].value
    }
  }).then(function (res) {
    if (res.status === 201) alert('新增成功！');
    window.location.href = 'https://brook072.github.io/2022VueTrainingProjectPretestPage/admin.html';
  });
}

function attractionDelete(attractionID) {
  var userToken = localStorage.getItem('loginToken');
  var deleteConfirm = confirm("\u5C07\u522A\u9664".concat(attractionID, "\u865F\u666F\u9EDE\uFF0C\u60A8\u78BA\u5B9A\u55CE\uFF1F"));

  if (deleteConfirm) {
    axios({
      method: 'delete',
      url: "".concat(apiUrl, "/attractions/").concat(attractionID),
      headers: {
        authorization: userToken
      }
    }).then(function (res) {
      if (res.status === 200) alert('刪除成功！');
      attractionListGet();
    });
  } else {
    return;
  }
}

function attractionEditDataGet() {
  var qryStr = window.location.search;
  var editID = qryStr.split('=')[1];
  var userToken = localStorage.getItem('loginToken');
  axios({
    method: 'get',
    url: "".concat(apiUrl, "/attractions/").concat(editID),
    headers: {
      authorization: userToken
    }
  }).then(function (res) {
    attractionEditNode['attractionTitle'].value = res.data.title;
    attractionEditNode['attractionArea'].value = res.data.area;
    attractionEditNode['attractionDescription'].value = res.data.description;
    attractionEditNode['attractionPictureUrl'].value = res.data.pictureUrl;
  });
}

function attractionEditPut() {
  var qryStr = window.location.search;
  var editID = qryStr.split('=')[1];
  var userToken = localStorage.getItem('loginToken');
  var editConfirm = confirm('您確定要進行變更嗎？');

  if (editConfirm) {
    axios({
      method: 'put',
      url: "".concat(apiUrl, "/attractions/").concat(editID),
      headers: {
        authorization: userToken
      },
      data: {
        title: attractionEditNode['attractionTitle'].value,
        area: attractionEditNode['attractionArea'].value,
        description: attractionEditNode['attractionDescription'].value,
        pictureUrl: attractionEditNode['attractionPictureUrl'].value
      }
    }).then(function (res) {
      if (res.status === 200) alert('變更成功！');
      window.location.reload();
    });
  }
}

init();
//# sourceMappingURL=all.js.map
