// Main JavaScript for Landing Page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS (Animate on Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });
    
    // 3D Tilt Effect for Feature Cards
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const xPercent = x / rect.width;
            const yPercent = y / rect.height;
            
            const rotateX = (0.5 - yPercent) * 10;
            const rotateY = (xPercent - 0.5) * 10;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
            this.style.boxShadow = `0 15px 35px rgba(0, 0, 0, 0.2), ${rotateY/2}px ${rotateX/2}px 15px rgba(0, 0, 0, 0.1)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
        });
    });
    
    // Floating animation for hero section elements
    const heroElements = document.querySelectorAll('.hero-content h1, .hero-content p, .cta-button');
    
    heroElements.forEach((element, index) => {
        element.style.animation = `float ${2 + index * 0.2}s ease-in-out infinite alternate`;
        element.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            window.scrollTo({
                top: targetSection.offsetTop - 80,
                behavior: 'smooth'
            });
        });
    });
    
    // Parallax effect for background
    window.addEventListener('scroll', function() {
        const scrollPosition = window.pageYOffset;
        const heroSection = document.querySelector('.hero');
        
        if (heroSection) {
            heroSection.style.backgroundPositionY = `${scrollPosition * 0.5}px`;
        }
    });
    
    // Interactive chart preview animation
    const chartPreview = document.querySelector('.chart-preview');
    
    if (chartPreview) {
        // Create a simple 3D chart preview using Three.js
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, chartPreview.clientWidth / chartPreview.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        renderer.setSize(chartPreview.clientWidth, chartPreview.clientHeight);
        chartPreview.appendChild(renderer.domElement);
        
        // Create bar chart
        const barGeometry = [];
        const barMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x4285f4,
            specular: 0x4285f4,
            shininess: 30,
            transparent: true,
            opacity: 0.8
        });
        
        const bars = [];
        const barCount = 5;
        
        for (let i = 0; i < barCount; i++) {
            const height = Math.random() * 2 + 1;
            const geometry = new THREE.BoxGeometry(0.5, height, 0.5);
            const bar = new THREE.Mesh(geometry, barMaterial);
            
            bar.position.x = (i - barCount / 2) * 1.2;
            bar.position.y = height / 2;
            
            scene.add(bar);
            bars.push(bar);
            barGeometry.push(geometry);
        }
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);
        
        camera.position.z = 5;
        
        // Animation
        function animate() {
            requestAnimationFrame(animate);
            
            bars.forEach((bar, index) => {
                bar.rotation.y += 0.01;
                
                // Animate bar height
                const time = Date.now() * 0.001;
                const newHeight = Math.sin(time + index) * 0.5 + 1.5;
                
                barGeometry[index].dispose();
                barGeometry[index] = new THREE.BoxGeometry(0.5, newHeight, 0.5);
                bar.geometry = barGeometry[index];
                bar.position.y = newHeight / 2;
            });
            
            renderer.render(scene, camera);
        }
        
        animate();
        
        // Handle window resize
        window.addEventListener('resize', function() {
            camera.aspect = chartPreview.clientWidth / chartPreview.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(chartPreview.clientWidth, chartPreview.clientHeight);
        });
    }
    
    // Testimonial slider
    const testimonials = document.querySelectorAll('.testimonial');
    const dotsContainer = document.querySelector('.slider-dots');
    let currentIndex = 0;
    
    // Create dots
    if (testimonials.length > 0 && dotsContainer) {
        testimonials.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            
            dot.addEventListener('click', () => {
                showTestimonial(index);
            });
            
            dotsContainer.appendChild(dot);
        });
    }
    
    function showTestimonial(index) {
        testimonials.forEach((testimonial, i) => {
            testimonial.style.display = i === index ? 'block' : 'none';
        });
        
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        
        currentIndex = index;
    }
    
    // Auto-rotate testimonials
    if (testimonials.length > 1) {
        setInterval(() => {
            currentIndex = (currentIndex + 1) % testimonials.length;
            showTestimonial(currentIndex);
        }, 5000);
    }
});
