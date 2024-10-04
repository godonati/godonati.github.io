const personaHeader = document.getElementById('persona')

const session_2 = document.getElementById('logo')
const initSession_2 = new IntersectionObserver((init)=>{
    if(init[0].isIntersecting==false){
        personaHeader.classList.add('active-link')
    } else{personaHeader.classList.remove('active-link')}
})
initSession_2.observe(session_2)

const demographic = document.querySelector('.demographic')
const nameSection = document.getElementById('name')
const backGroundSession = document.getElementById('background')
const painPoints = document.getElementById('painPoints')
const allButtons = document.querySelectorAll(".persona_button")
console.log(allButtons)
allButtons[0].addEventListener('click',()=>{
    allButtons[0].style.backgroundColor='#83a4ff'

}
)


allButtons[0].click()

allButtons[0].addEventListener('click',()=>{
    allButtons[0].style.backgroundColor='#83a4ff'
    allButtons[0].style.color='#3E6FF4'
    demographic.classList.add('hide')
    backGroundSession.classList.add('hide')
    nameSection.classList.remove('hide')
    for(var i=0;i<7;i++){
        if(i!=0)
        allButtons[i].style.backgroundColor='#3E6FF4';
        allButtons[i].style.color='white'
        
    }

})
allButtons[1].addEventListener('click',()=>{
    allButtons[1].style.backgroundColor='#83a4ff'
    demographic.classList.remove('hide')
    backGroundSession.classList.add('hide')
    nameSection.classList.add('hide')
    
    for(var i=0;i<7;i++){
        if(i!=1)
        allButtons[i].style.backgroundColor='#3E6FF4'
        allButtons[i].style.color='white'
    }

})
allButtons[2].addEventListener('click',()=>{
    allButtons[2].style.backgroundColor='#83a4ff'
    allButtons[2].style.color='#3E6FF4'
    demographic.classList.add('hide')
    nameSection.classList.add('hide')
    backGroundSession.classList.remove("hide")
    for(var i=0;i<7;i++){
        if(i!=2)
        allButtons[i].style.backgroundColor='#3E6FF4'
        allButtons[i].style.color='white'
    }

})
allButtons[3].addEventListener('click',()=>{
    allButtons[3].style.backgroundColor='#83a4ff'
    demographic.classList.toggle('hide')
    for(var i=0;i<7;i++){
        if(i!=3)
        allButtons[i].style.backgroundColor='#83a4ff'
        allButtons[i].style.color='white'
    }

})
allButtons[3].addEventListener('click',()=>{
    allButtons[3].style.backgroundColor='#83a4ff'
    allButtons[3].style.color='#3E6FF4'
    demographic.classList.add('hide')
    nameSection.classList.add('hide')
    backGroundSession.classList.add("hide")
    painPoints.classList.remove('hide')
    for(var i=0;i<7;i++){
        if(i!=3)
        allButtons[i].style.backgroundColor='#3E6FF4'
        allButtons[i].style.color='white'
    }

})
allButtons[4].addEventListener('click',()=>{
    allButtons[4].style.backgroundColor='#83a4ff'
    demographic.classList.add('hide')
   
    for(var i=0;i<7;i++){
        if(i!=4)
        allButtons[i].style.backgroundColor='#3E6FF4'
        allButtons[i].style.color='white'
    }

})
allButtons[5].addEventListener('click',()=>{
    allButtons[5].style.backgroundColor='#83a4ff'
    demographic.classList.add('hide')
    for(var i=0;i<7;i++){
        if(i!=5)
        allButtons[i].style.backgroundColor='#3E6FF4'
        allButtons[i].style.color='white'
    }

})
allButtons[6].addEventListener('click',()=>{
    allButtons[6].style.backgroundColor='#83a4ff'
    demographic.classList.add('hide')
    for(var i=0;i<7;i++){
        if(i!=6)
        allButtons[i].style.backgroundColor='#3E6FF4'
        allButtons[i].style.color='white'
    }

})
const persona = document.getElementsByClassName('persona_section')[0]


const session2 = document.getElementById('logo')
const initSession2 = new IntersectionObserver((init)=>{
    if(init[0].isIntersecting==false){
        alert('session2')
    }else ()=>{alert('oi')}
})
