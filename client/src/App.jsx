import React, { useState, useEffect } from 'react';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  const [videoExpanded, setVideoExpanded] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const handleSmoothScroll = (e) => {
      const target = e.target;
      if (target.hash && target.hash.startsWith('#')) {
        e.preventDefault();
        const element = document.getElementById(target.hash.substring(1));
        if (element) {
          window.scrollTo({
            top: element.offsetTop - 80,
            behavior: 'smooth'
          });
        }
      }
    };

    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(anchor => {
      anchor.addEventListener('click', handleSmoothScroll);
    });

    return () => {
      links.forEach(anchor => {
        anchor.removeEventListener('click', handleSmoothScroll);
      });
    };
  }, []);

  const playVideo = () => {
    const video = document.getElementById('companyVideo');
    if (video) {
      video.play().catch(error => {
        console.error('Ошибка воспроизведения видео:', error);
      });
    }
  };

  const pauseVideo = () => {
    const video = document.getElementById('companyVideo');
    if (video) video.pause();
  };

  const toggleMute = () => {
    const video = document.getElementById('companyVideo');
    if (video) video.muted = !video.muted;
  };

  const toggleVideoSize = () => {
    setVideoExpanded(!videoExpanded);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('loading');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setFormStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => setFormStatus(null), 5000);
      } else {
        setFormStatus('error');
      }
    } catch (error) {
      console.error('Ошибка отправки:', error);
      setFormStatus('error');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="app">
      {/* Header */}
      <header>
        <div className="nav-container">
          <div className="logo">
            <img src="/LOGO.jpg" alt="ИнжКапСтрой" />
            <h1>
              <span className="company-name">
                <span className="accent-letter">И</span>нж
                <span className="accent-letter">К</span>ап
                <span className="accent-letter">С</span>трой
              </span>
            </h1>
          </div>
          
          <button 
            className="menu-toggle" 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Меню"
            type="button"
          >
            <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
          
          <nav>
            <ul className={menuOpen ? 'active' : ''}>
              <li><a href="#about" onClick={closeMenu}>О компании</a></li>
              <li><a href="#services" onClick={closeMenu}>Услуги</a></li>
              <li><a href="#projects" onClick={closeMenu}>Проекты</a></li>
              <li><a href="#bim" onClick={closeMenu}>BIM-технологии</a></li>
              <li><a href="#expertise" onClick={closeMenu}>Экспертиза</a></li>
              <li><a href="#contact" onClick={closeMenu}>Контакты</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero with Video */}
      <section className="hero">
        <div className="hero-content">
          <h2>Комплексное проектирование и надежность в реализации проектов</h2>
          <p>Команда из 30+ специалистов выполняет полный цикл проектных работ для объектов любого назначения</p>
        </div>
        <div className={`video-container ${videoExpanded ? 'expanded' : ''}`}>
          <div className="video-wrapper">
            <video id="companyVideo" controls>
              <source src="/Видео WhatsApp 2025-10-06 в 10.04.47_1fb514a4.mp4" type="video/mp4" />
              Ваш браузер не поддерживает видео.
            </video>
          </div>
          <div className="video-controls">
            <button className="video-btn" onClick={playVideo} type="button">
              <i className="fas fa-play"></i> Воспроизвести
            </button>
            <button className="video-btn" onClick={pauseVideo} type="button">
              <i className="fas fa-pause"></i> Пауза
            </button>
            <button className="video-btn" onClick={toggleMute} type="button">
              <i className="fas fa-volume-up"></i> Звук
            </button>
            <button className="video-btn" onClick={toggleVideoSize} type="button">
              <i className={`fas ${videoExpanded ? 'fa-compress' : 'fa-expand'}`}></i>
              {videoExpanded ? 'Обычный размер' : 'Развернуть'}
            </button>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about">
        <div className="container">
          <div className="section-title">
            <h2>О компании</h2>
            <p>ООО «<span className="company-name">
              <span className="accent-letter">И</span>нж
              <span className="accent-letter">К</span>ап
              <span className="accent-letter">С</span>трой
            </span>» предлагает комплексные решения от разработки концепции до ввода в эксплуатацию</p>
          </div>
          <div className="services-grid">
            <div className="service-card">
              <i className="fas fa-handshake service-icon"></i>
              <h3>СРО</h3>
              <p>Членство в СРО позволяет выполнять проектные работы стоимостью до 300 млн. рублей (третий уровень ответственности)</p>
            </div>
            <div className="service-card">
              <i className="fas fa-users service-icon"></i>
              <h3>Команда</h3>
              <p>Более 30-ти ведущих специалистов инженерного состава проектировщиков</p>
            </div>
            <div className="service-card">
              <i className="fas fa-hard-hat service-icon"></i>
              <h3>Проектные работы "под ключ"</h3>
              <p>Комплексное обследование зданий и сооружений, проведение инженерных изысканий и разработка проектной и рабочей документации с прохождением экспертизы</p>
            </div>
            <div className="service-card">
              <i className="fas fa-cube service-icon"></i>
              <h3>BIM-моделирование</h3>
              <p>Создание информационных моделей зданий и сооружений</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container">
          <div className="section-title">
            <h2>Наши услуги</h2>
            <p>Специализируемся на проектировании и реконструкции «под ключ»</p>
          </div>
          <div className="services-grid">
            <div className="service-card">
              <h3>Административно-бытовые объекты</h3>
              <p>Проектирование офисных зданий, бизнес-центров и административных комплексов</p>
            </div>
            <div className="service-card">
              <h3>Производственно-складские объекты</h3>
              <p>Создание проектов промышленных зданий, складов и логистических центров</p>
            </div>
            <div className="service-card">
              <h3>Социальные объекты</h3>
              <p>Проектирование учебных заведений, медицинских учреждений и объектов культуры</p>
            </div>
            <div className="service-card">
              <h3>Жилые и коммерческие объекты</h3>
              <p>Разработка проектов жилых комплексов, торговых центров и коммерческой недвижимости</p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects">
        <div className="container">
          <div className="section-title">
            <h2>Наши проекты</h2>
            <p>Реализовали свыше 20 крупных проектов общей площадью более 400,000 м²</p>
          </div>
          <div className="projects-grid">
            <div className="project-card">
              <div className="project-image">
                <img 
                  src="/Учебный корпус Ранхигс.png" 
                  alt="Учебный корпус РАНХиГС" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="project-content">
                <h3>Учебные корпуса РАНХиГС</h3>
                <p>Проектирование современных образовательных пространств</p>
                <div className="project-meta">
                  <span>Москва</span>
                  <span>15,800 м²</span>
                </div>
              </div>
            </div>
            
            <div className="project-card">
              <div className="project-image">
                <img 
                  src="/Производственная база.PNG" 
                  alt="Производственная база" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="project-content">
                <h3>Производственная база ГБУ «Жилищник района печатники»</h3>
                <p>Комплексное проектирование производственно-складского комплекса</p>
                <div className="project-meta">
                  <span>Москва</span>
                  <span>11,200 м²</span>
                </div>
              </div>
            </div>
            
            <div className="project-card">
              <div className="project-image">
                <img 
                  src="/Коттеджный поселок.jpg" 
                  alt="Коттеджный поселок МИР" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="project-content">
                <h3>Коттеджный поселок «МИР»</h3>
                <p>Проектирование современного жилого комплекса коттеджного типа</p>
                <div className="project-meta">
                  <span>Москва</span>
                  <span>25,000 м²</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BIM Technologies */}
      <section id="bim" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container">
          <div className="section-title">
            <h2>BIM-технологии</h2>
            <p>Используем передовые технологии информационного моделирования</p>
          </div>
          
          <div className="bim-intro" style={{ marginBottom: '30px', textAlign: 'center' }}>
            <h3>Основные преимущества BIM-технологий</h3>
            <p>Мы активно внедряем и используем BIM-технологии в наших проектах, что позволяет нам повысить эффективность, снизить затраты и обеспечить высочайшее качество.</p>
          </div>
          
          <div className="bim-grid">
            <div className="bim-card">
              <h3><i className="fas fa-database"></i> Единая информационная модель</h3>
              <p>BIM объединяет геометрию, технические данные, сроки и бюджет, обеспечивая полноту данных и прозрачность проекта.</p>
            </div>
            <div className="bim-card">
              <h3><i className="fas fa-calendar-alt"></i> Контроль сроков</h3>
              <p>Моделирование сроков позволяет оптимизировать процессы строительства и снизить риски.</p>
            </div>
            <div className="bim-card">
              <h3><i className="fas fa-calculator"></i> Точная смета и ресурсы</h3>
              <p>Использование BIM рассчитывает точные затраты на материалы и работы, предотвращая перерасход бюджета.</p>
            </div>
            <div className="bim-card">
              <h3><i className="fas fa-chart-line"></i> Повышение качества</h3>
              <p>BIM обеспечивает ясность проекта для всех участников, минимизируя ошибки и улучшая коммуникацию.</p>
            </div>
            <div className="bim-card">
              <h3><i className="fas fa-bullseye"></i> Высокая точность</h3>
              <p>BIM-моделирование позволяет достичь точности до миллиметра, исключая коллизии инженерных систем и конструкций на ранних этапах проектирования, что невозможно при традиционном 2D-черчении.</p>
            </div>
            <div className="bim-card">
              <h3><i className="fas fa-clock"></i> Снижение времени на внесение изменений</h3>
              <p>Автоматическая синхронизация всех разделов проекта при изменении любого элемента экономит до 70% времени по сравнению с ручной правкой чертежей. Изменения в модели мгновенно отражаются во всех видах и спецификациях.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise */}
      <section id="expertise">
        <div className="container">
          <div className="section-title">
            <h2>Опыт прохождения экспертиз</h2>
            <p>Успешное прохождение экспертиз различного уровня</p>
          </div>
          <div className="expertise-grid">
            <div className="expertise-item">
              <h3>ГАУ «Московская государственная экспертиза»</h3>
              <p>Согласование проектов на территории Москвы</p>
            </div>
            <div className="expertise-item">
              <h3>ФАУ «Главгосэкспертиза России»</h3>
              <p>Экспертиза федеральных объектов</p>
            </div>
            <div className="expertise-item">
              <h3>ГАУ МО «Мособлгосэкспертиза»</h3>
              <p>Проекты в Московской области</p>
            </div>
            <div className="expertise-item">
              <h3>Ведомственные экспертизы</h3>
              <p>Специализированные ведомственные проверки</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="contact-section">
        <div className="container">
          <div className="section-title">
            <h2 style={{ color: 'white' }}>Свяжитесь с нами</h2>
            <p style={{ color: '#ccc' }}>Обсудим ваш проект и найдем оптимальное решение</p>
          </div>
          <div className="contact-container">
            <div className="contact-info">
              <h3>ООО «<span className="company-name">
                <span className="accent-letter">И</span>нж
                <span className="accent-letter">К</span>ап
                <span className="accent-letter">С</span>трой
              </span>»</h3>
              <p>Ваш надежный партнер в реализации строительных проектов любой сложности. Гарантируем качество и соблюдение сроков.</p>
              <div className="contact-details">
                <p><i className="fas fa-map-marker-alt"></i> г. Воронеж, ул. Революции 1905 года, д. 84а, оф. 202</p>
                <p><i className="fas fa-phone"></i> +7 (926) 879-71-03</p>
                <p><i className="fas fa-envelope"></i> info@inzhkapstroy.ru</p>
                <p><i className="fas fa-clock"></i> Пн-Пт: 9:00 - 18:00</p>
              </div>
            </div>
            <div className="contact-form">
              <h3>Заявка на консультацию</h3>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="Ваше имя"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Ваш email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Ваш телефон"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <textarea
                  name="message"
                  placeholder="Опишите ваш проект или задайте вопрос..."
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
                <button type="submit" disabled={formStatus === 'loading'}>
                  {formStatus === 'loading' ? 'Отправка...' : 'Получить консультацию'}
                </button>
              </form>

              {formStatus === 'success' && (
                <div className="form-success">
                  <i className="fas fa-check-circle"></i>
                  Заявка отправлена! Мы свяжемся с вами в течение 2 часов.
                </div>
              )}
              
              {formStatus === 'error' && (
                <div className="form-error">
                  <i className="fas fa-exclamation-triangle"></i>
                  Ошибка отправки. Пожалуйста, попробуйте еще раз.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <p>&copy; 2024 ООО «<span className="company-name">
            <span className="accent-letter">И</span>нж
            <span className="accent-letter">К</span>ап
            <span className="accent-letter">С</span>трой
          </span>». Все права защищены.</p>
          <p>Комплексное проектирование, BIM-моделирование и строительство объектов любой сложности</p>
        </div>
      </footer>
    </div>
  );
}

export default App;