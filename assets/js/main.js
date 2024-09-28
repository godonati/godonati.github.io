/*===== MENU SHOW =====*/ 
const showMenu = (toggleId, navId) =>{
    const toggle = document.getElementById(toggleId),
    nav = document.getElementById(navId)

    if(toggle && nav){
        toggle.addEventListener('click', ()=>{
            nav.classList.toggle('show')
        })
    }
}
showMenu('nav-toggle','nav-menu')

/*==================== REMOVE MENU MOBILE ====================*/
const navLink = document.querySelectorAll('.nav__link')

function linkAction(){
    const navMenu = document.getElementById('nav-menu')
    // When we click on each nav__link, we remove the show-menu class
    navMenu.classList.remove('show')
}
navLink.forEach(n => n.addEventListener('click', linkAction))

/*==================== SCROLL SECTIONS ACTIVE LINK ====================*/
const sections = document.querySelectorAll('section[id]')

const scrollActive = () =>{
    const scrollDown = window.scrollY

  sections.forEach(current =>{
        const sectionHeight = current.offsetHeight,
              sectionTop = current.offsetTop - 58,
              sectionId = current.getAttribute('id'),
              sectionsClass = document.querySelector('.nav__menu a[href*=' + sectionId + ']')
        
        if(scrollDown > sectionTop && scrollDown <= sectionTop + sectionHeight){
            sectionsClass.classList.add('active-link')
        }else{
            sectionsClass.classList.remove('active-link')
        }                                                    
    })
}
window.addEventListener('scroll', scrollActive)

/*===== SCROLL REVEAL ANIMATION =====*/
const sr = ScrollReveal({
    origin: 'top',
    distance: '20px',
    duration: 500,
    delay: 10,
    reset: true
});

/* MAIN */
sr.reveal('.home__data, .about__img, .about__social, .skills__subtitle, .skills__text, .contact__social', {}); 
sr.reveal('.home__img, .about__subtitle, .about__text, .skills__img',{delay: 50}); 
sr.reveal('.home__social-icon, .about__social-icon, .contact__social-icon', { interval: 50});
sr.reveal('.skills__data, .work__img, .contact__input, .contact-schedule__button, .contact-message__button',{interval: 50});

/* PRODUCT */
sr.reveal('.product__data, .persona__img, .persona__social, .roadmap__subtitle, .roadmap__text, .contact__social', {}); 
sr.reveal('.product__img, .persona__subtitle, .persona__text, .roadmap__img',{delay: 50}); 
sr.reveal('.product__social-icon, .persona__social-icon, .contact__social-icon', { interval: 50});

sr.reveal('.roadmap__data, .requirements__img, .contact__input, .contact-schedule__button, .contact-message__button',{interval: 50});

//about buttons script//
const aboutButtons = document.querySelectorAll('.about button')
const aboutTitle1 = document.getElementById('whowAmItitle')
const aboutTitle2 = document.getElementById('howIworkTitle')
const aboutTitle3 = document.getElementById('myRoleTitle')
const aboutTitle4 = document.getElementById('questionsTitle')
const aboutText1 = document.getElementById('whoAmI')
const aboutText2 = document.getElementById('howIwork')
const aboutText3 = document.getElementById('myRole')
const aboutText4 = document.getElementById('questions')
console.log(aboutTitle1)
aboutButtons[0].addEventListener('click',(e)=>{
    setTimeout(()=>{
        aboutTitle1.classList.remove('hideText')
        aboutText1.classList.remove('hideText')
    },400)
    aboutTitle2.classList.add('hideText')
    aboutText2.classList.add('hideText')
    aboutTitle3.classList.add('hideText')
    aboutText3.classList.add('hideText')
    aboutButtons[0].style.backgroundColor = '#7fa1ff'
    aboutButtons[1].style.backgroundColor = '#3E6FF4'
    aboutButtons[2].style.backgroundColor = '#3E6FF4'
    aboutButtons[3].style.backgroundColor = '#3E6FF4'
    e.stopPropagation()
})
aboutButtons[1].addEventListener('click',(e)=>{
    setTimeout(()=>{
        aboutText2.classList.remove('hideText')
        aboutTitle2.classList.remove('hideText')
    },400)
    aboutTitle1.classList.add('hideText')
    aboutText1.classList.add('hideText')
    aboutTitle3.classList.add('hideText')
    aboutText3.classList.add('hideText')
    aboutText4.classList.add('hideText')
    aboutTitle4.classList.add('hideText')
    aboutButtons[1].style.backgroundColor = '#7fa1ff'
    aboutButtons[2].style.backgroundColor = '#3E6FF4'
    aboutButtons[3].style.backgroundColor = '#3E6FF4'
    aboutButtons[0].style.backgroundColor = '#3E6FF4'
    e.stopPropagation()
})
aboutButtons[2].addEventListener('click',(e)=>{
    setTimeout(()=>{
        aboutText3.classList.remove('hideText')
        aboutTitle3.classList.remove('hideText')
    },400)
    aboutTitle2.classList.add('hideText')
    aboutText2.classList.add('hideText')
    aboutTitle1.classList.add('hideText')
    aboutText1.classList.add('hideText')
    aboutText4.classList.add('hideText')
    aboutTitle4.classList.add('hideText')
    aboutButtons[2].style.backgroundColor = '#7fa1ff'
    aboutButtons[0].style.backgroundColor = '#3E6FF4'
    aboutButtons[1].style.backgroundColor = '#3E6FF4'
    aboutButtons[3].style.backgroundColor = '#3E6FF4'
    e.stopPropagation()
})
aboutButtons[3].addEventListener('click',(e)=>{
    setTimeout(()=>{
        aboutText4.classList.remove('hideText')
        aboutTitle4.classList.remove('hideText')
    },400)
    aboutTitle1.classList.add('hideText')
    aboutText1.classList.add('hideText')
    aboutTitle2.classList.add('hideText')
    aboutText2.classList.add('hideText')
    aboutTitle3.classList.add('hideText')
    aboutText3.classList.add('hideText')
    aboutButtons[3].style.backgroundColor = '#7fa1ff'
    aboutButtons[1].style.backgroundColor = '#3E6FF4'
    aboutButtons[2].style.backgroundColor = '#3E6FF4'
    aboutButtons[0].style.backgroundColor = '#3E6FF4'
    e.stopPropagation()
})
