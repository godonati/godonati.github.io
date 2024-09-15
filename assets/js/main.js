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

/* ===== PRODUCT TABS ===== */
function showTab(tabId) {
    // Hide all tab contents
    var tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(function(tab) {
        tab.style.display = 'none';
    });

    // Show the selected tab content
    document.getElementById(tabId).style.display = 'block';
}

// By default, show the Persona tab if it exists
if(document.getElementById('personaTab')) {
    document.getElementById('personaTab').style.display = 'block';
}

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