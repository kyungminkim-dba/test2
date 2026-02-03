// 메인 JavaScript 파일

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', () => {
    initTypingAnimation();
    initScrollAnimations();
    initNavigation();
    initMobileMenu();
    initContactForm();
    initSkillProgress();
});

// 타이핑 애니메이션
function initTypingAnimation() {
    const typingElement = document.getElementById('typing-text');
    if (!typingElement) return;

    const texts = [
        '프론트엔드 개발자',
        '백엔드 개발자',
        '풀스택 개발자',
        '문제 해결사'
    ];

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const pauseTime = 2000;

    function type() {
        const currentText = texts[textIndex];

        if (isDeleting) {
            // 글자 삭제
            typingElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;

            if (charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                setTimeout(type, 500);
                return;
            }
        } else {
            // 글자 추가
            typingElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;

            if (charIndex === currentText.length) {
                isDeleting = true;
                setTimeout(type, pauseTime);
                return;
            }
        }

        setTimeout(type, isDeleting ? deletingSpeed : typingSpeed);
    }

    // 타이핑 시작
    setTimeout(type, 1000);
}

// 스크롤 애니메이션 (Intersection Observer)
function initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // 한 번 보이면 더 이상 관찰하지 않음
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(element => {
        observer.observe(element);
    });
}

// 네비게이션 기능
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    // 스크롤 시 네비게이션 스타일 변경
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }

        // 현재 섹션 하이라이트
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;

            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // 부드러운 스크롤 (네비게이션 링크 클릭 시)
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 64; // 네비게이션 높이만큼 오프셋
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }

            // 모바일 메뉴 닫기
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu && mobileMenu.classList.contains('show')) {
                mobileMenu.classList.remove('show');
                mobileMenu.classList.add('hidden');
            }
        });
    });
}

// 모바일 메뉴 토글
function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (!menuBtn || !mobileMenu) return;

    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        mobileMenu.classList.toggle('show');

        // 아이콘 변경
        const icon = menuBtn.querySelector('i');
        if (mobileMenu.classList.contains('show')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // 모바일 메뉴 링크 클릭 시 메뉴 닫기
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('show');
            const icon = menuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });
}

// 연락 폼 처리
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // 폼 데이터 수집
        const formData = {
            name: form.querySelector('#name').value,
            email: form.querySelector('#email').value,
            message: form.querySelector('#message').value
        };

        // 버튼 로딩 상태
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span> 전송 중...';
        submitBtn.disabled = true;

        // 폼 제출 시뮬레이션 (실제로는 백엔드 API 호출)
        setTimeout(() => {
            // 성공 메시지 표시
            const successMessage = document.createElement('div');
            successMessage.className = 'form-success mt-4';
            successMessage.innerHTML = '<i class="fas fa-check-circle mr-2"></i>메시지가 성공적으로 전송되었습니다!';
            form.appendChild(successMessage);

            // 폼 초기화
            form.reset();

            // 버튼 복원
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            // 성공 메시지 3초 후 제거
            setTimeout(() => {
                successMessage.remove();
            }, 3000);

            console.log('폼 데이터:', formData);
        }, 1500);
    });
}

// 스킬 프로그레스 바 애니메이션
function initSkillProgress() {
    const skillBars = document.querySelectorAll('.skill-progress');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progress = entry.target.getAttribute('data-progress');
                entry.target.style.width = `${progress}%`;
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    skillBars.forEach(bar => {
        observer.observe(bar);
    });
}

// 페이지 로드 시 Hero 섹션으로 스크롤 (새로고침 시)
window.addEventListener('load', () => {
    // URL에 해시가 없으면 최상단으로
    if (!window.location.hash) {
        window.scrollTo(0, 0);
    }
});
