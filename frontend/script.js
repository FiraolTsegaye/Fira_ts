document.addEventListener('DOMContentLoaded', async () => {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    const scrollTopBtn = document.getElementById('scrollToTop');
    const yearSpan = document.getElementById('year');
    const contactForm = document.querySelector('.contact-form');

    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for your message! I will get back to you soon.');
            contactForm.reset();
        });
    }

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            const icon = mobileToggle.querySelector('.material-icons');
            if (icon) {
                icon.textContent = navMenu.classList.contains('open') ? 'close' : 'menu';
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                const icon = mobileToggle.querySelector('.material-icons');
                if (icon) {
                    icon.textContent = 'menu';
                }
            });
        });
    }

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = window.scrollY + 200;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });

        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));

    try {
        const response = await fetch('/api/portfolio');
        const data = await response.json();

        if (data.name) {
            document.querySelector('.hero-title').textContent = data.name;
            const copyrightText = document.querySelector('.footer-content p');
            if (copyrightText) {
                copyrightText.innerHTML = `${data.name} &copy; <span id="year">${new Date().getFullYear()}</span>`;
            }
        }

        if (data.hero_text) {
            document.querySelector('.hero-description').textContent = data.hero_text;
        }

        if (data.about_me) {
            const aboutText = document.querySelector('.about-text');
            if (aboutText) {
                aboutText.innerHTML = `<p>${data.about_me}</p>`;
            }
        }

        if (data.email) {
            const emailCard = document.querySelectorAll('.contact-info-card')[0]?.querySelector('p');
            if (emailCard) emailCard.textContent = data.email;
        }

        if (data.social_links) {
            const links = data.social_links.split(',');
            const githubCard = document.querySelectorAll('.contact-info-card')[1]?.querySelector('p');
            const linkedinCard = document.querySelectorAll('.contact-info-card')[2]?.querySelector('p');
            if (githubCard && links[0]) githubCard.textContent = links[0].trim();
            if (linkedinCard && links[1]) linkedinCard.textContent = links[1].trim();

            const footerSocials = document.querySelectorAll('.social-links a');
            if (footerSocials.length >= 3) {
                if (links[0]) footerSocials[0].href = links[0].trim().startsWith('http') ? links[0].trim() : `https://${links[0].trim()}`;
                if (links[1]) footerSocials[1].href = links[1].trim().startsWith('http') ? links[1].trim() : `https://${links[1].trim()}`;
                if (data.email) footerSocials[2].href = `mailto:${data.email}`;
            }
        }

        if (data.years_learning) {
            const yearsCard = document.querySelectorAll('.info-card')[0]?.querySelector('h3');
            if (yearsCard) yearsCard.textContent = data.years_learning;
        }

        if (data.projects_built) {
            const projectsCard = document.querySelectorAll('.info-card')[1]?.querySelector('h3');
            if (projectsCard) projectsCard.textContent = data.projects_built;
        }

        if (data.technologies_used) {
            const techCard = document.querySelectorAll('.info-card')[2]?.querySelector('h3');
            if (techCard) techCard.textContent = data.technologies_used;
        }
    } catch (err) {
        console.error("Error fetching portfolio data:", err);
    }
});