document.querySelector('.info_icon').addEventListener('click',(e)=>{
    document.querySelector('.comprehensive').classList.remove('hide');
})

document.querySelector('.btn-close').addEventListener('click',(e)=>{
    document.querySelector('.comprehensive').classList.add('hide');
})

