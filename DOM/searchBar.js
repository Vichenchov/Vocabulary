// getting all required elements
const searchWrapper = document.querySelector(".search-input");
const inputBox = searchWrapper.querySelector("input");
const suggBox = searchWrapper.querySelector(".autocom-box");
const icon = searchWrapper.querySelector(".icon");
let linkTag = searchWrapper.querySelector("a");
let webLink;
let rows = document.getElementsByClassName('trow');

var suggestions;

ipcRenderer.on('dataSearch', (e, data) => {
    console.log(data);
    suggestions = data;
})

// if user press any key and release
inputBox.onkeyup = (e) => {
    let userData = e.target.value; //user enetered data
    console.log(e.target.value);
    let emptyArray = [];
    if (userData) {
        emptyArray = suggestions.filter((data) => {
            //filtering array value and user characters to lowercase and return only those words which are start with user enetered chars
            return data.toLocaleLowerCase().startsWith(userData.toLocaleLowerCase());
        });
        emptyArray = emptyArray.map((data) => {
            return data = `${data}`;
        });
        searchWrapper.classList.remove("active");
        console.log(emptyArray);
        showSuggestions(emptyArray);
        let allList = suggBox.querySelectorAll("li");
    } else {
        searchWrapper.classList.remove("active");
        for (let i = 0; i < suggestions.length; i++) {
            const element = rows[i];
            console.log(element);
            element.classList.remove('show');
        }
    }
}

function select(element) {
    let selectData = element.textContent;
    inputBox.value = selectData;
    searchWrapper.classList.remove("active");
}

function showSuggestions(list) {
    let listData;
    if (!list.length) {
        searchWrapper.classList.add("active");
        suggBox.innerHTML = `<li>${'No word was found'}</li>`;
    } else {
        for (let i = 0; i < rows.length; i++) {
            const element = rows[i];
            if (!list.includes(element.attributes.value.value)) {
                element.classList.add('show');
            } else {
                element.classList.remove('show');
            }
        }
    }
}